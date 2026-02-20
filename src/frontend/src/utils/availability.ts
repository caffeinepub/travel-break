// Utility functions for handling booking availability

import type { DateRange } from '../backend';

/**
 * Convert bigint nanosecond timestamp to JavaScript Date
 */
export function nanosToDate(nanos: bigint): Date {
  return new Date(Number(nanos / 1_000_000n));
}

/**
 * Normalize a Date to day precision (midnight UTC)
 */
export function normalizeToDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Check if a date falls within any of the blocked date ranges
 */
export function isDateBlocked(date: Date, blockedRanges: DateRange[]): boolean {
  const checkDate = normalizeToDay(date);
  const checkTime = checkDate.getTime();

  return blockedRanges.some((range) => {
    const startDate = normalizeToDay(nanosToDate(range.checkIn));
    const endDate = normalizeToDay(nanosToDate(range.checkOut));
    
    // A date is blocked if it falls within the range [checkIn, checkOut)
    // We exclude the checkout date itself as it becomes available
    return checkTime >= startDate.getTime() && checkTime < endDate.getTime();
  });
}

/**
 * Check if a date range overlaps with any blocked ranges
 */
export function doesRangeOverlap(
  checkIn: Date,
  checkOut: Date,
  blockedRanges: DateRange[]
): boolean {
  const normalizedCheckIn = normalizeToDay(checkIn);
  const normalizedCheckOut = normalizeToDay(checkOut);
  const checkInTime = normalizedCheckIn.getTime();
  const checkOutTime = normalizedCheckOut.getTime();

  return blockedRanges.some((range) => {
    const startDate = normalizeToDay(nanosToDate(range.checkIn));
    const endDate = normalizeToDay(nanosToDate(range.checkOut));
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    // Two ranges overlap if:
    // - checkIn is before blocked end AND checkOut is after blocked start
    return checkInTime < endTime && checkOutTime > startTime;
  });
}

/**
 * Get all blocked dates from date ranges for calendar display
 */
export function getBlockedDatesFromRanges(blockedRanges: DateRange[]): Date[] {
  const blockedDates: Date[] = [];
  
  blockedRanges.forEach((range) => {
    const startDate = normalizeToDay(nanosToDate(range.checkIn));
    const endDate = normalizeToDay(nanosToDate(range.checkOut));
    
    let currentDate = new Date(startDate);
    while (currentDate < endDate) {
      blockedDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });
  
  return blockedDates;
}
