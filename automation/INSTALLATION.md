# ⚙️ Installation Guide

Ikuti langkah berikut untuk menjalankan automasi menggunakan Google Apps Script.

## 1. Buat Google Spreadsheet

Pastikan Google Form telah terhubung dengan Google Sheets sebagai tempat penyimpanan response.

---

## 2. Buka Apps Script

Pilih menu:

Extensions → Apps Script

---

## 3. Salin Source Code

Salin seluruh isi file:

```
main.gs
```

ke dalam project Google Apps Script.

---

## 4. Ubah MASTER_FOLDER_ID

Sesuaikan nilai berikut dengan Folder Google Drive utama yang digunakan.

```javascript
var MASTER_FOLDER_ID = "YOUR_FOLDER_ID";
```

---

## 5. Berikan Permission

Saat pertama kali dijalankan, Google Apps Script akan meminta izin untuk mengakses:

- Google Drive
- Google Sheets
- Google Calendar
- Gmail

Berikan seluruh izin yang diperlukan.

---

## 6. Konfigurasi Trigger

Ikuti panduan pada file:

```
TRIGGER_SETUP.md
```

untuk mengaktifkan proses automasi setiap kali Google Form menerima response baru.
