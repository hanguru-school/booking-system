# Availability API & Engine (Slot Generation)

## Goal
Implement a single authoritative API that returns bookable slots.
All booking UIs must consume this API output and must not compute availability client-side.

This spec builds on:
- _spec/11_AVAILABILITY_ENGINE.md
- _spec/12_ADMIN_BUSINESS_AVAILABILITY.md
- _spec/13_TEACHER_AVAILABILITY.md

## MVP Endpoint
### GET /api/availability
Query:
- from=YYYY-MM-DD (inclusive)
- to=YYYY-MM-DD (inclusive)
- teacherId=<uuid>

teacherId is required in MVP. Multi-teacher aggregation is not supported.

Response (MVP):
{
  "teacherId": "...",
  "from": "YYYY-MM-DD",
  "to": "YYYY-MM-DD",
  "slotDurationMinutes": <number>,
  "timezone": "Asia/Tokyo",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "slots": [
        {
          "startAt": "ISO",
          "endAt": "ISO",
          "isBookable": true|false,
          "reasonCode": "..." | null
        }
      ]
    }
  ]
}

## Config Constants (MVP)
- TIMEZONE = Asia/Tokyo
- SLOT_DURATION_MINUTES = 50 (or 60; choose one constant for MVP)
- SLOT_STEP_MINUTES = SLOT_DURATION_MINUTES (no half-step in MVP)
- BOOKING_BLOCKING_STATUSES = [CONFIRMED] (PENDING optional later)
- slotDurationMinutes must be returned in API responses even if constant, to keep client logic decoupled from server configuration.

## Input Data Sources
For each day in [from..to]:
1) Business weekly schedule (weekday) + business exceptions (date)
2) Teacher weekly schedule (weekday) + teacher exceptions (date)
3) Existing bookings for teacher overlapping that day (blocking statuses only)

Notes:
- Exceptions are modeled as AvailabilityException:
  - targetType=BUSINESS applies to business schedule for the date
  - targetType=TEACHER (teacherId) applies to teacher schedule for the date

## Effective Availability Calculation (per date)
### Step A. Build Business Intervals
- Start from BusinessAvailability weekly for that weekday.
- Apply BUSINESS exception for that date:
  - CLOSED => no business intervals
  - CUSTOM => replace business intervals with custom interval(s) and breaks
  - OPEN => keep weekly as-is (optional use)
- Result: businessOpenIntervals[], businessBreakIntervals[]

### Step B. Build Teacher Intervals
- Start from TeacherAvailability weekly for that weekday.
- Apply TEACHER exception for that date:
  - CLOSED => no teacher intervals
  - CUSTOM => replace teacher intervals with custom interval(s) and breaks
  - OPEN => keep weekly as-is (optional use)
- Result: teacherOpenIntervals[], teacherBreakIntervals[]

### Step C. Intersection
- effectiveOpenIntervals = intersection(businessOpenIntervals, teacherOpenIntervals)
- effectiveBreakIntervals = union of:
  - projected business breaks within effectiveOpenIntervals
  - projected teacher breaks within effectiveOpenIntervals

### Step D. Subtract breaks
- effectiveBookableIntervals = effectiveOpenIntervals - effectiveBreakIntervals

### Step E. Subtract existing bookings
- For each booking in blocking statuses:
  - subtract booking interval from effectiveBookableIntervals
- Important:
  - bookings are protected; availability edits do not delete bookings
  - this step only prevents new slots from being bookable

## Slot Generation (per date)
Given effectiveBookableIntervals:
- Generate slots in TIMEZONE:
  - start times aligned to SLOT_STEP_MINUTES grid from interval.start
  - each slot is [start, start + SLOT_DURATION_MINUTES)
- A slot is bookable if it fully fits within effectiveBookableIntervals and does not overlap any blocking booking.
- For MVP, we return only slots that are within the final effectiveBookableIntervals (bookable ones).
  - Optionally (for richer UI) return non-bookable slots with reasonCode. (see below)

## Reason Codes (MVP)
If returning non-bookable slots (optional):
- OUT_OF_BUSINESS_HOURS
- OUT_OF_TEACHER_HOURS
- BREAK_TIME
- ALREADY_BOOKED
- CLOSED_BY_EXCEPTION

MVP recommended approach:
- return only bookable slots (simpler)
- (optional) provide a second mode: includeBlocked=true to include non-bookable slots with reasons

## Performance Requirements (MVP)
- Fetch bookings with a single query for the range:
  - where teacherId=... and startAt < endOfToDay and endAt > startOfFromDay and status in BLOCKING
- Fetch weekly schedules once (business + teacher) and reuse for each day
- Fetch exceptions within date range once and index by date/target

## Edge Cases (MVP)
- Intervals that cross midnight are not supported in MVP (start/end must be within 00:00-24:00 on the same date)
- If business is closed => days[].slots is empty
- If teacher is closed => days[].slots is empty
- Breaks outside open intervals must be rejected by validation at save time (admin/teacher editors)

## Access Control
- This endpoint is used by authenticated roles:
  - STUDENT: can request availability for bookable teachers (future: restrict list)
  - TEACHER/STAFF/ADMIN: can request for operational view
MVP: require login; unauthenticated requests return 401.

## Implementation Notes (for Cursor)
- Implement pure functions for interval operations:
  - normalizeIntervals()
  - intersectIntervals(a,b)
  - subtractIntervals(base, subtractList)
  - unionIntervals(list)
- Use a robust date library (e.g. Luxon) with TIMEZONE to avoid DST issues (Japan has no DST, still keep consistent)
- Output ISO timestamps in TIMEZONE with offset.
