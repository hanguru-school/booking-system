# Data Model Rules

- StudentUID: permanent internal identifier.
- Credential: maps card UID / QR / NFC to StudentUID.
- TapLog:
  - Immutable event log.
  - Must never be deleted.
- Attendance:
  - Aggregated table.
  - Can be regenerated from TapLog.
