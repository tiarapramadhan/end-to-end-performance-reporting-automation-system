# 🏗 System Architecture

Dokumen ini menjelaskan arsitektur backend automation yang dibangun menggunakan **Google Apps Script** untuk mengotomatisasi proses pelaporan, pengelolaan dokumen, sinkronisasi kalender, serta notifikasi email.

Seluruh proses dirancang sebagai **event-driven automation pipeline** yang berjalan otomatis setiap kali terdapat response baru dari Google Form.

---

# 📌 High-Level Architecture

```text
                    Google Form
                         │
                         ▼
              Google Spreadsheet
                         │
                         ▼
              Google Apps Script
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
 Google Calendar      Gmail         Google Drive
        │                │                │
        └────────────────┼────────────────┘
                         ▼
              Organized Reporting System
```

---

# 🔄 Processing Workflow

```text
New Form Submission
        │
        ▼
Read Latest Response
        │
        ▼
Duplicate Validation
        │
        ▼
Dynamic Header Mapping
        │
        ├──────────────► Calendar Event Creation
        │
        ├──────────────► Confirmation Email
        │
        ├──────────────► File Renaming
        │
        ├──────────────► Folder Organization
        │
        ▼
Mark Response as PROCESSED
```

---

# 🧩 Module Overview

## Module 1 — Response Processing

Responsible for reading the latest Google Form submission and preparing the data for subsequent automation processes.

Main responsibilities:

- Read latest response
- Dynamic column mapping
- Extract required information
- Initialize automation workflow

---

## Module 2 — Duplicate Prevention

Ensures that each submission is processed only once.

Mechanism:

- Check **Status System** column.
- Skip rows marked as `PROCESSED`.
- Mark successfully processed rows to prevent duplicate execution.

---

## Module 3 — Google Calendar Integration

Automatically creates calendar events based on event information submitted through the form.

Features:

- All-day event support
- Timed event support
- Event description generation
- Google Calendar synchronization

---

## Module 4 — Email Notification

Automatically sends HTML confirmation emails after a submission is successfully processed.

Email contains:

- Division
- PIC
- Update type
- Issue category
- Processing confirmation

---

## Module 5 — Drive Automation

Automatically organizes uploaded files into a standardized Google Drive folder hierarchy.

Capabilities:

- Folder creation
- Automatic file renaming
- Monthly / Weekly / AdHoc separation
- KPI file categorization

---

## Module 6 — Helper Utilities

Provides reusable helper functions used across the automation pipeline.

Includes:

- Folder creation helper
- File ID extraction
- Folder lookup
- String sanitization

---

# 🔐 Reliability Features

Several mechanisms are implemented to improve automation reliability.

- Duplicate submission prevention
- Dynamic header detection
- Automatic folder creation
- Error handling using `try...catch`
- Standardized file naming convention

---

# 📈 Scalability

The automation pipeline is designed to be modular, making it easier to extend in the future.

Potential future enhancements include:

- Slack / Discord notifications
- KPI dashboard integration
- BigQuery synchronization
- Approval workflow
- Multi-calendar support
- Logging & monitoring dashboard
