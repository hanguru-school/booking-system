# Project Charter

- Purpose: Replace SimplyBook and optimize classroom operations.
- UI language: All UI text must be Japanese.
- Access control:
  - No public booking URLs.
  - Direct URL access without login must redirect or return 404.
- Server is the single source of truth:
  - Shared dev DB: booking_dev_shared (classroom server).
- Cursor must always follow documents under /_spec as the source of truth.
