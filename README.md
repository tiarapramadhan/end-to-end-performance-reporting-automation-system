# 🚀 Automated Performance Reporting & Governance System

Sistem automasi pelaporan & tata kelola kinerja end-to-end yang dibangun untuk menyederhanakan proses pelaporan organisasi lintas divisi — mulai dari pengumpulan data, pengelolaan dokumen, sinkronisasi Google Calendar, pengiriman email konfirmasi, hingga dashboard monitoring 12-halaman.

Project ini dikembangkan secara **mandiri** selama menjalani internship sebagai **Administration & Company Report Intern** di **First Step Journey** sebagai solusi untuk mengurangi proses administrasi manual, menstandarkan alur pelaporan 9 divisi ke dalam 1 sistem terpusat, serta meningkatkan visibilitas performa pelaporan antar divisi bagi leadership.

> 🚧 **Status Project**
>
> Project ini masih dalam tahap pengembangan aktif.
>
> Versi saat ini mencakup **5 jalur pelaporan** (Weekly, Monthly, Ad Hoc Document, Event/PMO Fast Report, dan Quick Link & Asset Submission) yang mengotomasi workflow **9 divisi**, lengkap dengan dashboard monitoring **12-halaman** di Looker Studio. Sistem saat ini berada dalam tahap **validasi kebutuhan bersama leader tiap divisi** sebelum resmi diluncurkan secara organisasi.

---

# 🏢 Business Context

Pelaporan kinerja organisasi yang dilakukan secara berkala melibatkan 9 divisi berbeda, dengan kebutuhan data dan metrik yang berbeda-beda tiap divisinya, serta dokumen pendukung dan aktivitas monitoring yang harus dikelola secara konsisten.

Sebelum sistem ini dikembangkan, proses pelaporan masih melibatkan banyak aktivitas manual: pengumpulan laporan, pengelolaan dokumen, penjadwalan agenda, pengiriman konfirmasi kepada PIC, hingga monitoring yang dilakukan secara terpisah per divisi — tanpa satu sumber kebenaran (*single source of truth*) yang bisa diakses bersama.

Untuk mengatasi permasalahan tersebut, dikembangkan sebuah sistem automasi berbasis Google Workspace yang menghubungkan seluruh proses pelaporan lintas divisi ke dalam satu workflow end-to-end, sekaligus menyediakan dashboard monitoring terpusat bagi leadership.

---

# 🎯 Project Objectives

Project ini bertujuan untuk:

- Menstandarkan proses pelaporan kinerja 9 divisi ke dalam 1 sistem terpusat.
- Mengotomatisasi pengumpulan laporan melalui Google Forms dengan 5 jalur pelaporan berbeda.
- Menyinkronkan agenda pelaporan secara otomatis ke Google Calendar.
- Mengirim email konfirmasi kepada PIC setelah laporan berhasil dikirim.
- Mengelola dokumen pendukung secara otomatis ke struktur folder Google Drive per divisi.
- Menyediakan direktori terpusat untuk seluruh link & dokumen kerja lintas divisi.
- Menyediakan dashboard monitoring 12-halaman sebagai media pemantauan performa tiap divisi bagi leadership.
- Memvalidasi kebutuhan data bersama leader tiap divisi sebelum implementasi penuh.
- Mengurangi aktivitas administrasi yang bersifat repetitif melalui workflow automation.

---

# 🔄 System Workflow

```text
Google Form (5 jalur pelaporan)
      │
      ▼
Google Apps Script (Router)
      │
      ├── Clean Data Layer (sheet ternormalisasi per jalur & per divisi)
      ├── Google Calendar Sync (timed-event / all-day-event)
      ├── Email Confirmation
      └── Google Drive File Organization & Auto-naming
      │
      ▼
Reporting Dataset (9+ sheet bersih, header terjamin unik)
      │
      ▼
Looker Studio Dashboard (12 halaman)
```

---

# ✨ System Features

## 📝 Standardized Multi-Path Reporting Form

Seluruh laporan dikumpulkan melalui 1 Google Form dengan **5 jalur pelaporan** (Weekly Update, Monthly Update, Ad Hoc Document Submission, Event/PMO Fast Report, Quick Link & Asset Submission), menggunakan section-based navigation agar tiap responden hanya melihat pertanyaan yang relevan dengan jalur & divisinya.

<p align="center">
<img src="assets/google-form.png" width="100%">
</p>

---

## 🗂 Clean, Normalized Data Architecture

Karena form memiliki banyak percabangan (5 jalur × 9 divisi), beberapa pertanyaan di section berbeda memiliki judul yang identik — menyebabkan Looker Studio menolak koneksi data akibat kolom header duplikat pada sheet respons mentah.

Untuk mengatasi ini, sistem menerapkan **dynamic header mapping**: setiap submission dibaca berdasarkan **kata kunci pada header**, bukan posisi kolom tetap, sehingga tetap akurat walau pertanyaan form berubah urutan atau redaksinya. Hasil ekstraksi ini kemudian dituangkan ke lapisan data bersih terpisah — setiap jalur dan setiap divisi memiliki sheet keluaran sendiri dengan header yang **ditentukan secara eksplisit oleh script** (bukan hasil salin-tempel dari form), sehingga header pada sheet keluaran dijamin selalu unik. Pendekatan dua-lapis ini (dynamic mapping di titik ekstraksi → clean output di titik penyimpanan) sekaligus menjadi fondasi bagi struktur dashboard 12-halaman.

---

## 📅 Automatic Google Calendar Integration

Apabila laporan berisi agenda atau tanggal kegiatan, sistem secara otomatis membuat event pada Google Calendar. Sistem membedakan dua jenis event secara otomatis: **timed event** (jika data jam tersedia) dan **all-day event** (jika hanya tanggal yang tersedia, tanpa jam spesifik) — untuk menjaga kalender tetap rapi dan tidak menumpuk di satu jam tertentu.

<p align="center">
<img src="assets/calendar-preview.png" width="100%">
</p>

---

## 📧 Automated Email Confirmation

Setiap laporan yang berhasil diproses akan secara otomatis mengirimkan email konfirmasi kepada PIC sebagai bukti bahwa laporan telah diterima sistem.

<p align="center">
<img src="assets/email-confirmation.png" width="100%">
</p>

---

## 📂 Automated Drive Organization

Seluruh file yang diunggah dipindahkan secara otomatis ke struktur folder Google Drive bertingkat berdasarkan divisi, jenis pelaporan, dan kategori dokumen, lengkap dengan penamaan file otomatis agar konsisten dan mudah ditelusuri.

<p align="center">
<img src="assets/drive-structure.png" width="100%">
</p>

---

## 🔗 Cross-Division Link & Document Directory

Seluruh link kerja (Drive, Figma, Notion, dll) dan dokumen yang diunggah dari **seluruh jalur dan divisi** dikonsolidasikan ke dalam satu direktori terpusat, memungkinkan tim internal maupun leadership mengakses dokumen/link divisi lain tanpa perlu membuka Google Drive secara langsung.

---

## ⚙️ Workflow Automation

Seluruh proses automasi dijalankan menggunakan Google Apps Script, mencakup:

- Multi-path form routing (5 jalur × 9 divisi)
- Dynamic header mapping (keyword-based extraction, bukan posisi kolom tetap)
- Clean data layer generation (header-safe, Looker-ready)
- Google Calendar integration (timed & all-day logic)
- Automated email confirmation
- Google Drive automation & auto-naming
- Automated error logging untuk debugging

<p align="center">
<img src="assets/workflow.png" width="100%">
</p>

---

# 📊 Dashboard Overview

Data hasil pelaporan divisualisasikan menggunakan **Looker Studio** dalam **12 halaman**:

1. **Executive Overview** — ringkasan lintas divisi: total laporan masuk, breakdown jenis update, breakdown isu/kendala.
2. **Link & Document Directory** — direktori seluruh link & dokumen dari semua divisi.
3–11. **9 halaman performa per divisi** — metrik spesifik tiap divisi (contoh: campaign & engagement rate untuk Digital Marketing, timeline health untuk PMO, satisfaction score untuk Product, dll).
12. **Event & Program Execution** — rekap performa event lintas divisi (target vs realisasi peserta, tingkat kehadiran).

> 🚧 Dashboard masih terus disempurnakan seiring proses validasi kebutuhan data bersama leader tiap divisi.

---

# 🖼 Dashboard Preview

<p align="center">
<img src="assets/dashboard-preview.png" width="100%">
</p>

---

# 📂 Repository Structure

```text
.
├── assets/
│
├── automation/
│   ├── main.gs
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── INSTALLATION.md
│   └── TRIGGER_SETUP.md
│
├── dashboard/
│   └── looker_studio_link.md
│
├── data/
│   ├── dummy/
│   │   └── performance-reporting-dummy-data.xlsx
│   └── README.md
│
├── presentation/
│   └── performance-reporting-automation-system.pdf
│
├── LICENSE
├── .gitignore
└── README.md
```

---

# 🛠 Tools

| Category | Tools |
| --- | --- |
| Automation | Google Apps Script |
| Data Collection | Google Forms |
| Spreadsheet | Google Sheets |
| Dashboard | Looker Studio |
| Calendar | Google Calendar |
| Cloud Storage | Google Drive |
| Email Service | Gmail |
| Documentation | Google Docs |
| Version Control | Git & GitHub |

---

# 💼 Skills Demonstrated

### ⚙️ Workflow Automation

- Google Apps Script
- Multi-path Workflow Automation
- Trigger-based Automation
- Process Automation

### 🧩 Data Architecture & Problem Solving

- Data Architecture / Schema Design
- Dynamic Header Mapping
- Root Cause Analysis & Systematic Debugging
- Data Normalization
- File & Header Management

### 📈 Business Intelligence

- Dashboard Development (multi-page)
- KPI Monitoring
- Performance Reporting
- Data Visualization

### 🏢 Business Process

- Process Standardization
- Administrative Automation
- Digital Workflow Design
- Operational Reporting
- Stakeholder Validation & Requirements Gathering

---

# 🔒 Data Privacy

Project asli dikembangkan menggunakan data operasional internal selama pelaksanaan internship.

Untuk menjaga kerahasiaan informasi perusahaan, repository ini hanya menyertakan:

- dummy dataset,
- dashboard dengan data simulasi,
- konfigurasi automasi yang telah disesuaikan (ID folder/kalender internal digantikan placeholder),
- dokumentasi yang aman untuk dipublikasikan.

Tidak ada data internal perusahaan yang disertakan dalam repository ini.

---

# 🚀 Conclusion

Project ini menunjukkan bagaimana proses pelaporan organisasi yang sebelumnya melibatkan banyak aktivitas manual di 9 divisi dapat diotomatisasi menjadi satu workflow terintegrasi menggunakan ekosistem Google Workspace — termasuk penyelesaian tantangan arsitektur data (header konflik akibat percabangan form) yang berdampak langsung pada keberhasilan integrasi dashboard.

Melalui integrasi Google Forms, Google Apps Script, Google Drive, Google Calendar, Gmail, Google Sheets, dan Looker Studio, sistem membantu menstandarkan proses pelaporan, mengurangi pekerjaan administrasi berulang, serta menyediakan dashboard monitoring 12-halaman yang mudah digunakan oleh stakeholder.

Seiring proses validasi kebutuhan data bersama leader tiap divisi, sistem ini akan terus disempurnakan sebelum resmi diluncurkan secara organisasi.
