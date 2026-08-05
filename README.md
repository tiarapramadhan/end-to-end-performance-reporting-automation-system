# 🚀 End-to-End Performance Reporting Automation System

Sistem automasi pelaporan kinerja end-to-end yang dibangun untuk menyederhanakan proses pelaporan organisasi, mulai dari pengumpulan data, pengelolaan dokumen, sinkronisasi Google Calendar, pengiriman email konfirmasi, hingga visualisasi dashboard monitoring.

Project ini dikembangkan secara **mandiri** selama menjalani internship sebagai **Administration & Company Report Intern** di **First Step Journey** sebagai solusi untuk mengurangi proses administrasi manual, menstandarkan alur pelaporan, serta meningkatkan visibilitas performa pelaporan antar divisi.

> 🚧 **Status Project**
>
> Project ini masih dalam tahap pengembangan.
>
> Versi saat ini telah mencakup automasi alur pelaporan end-to-end beserta dashboard monitoring utama. Pengembangan masih terus dilakukan dengan menambahkan dashboard yang lebih detail, metrik pelaporan tambahan, serta penyempurnaan fitur monitoring.

---

# 🏢 Business Context

Pelaporan kinerja organisasi yang dilakukan secara berkala melibatkan berbagai divisi, dokumen pendukung, serta aktivitas monitoring yang harus dikelola secara konsisten.

Sebelum sistem ini dikembangkan, proses pelaporan masih melibatkan banyak aktivitas manual, seperti pengumpulan laporan, pengelolaan dokumen, penjadwalan agenda, pengiriman konfirmasi kepada PIC, hingga proses monitoring yang dilakukan secara terpisah.

Kondisi tersebut menyebabkan proses administrasi menjadi lebih repetitif, sementara monitoring pelaporan antar divisi belum terpusat dalam satu alur kerja yang terintegrasi.

Untuk membantu mengatasi permasalahan tersebut, dikembangkan sebuah sistem automasi berbasis Google Workspace yang menghubungkan seluruh proses pelaporan ke dalam satu workflow end-to-end.

---

# 🎯 Project Objectives

Project ini bertujuan untuk:

- Menstandarkan proses pelaporan kinerja organisasi.
- Mengotomatisasi proses pengumpulan laporan melalui Google Forms.
- Menyinkronkan agenda pelaporan secara otomatis ke Google Calendar.
- Mengirim email konfirmasi kepada PIC setelah laporan berhasil dikirim.
- Mengelola dokumen pendukung secara otomatis ke struktur folder Google Drive.
- Menyediakan dashboard monitoring sebagai media pemantauan aktivitas pelaporan.
- Mengurangi aktivitas administrasi yang bersifat repetitif melalui workflow automation.

---

# 🔄 System Workflow

```text
Google Form
      │
      ▼
Google Sheets
      │
      ▼
Google Apps Script
      │
      ├── Duplicate Submission Prevention
      ├── Dynamic Header Mapping
      ├── Google Calendar Synchronization
      ├── Email Confirmation
      └── Google Drive File Organization
      │
      ▼
Reporting Dataset
      │
      ▼
Looker Studio Dashboard
```

---

# ✨ System Features

## 📝 Standardized Reporting Form

Seluruh laporan dikumpulkan melalui Google Forms yang telah dirancang agar proses pelaporan menjadi lebih terstruktur dan konsisten.

<p align="center">
<img src="assets/google-form.png" width="100%">
</p>

---

## 📅 Automatic Google Calendar Integration

Apabila laporan berisi agenda atau kegiatan tertentu, sistem secara otomatis membuat event pada Google Calendar lengkap dengan informasi pendukung.

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

Seluruh file yang diunggah akan dipindahkan secara otomatis ke dalam struktur folder Google Drive berdasarkan divisi, jenis pelaporan, dan kategori dokumen.

Selain itu, sistem juga melakukan penamaan file secara otomatis agar lebih konsisten dan mudah ditelusuri.

<p align="center">
<img src="assets/drive-structure.png" width="100%">
</p>

---

## ⚙️ Workflow Automation

Seluruh proses automasi dijalankan menggunakan Google Apps Script, mulai dari validasi data hingga proses integrasi antar layanan Google Workspace.

Fitur utama meliputi:

- Duplicate Submission Prevention
- Dynamic Header Mapping
- Google Calendar Integration
- Email Confirmation
- Google Drive Automation

<p align="center">
<img src="assets/workflow.png" width="100%">
</p>

---

# 📊 Dashboard Overview

Data hasil pelaporan kemudian divisualisasikan menggunakan **Looker Studio** sehingga aktivitas pelaporan dapat dipantau secara lebih mudah oleh stakeholder.

Dashboard saat ini menampilkan berbagai informasi utama, antara lain:

- Monitoring jumlah laporan
- Status penyelesaian laporan
- Progress KPI
- Monitoring performa divisi
- Tren pelaporan
- Monitoring issue

> 🚧 Dashboard masih terus dikembangkan dengan penambahan visualisasi dan metrik monitoring yang lebih detail.

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
- Workflow Automation
- Trigger-based Automation
- Process Automation

### 📊 Data Management

- Reporting Pipeline
- Data Validation
- Dynamic Header Mapping
- File Management

### 📈 Business Intelligence

- Dashboard Development
- KPI Monitoring
- Performance Reporting
- Data Visualization

### 🏢 Business Process

- Process Standardization
- Administrative Automation
- Digital Workflow Design
- Operational Reporting

---

# 🔒 Data Privacy

Project asli dikembangkan menggunakan data operasional internal selama pelaksanaan internship.

Untuk menjaga kerahasiaan informasi perusahaan, repository ini hanya menyertakan:

- dummy dataset,
- dashboard dengan data simulasi,
- konfigurasi automasi yang telah disesuaikan,
- dokumentasi yang aman untuk dipublikasikan.

Tidak ada data internal perusahaan yang disertakan dalam repository ini.

---

# 🚀 Conclusion

Project ini menunjukkan bagaimana proses pelaporan organisasi yang sebelumnya melibatkan banyak aktivitas manual dapat diotomatisasi menjadi sebuah workflow yang terintegrasi menggunakan ekosistem Google Workspace.

Melalui integrasi Google Forms, Google Apps Script, Google Drive, Google Calendar, Gmail, Google Sheets, dan Looker Studio, sistem mampu membantu menstandarkan proses pelaporan, mengurangi pekerjaan administrasi yang berulang, serta menyediakan dashboard monitoring yang lebih mudah digunakan oleh stakeholder.

Seiring dengan pengembangan yang masih berlangsung, sistem ini akan terus disempurnakan melalui penambahan dashboard, metrik monitoring, serta fitur analitik yang lebih komprehensif.
