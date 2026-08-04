# ⏰ Trigger Configuration

Agar sistem dapat berjalan secara otomatis setiap kali terdapat response baru dari Google Form, Google Apps Script harus dikonfigurasi menggunakan **Installable Trigger**.

---

# Trigger Configuration

| Setting | Value |
|---------|-------|
| Function | `autoCreateCalendarAndSendEmail` |
| Deployment | Head |
| Event Source | From Spreadsheet |
| Event Type | On Form Submit |

---

# How to Create the Trigger

1. Buka project **Google Apps Script**.
2. Pilih menu **Triggers** pada sidebar kiri.
3. Klik **+ Add Trigger**.
4. Gunakan konfigurasi berikut:

- **Choose which function to run:** `autoCreateCalendarAndSendEmail`
- **Choose which deployment should run:** `Head`
- **Select event source:** `From Spreadsheet`
- **Select event type:** `On Form Submit`

5. Klik **Save**.
6. Berikan seluruh izin (authorization) yang diminta Google.

---

# Required Permissions

Saat pertama kali dijalankan, Apps Script akan meminta akses ke beberapa layanan Google.

Automation ini memerlukan izin untuk:

- Google Spreadsheet
- Google Drive
- Google Calendar
- Gmail

Seluruh permission diperlukan agar sistem dapat menjalankan setiap proses automation secara end-to-end.

---

# Trigger Workflow

```text
Google Form Submission
            │
            ▼
     On Form Submit Trigger
            │
            ▼
autoCreateCalendarAndSendEmail()
            │
            ├──────────────► Duplicate Check
            │
            ├──────────────► Google Calendar Sync
            │
            ├──────────────► Confirmation Email
            │
            ├──────────────► Drive File Organization
            │
            └──────────────► Mark as PROCESSED
```

---

# Notes

- Gunakan **Installable Trigger**, bukan **Simple Trigger**, karena project memerlukan akses ke Google Drive, Google Calendar, dan Gmail.
- Trigger hanya perlu dibuat **satu kali**. Setelah aktif, setiap response baru akan diproses secara otomatis.
- Mekanisme **duplicate prevention** memastikan setiap response hanya diproses satu kali dengan menambahkan status `PROCESSED` pada spreadsheet.
