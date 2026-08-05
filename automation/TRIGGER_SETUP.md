# ⏱️ Trigger Setup

Agar proses berjalan otomatis setiap kali Google Form menerima response baru, lakukan konfigurasi trigger berikut.

## Langkah 1

Buka project Google Apps Script.

---

## Langkah 2

Masuk ke menu:

```
Triggers
```

---

## Langkah 3

Tambahkan trigger baru dengan konfigurasi berikut.

| Pengaturan | Nilai |
|------------|-------|
| Function | `autoCreateCalendarAndSendEmail` |
| Deployment | Head |
| Event Source | From spreadsheet |
| Event Type | On form submit |

---

## Langkah 4

Simpan konfigurasi.

Setelah trigger aktif, setiap response baru akan diproses secara otomatis tanpa perlu menjalankan script secara manual.

## Proses Otomatis

Setiap response baru akan menjalankan proses berikut secara berurutan.

1. Membaca data dari Google Sheets.
2. Memastikan data belum pernah diproses sebelumnya.
3. Membuat event pada Google Calendar (jika tersedia).
4. Mengirim email konfirmasi kepada PIC.
5. Memindahkan file upload ke struktur folder Google Drive.
6. Menandai data sebagai **PROCESSED** untuk mencegah duplikasi.
