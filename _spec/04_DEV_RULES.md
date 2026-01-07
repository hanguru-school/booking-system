# Development Rules

- Shared dev database: booking_dev_shared.
- DB runs only on classroom server.
- External PCs connect via SSH tunnel.
- Prisma rules:
  - prisma migrate dev is executed on one main machine only.
  - Other environments use prisma generate / db push.
- UI text must be Japanese (except debug logs).
