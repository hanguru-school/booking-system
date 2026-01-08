# Admin: Business Availability (Classroom Working Hours)

## Goal
Define the classroom's working hours used as the global outer boundary for all bookings.
This configuration is administered by ADMIN/STAFF.

This document defines:
- weekly business availability
- business breaks (non-bookable within open hours)
- date-based overrides are handled via AvailabilityException (see _spec/11_AVAILABILITY_ENGINE.md)

## Scope (MVP)
Included:
- Weekly schedule (Mon-Sun)
- Multiple intervals per day (optional, but supported)
- Break intervals within open time
- Enable/disable per day

Not included (MVP):
- multi-branch support (keep optional fields for future)
- course-specific hours
- holiday calendar import

## Priority & Rules
- Business availability is the global boundary.
- Final bookable time must always be within BusinessAvailability.
- Editing BusinessAvailability must never delete or auto-change existing bookings.
- If reducing business hours creates conflicts with existing bookings:
  - save is allowed (MVP)
  - conflicts must be detectable and shown to admin/staff as a list (separate view/filter)

## Data Model (MVP)
### BusinessAvailabilityWeekday
Represents weekly schedule entries.
Fields:
- id
- dayOfWeek (0-6)
- isOpen (boolean)
- intervals[] (one or more open intervals)

### BusinessAvailabilityInterval
Fields:
- id
- weekdayId
- startTime (HH:mm)
- endTime (HH:mm)
- breaks[] (optional)

### BusinessAvailabilityBreak
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

## Admin UI Behavior (system behavior)
- Admin can:
  - enable/disable a weekday (isOpen)
  - set one or more open intervals per weekday
  - add/remove break intervals
  - copy/paste a weekday configuration to other weekdays (MVP optional)
- Saving:
  - server validates overlaps and time order
  - return structured errors for invalid configuration

## APIs (MVP)
### GET /api/admin/business-availability
Returns the full weekly configuration:
- weekdays[] with intervals[] and breaks[]

### PUT /api/admin/business-availability
Body:
- weekdays[] (full replace) OR patch-style update (choose one; MVP: full replace)
Server responsibilities:
- validate rules
- write changes atomically (transaction)
- write audit log (see audit section)

### (Optional) GET /api/admin/business-availability/conflicts?from&to
Returns bookings that are outside updated business availability (for admin review).
This endpoint is optional for MVP but conflict detection logic must exist.

## Access Control
- ADMIN, STAFF: allowed
- TEACHER, STUDENT, PARENT: not allowed

## Audit Logging (Required)
Any update must create an audit entry:
- actorRole, actorId
- action: BUSINESS_AVAILABILITY_UPDATE
- before snapshot (json)
- after snapshot (json)
- reason (optional)
- createdAt

## Implementation Notes (for Cursor)
- Persist weekly schedule as normalized tables (weekday -> intervals -> breaks)
- Prefer transaction for PUT updates
- Avoid deleting existing bookings; only availability boundaries change
- Exceptions are not handled here; they are separate entities (AvailabilityException)
