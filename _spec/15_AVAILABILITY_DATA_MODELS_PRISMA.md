# Availability Data Models (Prisma)

## Goal
Define the canonical Prisma data models for:
- BusinessAvailability (weekly)
- TeacherAvailability (weekly)
- AvailabilityException (date-based override)
These models support the Availability Engine and API defined in:
- _spec/11_AVAILABILITY_ENGINE.md
- _spec/12_ADMIN_BUSINESS_AVAILABILITY.md
- _spec/13_TEACHER_AVAILABILITY.md
- _spec/14_AVAILABILITY_API_AND_ENGINE.md

## Principles
- Normalize time structures: weekday -> intervals -> breaks.
- Keep "weekly defaults" separate from "date overrides" (exceptions).
- Never couple availability edits with booking mutations.
- Store local times as "HH:mm" strings for weekly schedules (timezone-fixed, Asia/Tokyo).
- Store exception date as YYYY-MM-DD (date-only).

## Enums
### AvailabilityExceptionTarget
- BUSINESS
- TEACHER

### AvailabilityExceptionMode
- CLOSED   (no availability that date)
- CUSTOM   (replace intervals/breaks for that date)
- OPEN     (explicitly keep weekly rules; optional but supported)

## Models (MVP)

### BusinessAvailabilityWeekday
Represents classroom working-hours weekly defaults (admin/staff managed).
Fields:
- id (cuid)
- dayOfWeek Int (0-6)
- isOpen Boolean
- intervals BusinessAvailabilityInterval[]
- createdAt DateTime
- updatedAt DateTime

Constraints:
- Unique per dayOfWeek (only one weekday row per day)

### BusinessAvailabilityInterval
Fields:
- id (cuid)
- weekdayId String
- weekday BusinessAvailabilityWeekday @relation(fields: [weekdayId], references: [id], onDelete: Cascade)
- startTime String (HH:mm)
- endTime String (HH:mm)
- breaks BusinessAvailabilityBreak[]
- sortOrder Int (optional, default 0)
- createdAt DateTime
- updatedAt DateTime

### BusinessAvailabilityBreak
Fields:
- id (cuid)
- intervalId String
- interval BusinessAvailabilityInterval @relation(fields: [intervalId], references: [id], onDelete: Cascade)
- startTime String (HH:mm)
- endTime String (HH:mm)
- sortOrder Int (optional, default 0)
- createdAt DateTime
- updatedAt DateTime

---

### TeacherAvailabilityWeekday
Weekly teachable-hours defaults per teacher.
Fields:
- id (cuid)
- teacherId String
- dayOfWeek Int (0-6)
- isOpen Boolean
- intervals TeacherAvailabilityInterval[]
- createdAt DateTime
- updatedAt DateTime

Constraints:
- Unique (teacherId, dayOfWeek)

### TeacherAvailabilityInterval
Fields:
- id (cuid)
- weekdayId String
- weekday TeacherAvailabilityWeekday @relation(fields: [weekdayId], references: [id], onDelete: Cascade)
- startTime String (HH:mm)
- endTime String (HH:mm)
- breaks TeacherAvailabilityBreak[]
- sortOrder Int (optional, default 0)
- createdAt DateTime
- updatedAt DateTime

### TeacherAvailabilityBreak
Fields:
- id (cuid)
- intervalId String
- interval TeacherAvailabilityInterval @relation(fields: [intervalId], references: [id], onDelete: Cascade)
- startTime String (HH:mm)
- endTime String (HH:mm)
- sortOrder Int (optional, default 0)
- createdAt DateTime
- updatedAt DateTime

---

### AvailabilityException
Date-based override for BUSINESS or TEACHER.
Fields:
- id (cuid)
- target AvailabilityExceptionTarget
- teacherId String? (required when target=TEACHER)
- date String (YYYY-MM-DD)
- mode AvailabilityExceptionMode
- intervals AvailabilityExceptionInterval[]   (used when mode=CUSTOM)
- createdByRole String (ADMIN/STAFF/TEACHER)  // store as string for flexibility
- createdById String
- reason String?
- createdAt DateTime
- updatedAt DateTime

Constraints:
- Unique (target, teacherId, date)
  - for BUSINESS, teacherId must be null
  - for TEACHER, teacherId must be set

### AvailabilityExceptionInterval
Fields:
- id (cuid)
- exceptionId String
- exception AvailabilityException @relation(fields: [exceptionId], references: [id], onDelete: Cascade)
- startTime String (HH:mm)
- endTime String (HH:mm)
- breaks AvailabilityExceptionBreak[]
- sortOrder Int (optional, default 0)
- createdAt DateTime
- updatedAt DateTime

### AvailabilityExceptionBreak
Fields:
- id (cuid)
- intervalId String
- interval AvailabilityExceptionInterval @relation(fields: [intervalId], references: [id], onDelete: Cascade)
- startTime String (HH:mm)
- endTime String (HH:mm)
- sortOrder Int (optional, default 0)
- createdAt DateTime
- updatedAt DateTime

## Relations to existing models
- teacherId references existing Teacher user entity in your schema.
  - If Teacher table name differs (e.g., User with role=TEACHER), keep teacherId as String and enforce at app layer for MVP.
- No direct relation from availability to Booking (by design).

## Validation (App-layer, required)
- startTime < endTime
- intervals per day must not overlap
- breaks must be inside parent interval and not overlap
- For AvailabilityException:
  - if mode=CLOSED => intervals must be empty
  - if mode=CUSTOM => intervals must be non-empty
  - if target=BUSINESS => teacherId must be null
  - if target=TEACHER => teacherId must be non-null

## Migration / Seeding (MVP)
- Seed BusinessAvailabilityWeekday 7 rows (0..6) with isOpen=false by default (or true with default hours if you prefer).
- Seed TeacherAvailabilityWeekday per teacher upon teacher creation (optional).
