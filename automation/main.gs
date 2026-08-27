/**
 * =====================================================================
 * [OFFC] ACR MASTER GOVERNANCE - AUTOMATION SCRIPT (v4)
 * =====================================================================
 * Struktur sheet output (semua header ditentukan manual oleh script
 * ini, JADI DIJAMIN TIDAK PERNAH ADA HEADER DUPLIKAT untuk Looker):
 *
 *  - Data_Overview             -> SEMUA submission, semua jalur, kolom
 *                                 umum saja (buat Page 1: ringkasan
 *                                 eksekutif / dashboard atasan)
 *  - Data_Weekly               -> jalur Weekly Update
 *  - Data_Monthly              -> ringkasan umum semua divisi Monthly
 *  - Data_Divisi_[NamaDivisi]  -> detail metrik per divisi (Monthly)
 *                                 -> Page 3 dst, 1 sheet = 1 page divisi
 *  - Data_AdHoc                -> jalur Ad Hoc Document
 *  - Data_Event                -> jalur Event/PMO Fast Report
 *                                 -> SENGAJA terpisah dari Data_Divisi_PMO
 *                                    & Data_Divisi_PR, karena event bisa
 *                                    dijalankan divisi manapun, bukan cuma
 *                                    PMO/PR
 *  - Data_Link                 -> GABUNGAN semua link (manual paste +
 *                                 link Drive dari file yang diupload +
 *                                 quick link), dari SEMUA jalur, 1 baris
 *                                 = 1 link -> Page 2: direktori link/dok
 *  - Error_Log                 -> catatan error otomatis
 *
 * Sheet "Form Responses 1" TIDAK dipakai sebagai sumber Looker lagi.
 * =====================================================================
 */

// ⚠️ KONFIGURASI — GANTI SESUAI ORGANISASI ANDA SEBELUM DIPAKAI
// Cara dapetin Master Folder ID: buka folder Drive tujuan di browser,
// copy bagian ID di URL-nya, contoh:
// https://drive.google.com/drive/folders/<INI_FOLDER_ID_NYA>
var MASTER_FOLDER_ID = "YOUR_MASTER_FOLDER_ID_HERE";

// Daftar Calendar ID tujuan sync. Bisa email akun Google biasa (jadi
// primary calendar akun itu) atau Calendar ID khusus (Settings > 
// Integrate calendar > Calendar ID). Kalender ini WAJIB di-share ke
// akun pemilik script dengan izin "Make changes to events".
var ERROR_LOG_SHEET_NAME = "Error_Log";

var CALENDAR_IDS = [
  "your-calendar-1@example.com",
  "your-calendar-2@example.com"
];

/**
 * =====================================================================
 * SETUP - JALANKAN SEKALI SECARA MANUAL DARI EDITOR
 * =====================================================================
 */
function setupTrigger() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (t) {
    if (t.getHandlerFunction() === "autoCreateCalendarAndSendEmail") {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger("autoCreateCalendarAndSendEmail")
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  CALENDAR_IDS.forEach(function (calId) {
    try {
      var cal = CalendarApp.getCalendarById(calId);
      if (!cal) {
        Logger.log("❌ Kalender TIDAK DITEMUKAN atau TIDAK ADA AKSES: " + calId);
      } else {
        Logger.log("✅ Kalender OK, bisa diakses: " + calId + " (" + cal.getName() + ")");
      }
    } catch (err) {
      Logger.log("❌ ERROR akses kalender " + calId + ": " + err.toString());
    }
  });

  Logger.log("Setup selesai. Cek log di atas untuk status akses kalender.");
}

/**
 * Debug tool: cek header + value kolom tertentu di baris terakhir.
 * Jalankan manual kalau ada kolom yang "ga kebaca" sama script.
 */
function debugHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Form Responses 1");
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowData = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];

  for (var i = 0; i < headers.length; i++) {
    var h = headers[i] ? headers[i].toString() : "";
    Logger.log("Kolom #" + (i + 1) + " -> HEADER: " + JSON.stringify(h) + " | VALUE: " + JSON.stringify(rowData[i]));
  }
}

function autoCreateCalendarAndSendEmail(e) {
  try {
    if (!e || !e.range) {
      Logger.log("Fungsi ini harus dijalankan otomatis via Trigger Form Submit.");
      return;
    }

    var sheet = e.range.getSheet();
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var rowData = e.values;
    var timestamp = new Date();
    var currentRow = e.range.getRow();

    // --- 0. DUPLICATE-RUN PROTECTION ---
    // Mencegah 1 submission yang sama diproses 2x kalau Apps Script
    // retry otomatis (misal karena timeout/quota). BUKAN untuk mencegah
    // orang submit form 2x secara manual (itu memang 2 laporan valid
    // yang berbeda, wajar diproses 2x).
    var statusColIndex = getOrCreateStatusColumn(sheet, headers);
    var currentStatus = sheet.getRange(currentRow, statusColIndex).getValue();
    if (currentStatus === "PROCESSED") {
      Logger.log("SKIP DUPLICATE: Baris " + currentRow + " sudah pernah diproses sebelumnya, dilewati.");
      return;
    }

    function normalizeSpace(str) {
      return str.toString().toLowerCase().trim().replace(/\s+/g, " ");
    }

    function getAnyDataByKeywords(keywordsArray) {
      for (var k = 0; k < keywordsArray.length; k++) {
        var kw = normalizeSpace(keywordsArray[k]);
        for (var i = 0; i < headers.length; i++) {
          var h = normalizeSpace(headers[i]);
          if (h.includes(kw) && rowData[i] && rowData[i].toString().trim() !== "") {
            return rowData[i].toString().trim();
          }
        }
      }
      return "";
    }

    function getRawDataByKeywords(keywordsArray) {
      for (var k = 0; k < keywordsArray.length; k++) {
        var kw = normalizeSpace(keywordsArray[k]);
        for (var i = 0; i < headers.length; i++) {
          var h = normalizeSpace(headers[i]);
          var val = rowData[i];
          var isEmpty = (val === null || val === undefined || val.toString().trim() === "");
          if (h.includes(kw) && !isEmpty) {
            return val;
          }
        }
      }
      return null;
    }

    function logError(context, message) {
      try {
        var ssLocal = SpreadsheetApp.getActiveSpreadsheet();
        var logSheet = getOrCreateSheet(ssLocal, ERROR_LOG_SHEET_NAME,
          ["Timestamp", "Context", "Error Message"]);
        logSheet.appendRow([new Date(), context, message]);
      } catch (logErr) {
        Logger.log("Gagal menulis Error_Log: " + logErr.toString());
      }
      Logger.log("[" + context + "] " + message);
    }

    // --- 1. DATA DASAR ---
    var emailUser = getAnyDataByKeywords(["Email Address", "Email"]);
    var divisiRaw = getAnyDataByKeywords(["Divisi"]);
    var pic = getAnyDataByKeywords(["PIC"]);
    var jenisUpdateRaw = getAnyDataByKeywords(["Jenis Update"]);
    var divisi = cleanDivisiName(divisiRaw);
    var jenis = (jenisUpdateRaw || "").toLowerCase();

    // --- 2. DATA CALENDAR (RAW, jaga tipe Date) ---
    var agendaTanggalRaw = getRawDataByKeywords([
      "Agenda Meeting / Event (Calendar Sync)",
      "Target Tanggal Execution",
      "Target Tanggal Release",
      "Target Tanggal Pelaksanaan",
      "Target Tanggal / Deadline Utama",
      "Target Tanggal Deploy",
      "Tanggal Pelaksanaan"
    ]);
    var judulEvent = getAnyDataByKeywords([
      "Judul Event / Meeting",
      "Keterangan Tanggal / Judul Event",
      "Keterangan tanggal",
      "Nama Program / Event"
    ]);
    var jamEventRaw = getRawDataByKeywords(["Jam Event / Meeting"]);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var linkRows = []; // dikumpulkan sepanjang proses, ditulis ke Data_Link di akhir

    // --- 3. DRIVE: pindahin file + catat link Drive-nya ke Data_Link ---
    try {
      var masterFolder = DriveApp.getFolderById(MASTER_FOLDER_ID);
      var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

      for (var colIdx = 0; colIdx < headers.length; colIdx++) {
        var cellVal = rowData[colIdx];
        if (cellVal && cellVal.toString && (cellVal.toString().indexOf("drive.google.com") !== -1 || cellVal.toString().indexOf("open?id=") !== -1)) {
          var headerName = headers[colIdx].toString();
          var isKpi = headerName.toLowerCase().includes("kpi") || headerName.toLowerCase().includes("tracker");

          var targetFolder = getTargetFolder(masterFolder, divisi, jenisUpdateRaw, isKpi);
          var fileIds = extractFileIds(cellVal.toString());

          fileIds.forEach(function (fileId) {
            try {
              var file = DriveApp.getFileById(fileId);
              var originalName = file.getName();

              var cleanDivisiForFilename = divisi.replace(/[^a-zA-Z0-9]/g, "");
              if (!originalName.startsWith(todayStr + "_" + cleanDivisiForFilename)) {
                var newName = todayStr + "_" + cleanDivisiForFilename + "_" + originalName;
                file.setName(newName);
              }

              file.moveTo(targetFolder);
              Logger.log("FILE MOVED: " + file.getName() + " -> " + targetFolder.getName());

              linkRows.push([timestamp, divisi, jenisUpdateRaw, file.getName(), file.getUrl(), "File Upload"]);
            } catch (fErr) {
              logError("DRIVE_FILE", "File ID " + fileId + ": " + fErr.toString());
            }
          });
        }
      }
    } catch (driveErr) {
      logError("DRIVE_FOLDER", driveErr.toString());
    }

    // --- 4. CALENDAR SYNC ---
    // Aturan: kalau form section itu punya kolom "Jam Event / Meeting" DAN
    // terisi -> bikin event dengan jam spesifik (durasi 1 jam). Kalau
    // TIDAK ada kolom jam sama sekali (misal semua section Monthly &
    // Event/PMO memang tidak punya pertanyaan jam) -> bikin ALL-DAY EVENT,
    // supaya kalender tidak numpuk semua di jam 9 pagi.
    if (agendaTanggalRaw && judulEvent !== "") {
      var eventDate = parseFormDate(agendaTanggalRaw);

      if (eventDate && !isNaN(eventDate.getTime())) {
        var titleFormatted = "[" + (divisi || "FSJ") + "] " + judulEvent;
        var descriptionFormatted = "Dibuat otomatis via Master Governance Form\nJenis: " + jenisUpdateRaw + "\nPIC: " + pic;

        var jamDate = jamEventRaw ? parseFormDate(jamEventRaw) : null;
        var hasValidTime = jamDate && !isNaN(jamDate.getTime());

        if (hasValidTime) {
          // Ada jam spesifik -> event bertanda waktu, durasi 1 jam
          eventDate.setHours(jamDate.getHours(), jamDate.getMinutes(), 0, 0);
          var endDate = new Date(eventDate.getTime() + (60 * 60 * 1000));

          CALENDAR_IDS.forEach(function (calId) {
            try {
              var cal = CalendarApp.getCalendarById(calId);
              if (cal) {
                cal.createEvent(titleFormatted, eventDate, endDate, {
                  description: descriptionFormatted
                });
                Logger.log("SUCCESS CALENDAR (timed): Event berhasil dibuat di " + calId);
              } else {
                logError("CALENDAR", "Kalender tidak ditemukan / tidak ada akses: " + calId);
              }
            } catch (calErr) {
              logError("CALENDAR_PERMISSION", "Gagal buat event di " + calId + ": " + calErr.toString());
            }
          });
        } else {
          // Tidak ada jam -> all-day event, tanggal apa adanya
          CALENDAR_IDS.forEach(function (calId) {
            try {
              var cal = CalendarApp.getCalendarById(calId);
              if (cal) {
                cal.createAllDayEvent(titleFormatted, eventDate, {
                  description: descriptionFormatted
                });
                Logger.log("SUCCESS CALENDAR (all-day): Event berhasil dibuat di " + calId);
              } else {
                logError("CALENDAR", "Kalender tidak ditemukan / tidak ada akses: " + calId);
              }
            } catch (calErr) {
              logError("CALENDAR_PERMISSION", "Gagal buat all-day event di " + calId + ": " + calErr.toString());
            }
          });
        }
      } else {
        logError("CALENDAR_DATE", "Tanggal tidak valid -> raw value: " + agendaTanggalRaw);
      }
    } else {
      Logger.log("SKIP CALENDAR: Jalur ini tidak menyertakan tanggal/judul event.");
    }

    // --- 5. EMAIL KONFIRMASI ---
    if (emailUser !== "") {
      try {
        var subject = "[ACR System] Konfirmasi Laporan: " + jenisUpdateRaw + " - " + divisi;
        var htmlBody = "" +
          "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>" +
          "<h2 style='color: #1a73e8;'>Halo " + (pic || "Team") + ",</h2>" +
          "<p>Laporan <b>" + jenisUpdateRaw + "</b> untuk divisi <b>" + divisi + "</b> telah berhasil terekam di sistem Governance.</p>" +
          "<ul>" +
          "<li><b>Divisi:</b> " + divisi + "</li>" +
          "<li><b>PIC Laporan:</b> " + pic + "</li>" +
          "<li><b>Event/Agenda:</b> " + (judulEvent || "-") + "</li>" +
          "</ul>" +
          "<br><p>Terima kasih,<br><b>First Step Journey - ACR Management</b></p>" +
          "</div>";

        MailApp.sendEmail({ to: emailUser, subject: subject, htmlBody: htmlBody });
        Logger.log("SUCCESS EMAIL: Sent to " + emailUser);
      } catch (mailErr) {
        logError("EMAIL", mailErr.toString());
      }
    }

    // --- 6. KUMPULIN LINK MANUAL (dari kolom Link URL di berbagai section) ---
    try {
      var linkUtama = getAnyDataByKeywords(["Link URL Output / Asset"]);
      var judulLinkUtama = getAnyDataByKeywords(["Judul / Nama Link Utama"]);
      if (linkUtama !== "") {
        linkRows.push([timestamp, divisi, jenisUpdateRaw, judulLinkUtama || "(tanpa judul)", linkUtama, "Link Manual"]);
      }

      var linkQuick = getAnyDataByKeywords(["Link URL Asset"]);
      var judulLinkQuick = getAnyDataByKeywords(["Judul / Nama Link Asset"]);
      if (linkQuick !== "") {
        linkRows.push([timestamp, divisi, jenisUpdateRaw, judulLinkQuick || "(tanpa judul)", linkQuick, "Quick Link"]);
      }

      var linkRincianPeserta = getAnyDataByKeywords(["Link Detail Rincian Peserta"]);
      if (linkRincianPeserta !== "") {
        linkRows.push([timestamp, divisi, jenisUpdateRaw, "Detail Rincian Peserta", linkRincianPeserta, "Event Asset"]);
      }

      var linkFolderDok = getAnyDataByKeywords(["Folder Dokumentasi Event"]);
      var namaFolderDok = getAnyDataByKeywords(["Nama Link Folder Dokumentasi"]);
      if (linkFolderDok !== "") {
        linkRows.push([timestamp, divisi, jenisUpdateRaw, namaFolderDok || "Folder Dokumentasi Event", linkFolderDok, "Event Asset"]);
      }

      var linkSheet = getOrCreateSheet(ss, "Data_Link",
        ["Timestamp", "Divisi", "Jalur", "Judul/Nama Link", "URL", "Sumber"]);
      linkRows.forEach(function (row) {
        linkSheet.appendRow(row);
      });
    } catch (linkErr) {
      logError("DATA_LINK", linkErr.toString());
    }

    // --- 7. DATA_OVERVIEW: LOG SETIAP SUBMISSION (SEMUA JALUR, TANPA KECUALI) ---
    // Ini sumber data khusus untuk Page 1 dashboard (ringkasan eksekutif):
    // total laporan masuk, breakdown jenis update, breakdown isu, dst.
    // Ditulis TANPA IF sama sekali supaya selalu ke-log apapun jalurnya.
    try {
      writeCleanRow(ss, "Data_Overview", [
        ["Timestamp", timestamp],
        ["Divisi", divisi],
        ["PIC", pic],
        ["Jenis Update", jenisUpdateRaw],
        ["Ada Isu", getAnyDataByKeywords(["Apakah ada isu"])],
        ["Kategori Isu", getAnyDataByKeywords(["Kategori Isu"])],
        ["Prioritas Isu", getAnyDataByKeywords(["prioritas Isu"])],
        ["Email Address", emailUser]
      ]);
    } catch (overviewErr) {
      logError("DATA_OVERVIEW", overviewErr.toString());
    }

    // --- 8. ROUTE KE SHEET DATA BERSIH (PER JALUR / PER DIVISI) ---
    try {
      routeToDataSheets(ss, divisi, jenis, timestamp, getAnyDataByKeywords);
    } catch (routeErr) {
      logError("DATA_ROUTER", routeErr.toString());
    }

    // --- 9. TANDAI BARIS INI SUDAH DIPROSES (penutup duplicate-run protection) ---
    try {
      sheet.getRange(currentRow, statusColIndex).setValue("PROCESSED");
    } catch (markErr) {
      logError("STATUS_MARK", markErr.toString());
    }

  } catch (err) {
    Logger.log("Error Utama: " + err.toString());
  }
}

/**
 * =====================================================================
 * ROUTER KE SHEET DATA BERSIH
 * =====================================================================
 */
function routeToDataSheets(ss, divisi, jenis, timestamp, getStr) {
  var divisiLower = divisi.toLowerCase();

  // ---------- WEEKLY ----------
  if (jenis.includes("weekly")) {
    writeCleanRow(ss, "Data_Weekly", [
      ["Timestamp", timestamp],
      ["Divisi", divisi],
      ["PIC", getStr(["PIC"])],
      ["Periode", getStr(["Periode"])],
      ["Output Utama Week Ini", getStr(["output utama pada week"])],
      ["Status Pekerjaan", getStr(["Status Pekerjaan"])],
      ["Progress (%)", getStr(["Progress"])],
      ["Task Selesai Week Ini", getStr(["Jumlah Task Selesai"])],
      ["Target Task Depan", getStr(["Jumlah Target Task"])],
      ["Ada Isu", getStr(["Apakah ada isu"])],
      ["Kategori Isu", getStr(["Kategori Isu"])],
      ["Prioritas Isu", getStr(["prioritas Isu"])],
      ["Butuh Support Divisi Lain", getStr(["Membutuhkan Support Divisi Lain"])],
      ["Divisi yang Dibutuhkan", getStr(["Divisi yang dibutuhkan"])]
    ]);
    return;
  }

  // ---------- MONTHLY: OVERVIEW UMUM ----------
  if (jenis.includes("monthly")) {
    writeCleanRow(ss, "Data_Monthly", [
      ["Timestamp", timestamp],
      ["Divisi", divisi],
      ["Bulan", getStr(["Bulan"])],
      ["Pencapaian Terbesar", getStr(["Pencapaian terbesar"])],
      ["Lesson Learned", getStr(["Lesson Learned"])]
    ]);

    // ---------- MONTHLY: DETAIL PER DIVISI ----------
    if (divisiLower.includes("digital marketing")) {
      writeCleanRow(ss, "Data_Divisi_DigitalMarketing", [
        ["Timestamp", timestamp],
        ["Sub-Divisi", getStr(["Sub-Divisi / Specialist Digimar"])],
        ["Nama Campaign", getStr(["Nama Campaign"])],
        ["Status Campaign", getStr(["Status Campaign"])],
        ["Target Tanggal", getStr(["Target Tanggal Release"])],
        ["Total Konten Terpublikasi", getStr(["Total Konten Terpublikasi"])],
        ["Total Reach Konten", getStr(["Total Reach Konten"])],
        ["Average Engagement Rate", getStr(["Average Engagement Rate"])],
        ["Total Post LinkedIn", getStr(["Total Post Terpublikasi"])],
        ["Total Impressions LinkedIn", getStr(["Total Impressions"])],
        ["Total Broadcast/Leads CRM", getStr(["Total Broadcast Sent"])],
        ["Average Open/Click Rate CRM", getStr(["Average Open Rate"])],
        ["Peak Viewers Live Stream", getStr(["Peak Concurrent Viewers"])],
        ["Evaluasi Performance", getStr(["Evaluasi Performance"])],
        ["Next Action Plan", getStr(["Next Action Plan & Strategy Adjustments"])]
      ]);
    } else if (divisiLower.includes("visual brand")) {
      writeCleanRow(ss, "Data_Divisi_VBC", [
        ["Timestamp", timestamp],
        ["Sub-Divisi", getStr(["Sub-Divisi / Role VBC"])],
        ["Nama Program/Inisiatif", getStr(["Nama Program / Inisiatif VBC"])],
        ["Objective", getStr(["Objective (Tujuan Inisiatif)"])],
        ["Sasaran/Target Audiens", getStr(["Sasaran / Target Audiens"])],
        ["Target Tanggal Pelaksanaan", getStr(["Target Tanggal Pelaksanaan"])],
        ["Status Progress Project", getStr(["Status Progress Project"])],
        ["Tim Penanggung Jawab", getStr(["Tim Penanggung Jawab (Team)"])],
        ["Total Asset Desain Sosmed", getStr(["Total Asset Desain Sosmed"])],
        ["Total Design Event/Collab", getStr(["Total Design Event / Collaboration"])],
        ["Status/Evaluasi Project", getStr(["Status / Evaluasi Project"])]
      ]);
    } else if (divisiLower.includes("pr & project") || divisiLower.includes("pr and project")) {
      writeCleanRow(ss, "Data_Divisi_PR", [
        ["Timestamp", timestamp],
        ["Sub-Divisi/Role", getStr(["Sub-Divisi / Role Specialist"])],
        ["Nama Inisiatif", getStr(["Nama Inisiatif / Partnership / Event PR"])],
        ["Scope PR/Project", getStr(["Scope PR / Project"])],
        ["Sasaran/Target Impact", getStr(["Sasaran / Target Impact"])],
        ["Target Tanggal", getStr(["Target Tanggal Execution / Deal Release"])],
        ["Status Progress", getStr(["Status Progress"])],
        ["Tim Penanggung Jawab", getStr(["Tim Penanggung Jawab (PIC & Coach)"])],
        ["Total Partner/Media Contacted", getStr(["Total Partner / Media Contacted"])],
        ["Total Deals Completed", getStr(["Total Deals Completed"])],
        ["Total Event Execution", getStr(["Total Event Execution Completed"])],
        ["Detail Progress & Evaluasi", getStr(["Detail Progress Update, Capaian & Evaluasi Partnership"])],
        ["Next Action Plan", getStr(["Next Action Plan & Strategy Adjustments"])]
      ]);
    } else if (divisiLower.includes("sustainability") || divisiLower.includes("esg")) {
      writeCleanRow(ss, "Data_Divisi_ESG", [
        ["Timestamp", timestamp],
        ["Sub-Focus ESG", getStr(["Sub-Focus / Sub-Divisi ESG"])],
        ["Nama Program/Inisiatif", getStr(["Nama Program / Inisiatif ESG"])],
        ["Focus Area ESG", getStr(["Focus Area ESG"])],
        ["Target Tanggal", getStr(["Target Tanggal Pelaksanaan / Deadline"])],
        ["Status Project", getStr(["Status Project"])],
        ["Sasaran/Target Impact", getStr(["Sasaran / Target Impact"])],
        ["Detail Progress & Capaian", getStr(["Detail Progress Update & Capaian"])],
        ["Tim Penanggung Jawab", getStr(["Tim Penanggung Jawab & Coach"])],
        ["Total Respondent/Field Data", getStr(["Total Respondent / Field Data Collected"])],
        ["Total Research Paper/Report", getStr(["Total Research Paper / Report Output"])],
        ["Total Partnership Contacted", getStr(["Total Partnership / Partner Contacted"])],
        ["Evaluasi Project & Obstacles", getStr(["Evaluasi Project & Obstacles"])],
        ["Next Action Plan", getStr(["Next Action Plan & Strategy Adjustments"])]
      ]);
    } else if (divisiLower.includes("program management") || divisiLower.includes("pmo")) {
      writeCleanRow(ss, "Data_Divisi_PMO", [
        ["Timestamp", timestamp],
        ["Sub-Divisi/Program PMO", getStr(["Sub-Divisi / Program PMO"])],
        ["Nama Program/Event/Project", getStr(["Nama Program / Event / Project Update"])],
        ["Jenis Activity/Focus Milestone", getStr(["Jenis Activity / Focus Milestone"])],
        ["Sasaran/Target Impact", getStr(["Sasaran / Target Impact"])],
        ["Target Tanggal", getStr(["Target Tanggal Execution / Event Date"])],
        ["Status Execution", getStr(["Status Execution"])],
        ["Tim Penanggung Jawab", getStr(["Tim Penanggung Jawab & Coach"])],
        ["Total Peserta/Registrant", getStr(["Total Peserta / Registrant Event"])],
        ["Total Project/Task On-Time", getStr(["Total Project / Task Completed On-Time"])],
        ["Overall Timeline Health (%)", getStr(["Overall Project Timeline Health"])],
        ["Detail Progress & Risk Eval", getStr(["Detail Progress Update, Capaian & Risk Evaluation"])],
        ["Next Action & Mitigasi", getStr(["Next Action Plan & Mitigation Strategy"])]
      ]);
    } else if (divisiLower.includes("human resource")) {
      writeCleanRow(ss, "Data_Divisi_HR", [
        ["Timestamp", timestamp],
        ["Sub-Divisi/Focus HR", getStr(["Sub-Divisi / Focus HR"])],
        ["Nama Program/Inisiatif", getStr(["Nama Program / Inisiatif HR"])],
        ["Deskripsi & Objective", getStr(["Deskripsi Program & Objective"])],
        ["Sasaran/Target Audiens", getStr(["Sasaran / Target Audiens"])],
        ["Status Progress Program", getStr(["Status Progress Program"])],
        ["Tim Penanggung Jawab", getStr(["Tim Penanggung Jawab (Team)"])],
        ["Target Tanggal Pelaksanaan", getStr(["Target Tanggal Pelaksanaan"])],
        ["Total Pelamar/Evaluated", getStr(["Total Pelamar / Member Evaluated"])],
        ["Total Partisipan Culture", getStr(["Total Partisipan Event Culture"])],
        ["Total Peserta Training", getStr(["Total Peserta Training"])],
        ["Evaluasi Program", getStr(["Evaluasi Program"])],
        ["Tindak Lanjut", getStr(["Tindak Lanjut (Action Plan"])]
      ]);
    } else if (divisiLower.includes("administra")) {
      writeCleanRow(ss, "Data_Divisi_ACR", [
        ["Timestamp", timestamp],
        ["Sub-Divisi/Focus ACR", getStr(["Sub-Divisi / Focus ACR"])],
        ["Nama Program/Inisiatif", getStr(["Nama Program / Inisiatif"])],
        ["Objective & Operational Goals", getStr(["Objective & Operational Goals"])],
        ["Target Tanggal/Deadline", getStr(["Target Tanggal / Deadline Utama"])],
        ["Status Overall Project", getStr(["Status Overall Project"])],
        ["Progress Update", getStr(["Progress Update (Poin Capaian)"])],
        ["Tim Penanggung Jawab", getStr(["Tim Penanggung Jawab & Coach"])],
        ["Metrik Hasil Reporting", getStr(["Metrik Hasil Reporting"])],
        ["Metrik Hasil Dashboard", getStr(["Metrik Hasil Dashboard"])],
        ["Gap/Metrik Masalah (%)", getStr(["Gap / Metrik Masalah Operasional"])],
        ["Deskripsi Root Cause", getStr(["Deskripsi Root Cause"])],
        ["Operational Goals & Target", getStr(["Operational Goals & Target Impact"])]
      ]);
    } else if (divisiLower.includes("(website)")) {
      writeCleanRow(ss, "Data_Divisi_Website", [
        ["Timestamp", timestamp],
        ["Sub-Divisi/Tech Focus", getStr(["Sub-Divisi / Tech Focus"])],
        ["Nama Fitur/Module", getStr(["Nama Fitur / Module / System Update"])],
        ["Deskripsi Development", getStr(["Deskripsi Development & Purpose"])],
        ["Target Tanggal Deploy", getStr(["Target Tanggal Deploy / Release"])],
        ["Status Development", getStr(["Status Development"])],
        ["Tim Penanggung Jawab", getStr(["Tim Penanggung Jawab & Coach"])],
        ["Total Screens/Wireframe", getStr(["Total Screens / Wireframe Completed"])],
        ["Total Sprints/Issues", getStr(["Total Sprints Completed"])],
        ["Total Visitors/Page Views", getStr(["Total Visitors / Page Views"])],
        ["Technical Obstacles", getStr(["Technical Obstacles & System Evaluation"])]
      ]);
    } else if (divisiLower.includes("(product)")) {
      writeCleanRow(ss, "Data_Divisi_Product", [
        ["Timestamp", timestamp],
        ["Sub-Program Product", getStr(["Sub-Program Product"])],
        ["Nama Produk/Inisiatif", getStr(["Nama Produk / Inisiatif Product"])],
        ["Deskripsi & Objective", getStr(["Deskripsi Produk & Objective"])],
        ["Sasaran/Target Audiens", getStr(["Sasaran / Target Audiens"])],
        ["Target Tanggal Release", getStr(["Target Tanggal Release"])],
        ["Status Progress Project", getStr(["Status Progress Project"])],
        ["Tim Penanggung Jawab", getStr(["Tim Penanggung Jawab & Coach"])],
        ["Total Sesi/Member Terlayani", getStr(["Total Sesi / Member Terlayani"])],
        ["Total Active Users", getStr(["Total Active Users"])],
        ["Average Satisfaction Score", getStr(["Average Satisfaction Score"])],
        ["Evaluasi Operational", getStr(["Evaluasi Operational & Obstacles"])],
        ["Next Action Plan", getStr(["Next Action Plan & Improvement"])]
      ]);
    }
    return;
  }

  // ---------- AD HOC ----------
  if (jenis.includes("ad hoc") || jenis.includes("adhoc")) {
    writeCleanRow(ss, "Data_AdHoc", [
      ["Timestamp", timestamp],
      ["Divisi", divisi],
      ["PIC", getStr(["PIC"])],
      ["Jenis Dokumen", getStr(["Jenis Dokumen"])],
      ["Judul Dokumen", getStr(["Judul Dokumen"])],
      ["Keterangan", getStr(["Keterangan"])]
    ]);
    return;
  }

  // ---------- EVENT / PMO FAST REPORT ----------
  if (jenis.includes("event") || jenis.includes("pmo")) {
    writeCleanRow(ss, "Data_Event", [
      ["Timestamp", timestamp],
      ["Divisi", divisi],
      ["Nama Program/Event", getStr(["Nama Program / Event"])],
      ["Status/Kategori Event", getStr(["Status / Kategori Event"])],
      ["Tanggal Pelaksanaan", getStr(["Tanggal Pelaksanaan"])],
      ["Target Pendaftar", getStr(["Jumlah Pendaftar"])],
      ["Realisasi Peserta Hadir", getStr(["Jumlah Peserta Hadir"])],
      ["Jumlah Asal Universitas", getStr(["Jumlah asal Universitas"])],
      ["Jumlah Asal Daerah", getStr(["Jumlah asal Daerah"])]
    ]);
    return;
  }
}

function writeCleanRow(ss, sheetName, pairs) {
  var headerRow = pairs.map(function (p) { return p[0]; });
  var valueRow = pairs.map(function (p) { return p[1]; });
  var sheet = getOrCreateSheet(ss, sheetName, headerRow);
  sheet.appendRow(valueRow);
}

function getOrCreateStatusColumn(sheet, headers) {
  var STATUS_HEADER = "Status System";
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] && headers[i].toString().trim() === STATUS_HEADER) {
      return i + 1; // kolom 1-indexed
    }
  }
  var newCol = sheet.getLastColumn() + 1;
  sheet.getRange(1, newCol).setValue(STATUS_HEADER);
  return newCol;
}

function getOrCreateSheet(ss, sheetName, headerRow) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headerRow);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function parseFormDate(dateVal) {
  if (!dateVal) return null;
  if (Object.prototype.toString.call(dateVal) === '[object Date]') {
    return new Date(dateVal.getTime());
  }
  var str = dateVal.toString().trim();
  if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
    var parts = str.split("-");
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  if (str.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
    var p = str.split("/");
    return new Date(parseInt(p[2], 10), parseInt(p[0], 10) - 1, parseInt(p[1], 10));
  }
  var fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function cleanDivisiName(rawDivisi) {
  if (!rawDivisi) return "General Division";
  return rawDivisi.toString().replace(/^\d+\.\s*/, "").trim();
}

function getTargetFolder(masterFolder, divisiName, updateType, isKpi) {
  var divisiFolder = getOrCreateFolder(masterFolder, divisiName);
  var updateText = updateType ? updateType.toString().toLowerCase() : "";
  var level2Name = "AdHoc Documents";

  if (updateText.includes("weekly")) {
    level2Name = "Weekly Updates";
  } else if (updateText.includes("monthly")) {
    level2Name = "Monthly Updates";
  } else if (updateText.includes("event") || updateText.includes("pmo")) {
    level2Name = "Event Reports";
  }

  var level2Folder = getOrCreateFolder(divisiFolder, level2Name);

  if (level2Name === "Monthly Updates") {
    if (isKpi) {
      return getOrCreateFolder(level2Folder, "KPI & Progress Tracker");
    } else {
      return getOrCreateFolder(level2Folder, "Monthly Deliverables");
    }
  }
  return level2Folder;
}

function getOrCreateFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

function extractFileIds(urlText) {
  var ids = [];
  if (!urlText) return ids;
  var parts = urlText.split(",");
  parts.forEach(function (p) {
    var str = p.trim();
    var match = str.match(/[-\w]{25,}/);
    if (match) {
      ids.push(match[0]);
    }
  });
  return ids;
}
