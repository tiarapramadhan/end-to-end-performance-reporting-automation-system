# ⚙️ Installation Guide

Panduan ini menjelaskan cara menjalankan sistem automasi menggunakan Google Apps Script.

---

# Prerequisites

Sebelum memulai, pastikan Anda memiliki:

- Google Account
- Google Form
- Google Spreadsheet (hasil response Google Form)
- Google Drive
- Google Calendar
- Google Apps Script

---

# Step 1 — Create Google Form

Buat Google Form sesuai kebutuhan organisasi.

Pastikan form menggunakan **Google Spreadsheet** sebagai tempat penyimpanan response.

---

# Step 2 — Open Google Apps Script

Dari Google Spreadsheet:

Extensions

→ Apps Script

---

# Step 3 — Copy Script

Salin seluruh isi file berikut ke dalam project Apps Script.

```
automation/main.gs
```

---

# Step 4 — Configure Master Folder

Ubah nilai berikut sesuai Folder Google Drive yang digunakan sebagai penyimpanan utama.

```javascript
var MASTER_FOLDER_ID = "YOUR_MASTER_FOLDER_ID";
```

Masukkan Folder ID dari Google Drive.

Contoh:

```
https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz
```

Folder ID:

```
1AbCdEfGhIjKlMnOpQrStUvWxYz
```

---

# Step 5 — Save Project

Klik

File → Save

atau tekan

```
Ctrl + S
```

---

# Step 6 — Create Trigger

Pada Apps Script:

Triggers

→ Add Trigger

Gunakan konfigurasi berikut.

| Setting | Value |
|---------|-------|
| Function | autoCreateCalendarAndSendEmail |
| Deployment | Head |
| Event Source | From Spreadsheet |
| Event Type | On Form Submit |

---

# Step 7 — Authorize Access

Saat pertama kali dijalankan, Google akan meminta beberapa izin akses.

Sistem memerlukan akses ke:

- Google Drive
- Google Calendar
- Gmail
- Google Spreadsheet

Berikan seluruh permission agar automation dapat berjalan dengan benar.

---

# Step 8 — Test

Lakukan satu kali submit menggunakan Google Form.

Pastikan sistem berhasil:

- membuat event di Google Calendar
- mengirim email konfirmasi
- memindahkan file ke Google Drive
- mengganti nama file
- menandai response sebagai **PROCESSED**

---

# Installation Complete

Apabila seluruh langkah di atas berhasil dilakukan, sistem siap digunakan untuk memproses setiap response Google Form secara otomatis.
