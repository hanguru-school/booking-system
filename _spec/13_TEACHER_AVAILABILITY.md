# Teacher: Availability (Teachable Hours)

## Goal
Define each teacher's teachable hours used to generate bookable slots.
Teacher availability is constrained by BusinessAvailability and overridden by date-based Exceptions.

This document defines:
- teacher weekly availability (default)
- policy for admin oversight and change logging
- date-based overrides are handled via AvailabilityException (see _spec/11_AVAILABILITY_ENGINE.md)

## Scope (MVP)
Included:
- Weekly schedule (Mon-Sun) per teacher
- Multiple open intervals per day (supported)
- Break intervals within open time
- Enable/disable per day (per teacher)

Not included (MVP):
- variable slot durations per course
- location/room constraints (future)
- online/offline mode flags (future)

## Priority & Rules
- Teacher availability is applied inside BusinessAvailability:
  - final availability = BusinessAvailability ∩ TeacherAvailability (then exceptions, then bookings)
- Editing teacher availability must never delete or auto-change existing bookings.
- If reducing teacher hours creates conflicts with existing bookings:
  - save is allowed (MVP)
  - conflicts must be discoverable and shown to admin/staff for resolution

## Data Model (MVP)
### TeacherAvailabilityWeekday
Fields:
- id
- teacherId
- dayOfWeek (0-6)
- isOpen (boolean)
- intervals[] (one or more open intervals)

### TeacherAvailabilityInterval
Fields:
- id
- weekdayId
- startTime (HH:mm)
- endTime (HH:mm)
- breaks[] (optional)

### TeacherAvailabilityBreak
Fields:
- id
- intervalId
- startTime (HH:mm)
- endTime (HH:mm)

### Validation rules
- startTime < endTime
- intervals on the same weekday must not overlap
- breaks must be inside its parent interval
- breaks must not overlap each other

## Teacher Self-Service Policy
Teacher can:
- view and edit their own weekly availability
- request admin support if needed (optional workflow)

Teacher cannot:
- edit other teachers' availability
- edit business availability

## Admin/Staff Oversight Policy
Admin/Staff can:
- view any teacher's weekly availability
- (optional) force edit teacher weekly availability
- create AvailabilityException for BUSINESS or TEACHER targets

### Force edit vs Change request (MVP decision)
MVP supports force edit with audit logs.
Change-request workflow is optional and can be added later.

If change-request is added later:
- Teacher submits request -> Admin approves -> availability updated + logs.

## APIs (MVP)
### Teacher self APIs
- GET /api/teacher/availability
- PUT /api/teacher/availability
Body (MVP): full replace weekly config
Server responsibilities:
- validate rules
- write changes atomically
- write audit log (teacher actor)

### Admin APIs
- GET /api/admin/teacher-availability?teacherId=
- PUT /api/admin/teacher-availability?teacherId=
Body (MVP): full replace weekly config
Server responsibilities:
- validate rules
- write changes atomically
- write audit log (admin/staff actor)
- optional: detect conflicts with existing bookings (same teacher, affected range)

## Access Control
- TEACHER: allowed only for own availability endpoints
- ADMIN/STAFF: allowed for admin endpoints for any teacher
- STUDENT/PARENT: not allowed

## Audit Logging (Required)
Any update must create an audit entry:
- actorRole, actorId
- targetType: TEACHER_AVAILABILITY
- targetId: teacherId
- action: TEACHER_AVAILABILITY_UPDATE
- before snapshot (json)
- after snapshot (json)
- reason (optional)
- createdAt

## Implementation Notes (for Cursor)
- Use normalized tables (weekday -> intervals -> breaks)
- Use a transaction for PUT updates
- Never delete or modify existing bookings as a side effect
- Exceptions are separate entities (AvailabilityException) and override weekly rules per date
