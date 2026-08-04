/**
 * =============================================================================
 * Project Name : End-to-End Performance Reporting Automation System
 *
 * Description :
 * Google Apps Script solution that automates end-to-end performance reporting
 * workflows by integrating Google Forms, Google Sheets, Google Drive,
 * Google Calendar, and Gmail into a centralized reporting system.
 *
 * Key Features :
 * • Dynamic form submission processing
 * • Duplicate submission prevention
 * • Automated Google Calendar synchronization
 * • HTML email confirmation
 * • Automated Google Drive file organization
 * • Standardized file naming
 * • Dynamic folder hierarchy generation
 * • Status tracking for processed submissions
 *
 * Author :
 * Tiara Putri Ramadhani
 *
 * License :
 * MIT License
 * =============================================================================
 */

// Global Configuration
var MASTER_FOLDER_ID = "YOUR_MASTER_FOLDER_ID";

// ============================================================
// MODULE 1 — Duplicate Submission Prevention
// ============================================================

/**
 * Main Trigger Function: Runs automatically on every form submission (onFormSubmit).
 * Reads the latest response, checks for duplicates, maps dynamic headers,
 * syncs events to Google Calendar, sends email confirmations, and organizes files in Drive.
 *
 * @returns {void}
 */
function autoCreateCalendarAndSendEmail() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
  var lastRow = sheet.getLastRow();
  
  if (lastRow < 2) return;
  
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Locate or create the "Status System" column as a anti-duplicate marker
  var statusColIndex = headers.indexOf("Status System");
  if (statusColIndex === -1) {
    statusColIndex = headers.length;
    sheet.getRange(1, statusColIndex + 1).setValue("Status System");
  }
  
  var rowData = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  var currentStatus = rowData[statusColIndex];
  
  // ANTI-DUPLICATE PROTECTION: If this row has already been processed, STOP!
  if (currentStatus === "PROCESSED") {
    Logger.log("Row " + lastRow + " has already been processed. Canceled.");
    return;
  }
  
  // Column Index Mapping Based on Google Form Structure
  var emailUser = rowData[1];   // Column B: Email Address
  var jenisUpdate = rowData[2]; // Column C: Update Type (Weekly / Monthly / AdHoc)
  var divisi = rowData[5];      // Column F: Division
  var pic = rowData[6];         // Column G: PIC
  
  var tglIndex = -1, judulIndex = -1, jamIndex = -1, linkIndex = -1, isuIndex = -1;
  var generalUploadIndexes = [];
  var kpiUploadIndexes = [];
  
  // Dynamic Header Mapping
  for (var i = 0; i < headers.length; i++) {
    var h = headers[i].toString().toLowerCase();
    if (h.includes("tanggal event")) tglIndex = i;
    if (h.includes("judul event")) judulIndex = i;
    if (h.includes("jam event")) jamIndex = i;
    if (h.includes("upload seluruh") || h.includes("link google drive")) linkIndex = i;
    if (h.includes("kategori isu") || h.includes("issue")) isuIndex = i;
    
    // Specific Detection for KPI Tracker (Section 5)
    if (h.includes("kpi achievement") || h.includes("progress tracker")) {
      kpiUploadIndexes.push(i);
    } 
    // Detection for General Document / Deliverable Uploads
    else if (h.includes("upload") || h.includes("file") || h.includes("dokumen")) {
      generalUploadIndexes.push(i);
    }
  }
  
  // ==========================================
  // 1. AUTOMATED GOOGLE CALENDAR SYNC
  // ==========================================
  if (tglIndex !== -1 && rowData[tglIndex]) {
    var tanggalEvent = new Date(rowData[tglIndex]);
    var judulEvent = (judulIndex !== -1 && rowData[judulIndex]) ? rowData[judulIndex] : "Agenda " + divisi;
    var linkDoc = (linkIndex !== -1 && rowData[linkIndex]) ? rowData[linkIndex] : "Tidak ada lampiran link";
    
    var calendar = CalendarApp.getDefaultCalendar();
    var descriptionText = "Event diajukan via ACR Governance Form.\n\nPIC: " + pic + "\nDivisi: " + divisi + "\nLink Lampiran: " + linkDoc;
    
    if (jamIndex !== -1 && rowData[jamIndex]) {
      var jamString = rowData[jamIndex];
      if (jamString instanceof Date) {
        tanggalEvent.setHours(jamString.getHours(), jamString.getMinutes());
      }
      var endDate = new Date(tanggalEvent.getTime() + (60 * 60 * 1000));
      calendar.createEvent("[ACR] " + judulEvent, tanggalEvent, endDate, {description: descriptionText});
    } else {
      calendar.createAllDayEvent("[ACR] " + judulEvent, tanggalEvent, {description: descriptionText});
    }
  }
  
  // ==========================================
  // 2. AUTOMATED EMAIL CONFIRMATION
  // ==========================================
  if (emailUser && emailUser.includes("@")) {
    var kategoriIsu = (isuIndex !== -1 && rowData[isuIndex]) ? rowData[isuIndex] : "Tidak Ada Isu / Normal";
    
    var subject = "[ACR System] Konfirmasi Laporan: " + jenisUpdate + " - " + divisi;
    var htmlBody = "" +
      "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>" +
        "<h2 style='color: #1a73e8;'>Halo " + pic + ",</h2>" +
        "<p>Laporan <b>" + jenisUpdate + "</b> untuk divisi <b>" + divisi + "</b> telah berhasil kerekam di sistem ACR Governance.</p>" +
        "<hr style='border: 0; border-top: 1px solid #eee;' />" +
        "<ul>" +
          "<li><b>Divisi:</b> " + divisi + "</li>" +
          "<li><b>PIC Laporan:</b> " + pic + "</li>" +
          "<li><b>Status / Kategori Isu:</b> " + kategoriIsu + "</li>" +
        "</ul>" +
        "<p style='color: #555; font-size: 13px;'>Jika laporan berisi agenda/event, jadwal telah otomatis ter-sync ke Google Calendar ACR.</p>" +
        "<br><p>Terima kasih,<br><b>First Step Journey - ACR Management</b></p>" +
      "</div>";
      
    MailApp.sendEmail({
      to: emailUser,
      subject: subject,
      htmlBody: htmlBody
    });
  }

  // ==========================================
  // 3. DRIVE FOLDER ORGANIZATION ACCORDING TO NEW STRUCTURE
  // ==========================================
  
  // A. Process General Deliverables
  for (var j = 0; j < generalUploadIndexes.length; j++) {
    var colIdx = generalUploadIndexes[j];
    if (rowData[colIdx]) {
      autoSortDriveFilesCustom(rowData[colIdx], divisi, jenisUpdate, false);
    }
  }
  
  // B. Process Special KPI Tracker Files
  for (var k = 0; k < kpiUploadIndexes.length; k++) {
    var kpiColIdx = kpiUploadIndexes[k];
    if (rowData[kpiColIdx]) {
      autoSortDriveFilesCustom(rowData[kpiColIdx], divisi, jenisUpdate, true);
    }
  }
  
  // Mark the row so it won't be processed twice
  sheet.getRange(lastRow, statusColIndex + 1).setValue("PROCESSED");
}

// ============================================================
// MODULE 2 — Drive Storage Pipelines & File Archiving
// ============================================================

/**
 * Moves uploaded files to designated subfolders and renames them with a standardized prefix.
 *
 * @param {string} fileCellData
 * @param {string} divisiName
 * @param {string} updateType
 * @param {boolean} isKpiFile
 * @returns {void}
 */
function autoSortDriveFilesCustom(fileCellData, divisiName, updateType, isKpiFile) {
  try {
    if (!fileCellData || fileCellData.toString().trim() === "") return;
    
    var fileUrls = fileCellData.toString().split(",");
    var masterFolder = DriveApp.getFolderById(MASTER_FOLDER_ID);
    
    // Obtain target nested folder
    var targetFolder = getOrCreateSubFolder(masterFolder, divisiName, updateType, isKpiFile);
    
    var datePrefix = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    var cleanDivisi = divisiName ? divisiName.toString().replace(/[^a-zA-Z0-9_-]/g, "") : "Divisi";
    var cleanUpdate = updateType ? updateType.toString().replace(/[^a-zA-Z0-9_-]/g, "") : "Update";

    for (var m = 0; m < fileUrls.length; m++) {
      var rawUrl = fileUrls[m].trim();
      var fileId = extractFileIdFromUrl(rawUrl);
      
      if (fileId) {
        var file = DriveApp.getFileById(fileId);
        var originalName = file.getName();
        
        if (!originalName.startsWith(datePrefix)) {
          var newFileName = datePrefix + "_" + cleanDivisi + "_" + cleanUpdate + "_" + originalName;
          file.setName(newFileName);
        }
        
        file.moveTo(targetFolder);
      }
    }
  } catch (err) {
    Logger.log("Warning in autoSortDriveFilesCustom: " + err.toString());
  }
}

// ============================================================
// MODULE 3 — Nested Folder Hierarchy Builder
// ============================================================

/**
 * Builds nested sub-folder hierarchy according to organizational standards.
 *
 * @param {GoogleAppsScript.Drive.Folder} parentFolder
 * @param {string} divisiName
 * @param {string} updateType
 * @param {boolean} isKpiFile
 * @returns {GoogleAppsScript.Drive.Folder}
 */
function getOrCreateSubFolder(parentFolder, divisiName, updateType, isKpiFile) {
  var cleanDivisi = divisiName ? divisiName.toString().trim() : "Divisi Umum";
  var cleanUpdate = updateType ? updateType.toString().trim() : "General Update";
  
  // Level 1: Division Folder
  var divisiFolder = getChildFolder(parentFolder, cleanDivisi);
  
  // Level 2: Update Type Folder (1. Weekly / 2. Monthly / 3. AdHoc)
  var typeFolderName = cleanUpdate;
  if (cleanUpdate.toLowerCase().includes("weekly")) typeFolderName = "1. Weekly";
  else if (cleanUpdate.toLowerCase().includes("monthly")) typeFolderName = "2. Monthly";
  else if (cleanUpdate.toLowerCase().includes("adhoc") || cleanUpdate.toLowerCase().includes("ad hoc")) typeFolderName = "3. AdHoc";
  
  var typeFolder = getChildFolder(divisiFolder, typeFolderName);
  
  // Level 3: Special Separation inside Monthly Folder
  if (typeFolderName === "2. Monthly") {
    if (isKpiFile) {
      return getChildFolder(typeFolder, "KPI & Progress Tracker");
    } else {
      return getChildFolder(typeFolder, "Monthly Deliverables");
    }
  }
  
  return typeFolder;
}

// ============================================================
// MODULE 4 — Utility Helpers & String Extraction
// ============================================================

/**
 * Helper: Gets an existing subfolder by name or creates it if it does not exist.
 *
 * @param {GoogleAppsScript.Drive.Folder} parent
 * @param {string} childName
 * @returns {GoogleAppsScript.Drive.Folder}
 */
function getChildFolder(parent, childName) {
  var folders = parent.getFoldersByName(childName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parent.createFolder(childName);
  }
}

/**
 * Helper: Extracts Google Drive File ID from a URL string using standard pattern regex.
 *
 * @param {string} url
 * @returns {string|null}
 */
function extractFileIdFromUrl(url) {
  var match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}
