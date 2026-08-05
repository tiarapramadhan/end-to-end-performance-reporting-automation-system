# 🏗️ Automation Architecture

## Workflow

```text
Google Form
      │
      ▼
Google Sheets
      │
      ▼
Google Apps Script
      │
      ├── Validasi Duplikasi
      ├── Dynamic Header Mapping
      ├── Google Calendar Integration
      ├── Email Confirmation
      └── Google Drive File Organization
      │
      ▼
Performance Reporting Dashboard
```

## Modul Automasi

### 1. Duplicate Submission Prevention

Mencegah satu data diproses lebih dari satu kali menggunakan kolom **Status System** sebagai penanda.

---

### 2. Dynamic Header Mapping

Script mencari posisi kolom berdasarkan nama header sehingga perubahan urutan kolom pada Google Form tidak memerlukan perubahan kode.

---

### 3. Google Calendar Integration

Apabila laporan berisi agenda atau event, sistem akan membuat event secara otomatis pada Google Calendar lengkap dengan informasi PIC, divisi, dan lampiran.

---

### 4. Email Confirmation

Setelah data berhasil diproses, sistem mengirim email konfirmasi kepada PIC sebagai bukti bahwa laporan telah diterima.

---

### 5. Google Drive Organization

Seluruh file upload dipindahkan secara otomatis ke folder Google Drive sesuai struktur:

- Divisi
- Jenis Pelaporan
- Kategori Dokumen

Sistem juga melakukan penamaan file secara otomatis agar konsisten.
