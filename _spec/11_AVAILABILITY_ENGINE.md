# Availability Engine (Source of Truth for Bookable Slots)

## Goal
Availability Engine produces "bookable time slots" for students.
Student booking UI must never calculate availability by itself and must only consume this engine output.

## Inputs (4 pillars)
Availability is computed from these inputs, in this order:

1) Business Availability (classroom working hours)
2) Teacher Availability (teacher teachable hours)
3) Exceptions (date-based overrides, business or teacher)
4) Existing Bookings (conflict prevention)

## Priority Rules (must not break operations)
### P1. Existing Bookings are protected
- Already confirmed bookings must never be deleted or auto-changed by availability edits.
- If availability is reduced and conflicts with existing bookings:
  - the bookings remain as-is
  - the system must show a conflict list to admin/staff
  - resolution is handled via reschedule/cancel workflow (policy-based)

### P2. Exceptions override weekly schedules
- Date-based exceptions override weekly schedules for that date only.

### P3. Teacher availability is always constrained by business availability
- Final availability = intersection of business availability and teacher availability
- If business is closed, teacher availability is irrelevant for that time range.

## Data Concepts
### BusinessAvailability (weekly)
- dayOfWeek (0-6)
- startTime (HH:mm)
- endTime (HH:mm)
- breaks[] (optional) : one or multiple break intervals

### TeacherAvailability (weekly)
- teacherId
- dayOfWeek (0-6)
- startTime (HH:mm)
- endTime (HH:mm)
- breaks[] (optional)

### AvailabilityException (date-based override)
- targetType: BUSINESS | TEACHER
- targetId: teacherId (only when targetType=TEACHER)
- date: YYYY-MM-DD
- mode: CLOSED | OPEN | CUSTOM
  - CLOSED: no availability for that target on the date
  - OPEN: use weekly schedule as-is (explicit open, optional)
  - CUSTOM: define custom start/end and optional breaks for the date
- startTime/endTime (only when mode=CUSTOM)
- breaks[] (optional, only when mode=CUSTOM)
- reason (optional)
- createdByRole / createdById
- createdAt

### Booking (conflict source)
- booking holds startAt/endAt and status
- Only statuses that block time:
  - CONFIRMED
  - (optional) PENDING (if introduced later)
- CANCELED and RESCHEDULED do not block time

## Slot Strategy (MVP)
- Slot duration is fixed by config constant (e.g. 50 or 60 minutes).
- Slots are generated within the final available intervals, excluding breaks, excluding existing booking overlaps.

## Engine Output (API response shape)
Availability API returns:
- date (YYYY-MM-DD)
- teacherId
- slots: array of
  - startAt (ISO)
  - endAt (ISO)
  - isBookable (boolean)
  - reasonCode (optional when not bookable)
Reason codes (MVP):
- OUT_OF_BUSINESS_HOURS
- OUT_OF_TEACHER_HOURS
- BREAK_TIME
- ALREADY_BOOKED
- CLOSED_BY_EXCEPTION

## Admin & Teacher Editing Policy
### Teacher self-edit
- Teacher can edit their weekly availability and create their own exceptions.

### Admin oversight
Admin/Staff can:
- view teacher availability
- create admin exceptions for teacher/business
- optionally "force edit" teacher weekly availability

### Audit requirement
Any admin/staff change must be auditable:
- who changed
- when
- what changed (before/after)
- why (reason)

## Conflict Handling UI Requirement (system behavior)
When an admin change creates conflicts with existing bookings:
- system must not block saving (MVP choice: allow save)
- system must show conflict summary:
  - affected booking count
  - affected dates/times
  - links to booking list filter

## API Contracts (MVP)
### GET /api/availability
Query:
- from=YYYY-MM-DD
- to=YYYY-MM-DD
- teacherId=...

Returns:
- teacherId
- from/to
- slotDurationMinutes
- days[] with slots[]

### Admin APIs (later pages consume these)
- GET/PUT /api/admin/business-availability
- GET/PUT /api/teacher/availability (teacher self)
- GET/PUT /api/admin/teacher-availability?teacherId=
- POST /api/admin/exceptions
- GET /api/admin/conflicts?from&to&teacherId (optional)

## Non-goals (MVP)
- multi-branch logic (keep fields optional for future)
- variable slot durations per course
- payment coupling (handled later)
