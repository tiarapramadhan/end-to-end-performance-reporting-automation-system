# ⚙️ Automation

Folder ini berisi source code **Google Apps Script** yang digunakan untuk mengotomatisasi proses pelaporan kinerja mulai dari penerimaan data Google Form hingga sinkronisasi ke Google Calendar, pengiriman email konfirmasi, dan pengelolaan dokumen di Google Drive.

## Fitur Automasi

- Sinkronisasi agenda ke Google Calendar.
- Pengiriman email konfirmasi otomatis kepada PIC.
- Organisasi file Google Drive berdasarkan divisi dan jenis pelaporan.
- Pencegahan proses duplikat menggunakan Status System.
- Dynamic header mapping sehingga script tetap berjalan meskipun urutan kolom berubah.

## Struktur Folder

| File | Deskripsi |
|------|-----------|
| `main.gs` | Source code utama Google Apps Script. |
| `ARCHITECTURE.md` | Penjelasan arsitektur dan alur automasi. |
| `INSTALLATION.md` | Panduan instalasi dan konfigurasi Apps Script. |
| `TRIGGER_SETUP.md` | Konfigurasi trigger otomatis Google Apps Script. |
