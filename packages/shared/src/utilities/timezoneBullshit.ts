// dateUtils.ts

import { parseISO, format, startOfDay, addDays, startOfWeek, startOfMonth, startOfQuarter, startOfYear, isEqual } from 'date-fns';
import { format as tzFormat, toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Get the user's local timezone.
 */
export const getLocalTimeZone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Get the start of the current day in the local timezone.
 */
export const getStartOfToday = (timeZone?: string): Date => {
    const tz = timeZone || getLocalTimeZone();
    const now = new Date();
    const zonedNow = toZonedTime(now, tz);
    return startOfDay(zonedNow);
};

/**
 * Parse a date string in ISO format to a Date object in the local timezone.
 * @param dateString - The date string to parse.
 * @param timeZone - The timezone identifier.
 */
export const parseDate = (dateString: string, timeZone?: string): Date => {
    const tz = timeZone || getLocalTimeZone();
    const parsedDate = parseISO(dateString);
    const zonedDate = toZonedTime(parsedDate, tz);
    return zonedDate;
};

/**
 * Format a Date object to a string in the specified format and timezone.
 * @param date - The Date object to format.
 * @param dateFormat - The format string.
 * @param timeZone - The timezone identifier (e.g., 'America/New_York').
 */
export const formatDate = (
    date: Date,
    dateFormat: string = 'yyyy-MM-dd',
    timeZone?: string
): string => {
    const tz = timeZone || getLocalTimeZone();
    return tzFormat(date, dateFormat, { timeZone: tz });
};

/**
 * Convert a local date to a UTC date.
 * @param date - The local Date object.
 * @param timeZone - The timezone identifier of the local date.
 */
export const localDateToUTC = (date: Date, timeZone?: string): Date => {
    const tz = timeZone || getLocalTimeZone();
    return fromZonedTime(date, tz);
};

/**
 * Convert a UTC date to a local date in the specified timezone.
 * @param date - The UTC Date object.
 * @param timeZone - The timezone identifier to convert to.
 */
export const utcToLocalDate = (date: Date, timeZone?: string): Date => {
    const tz = timeZone || getLocalTimeZone();
    return toZonedTime(date, tz);
};

/**
 * Get the date string for today in 'yyyy-MM-dd' format in the specified timezone.
 * @param timeZone - The timezone identifier.
 */
export const getTodayDateString = (timeZone?: string): string => {
    const today = getStartOfToday(timeZone);
    return formatDate(today, 'yyyy-MM-dd', timeZone);
};

/**
 * Navigate between periods (e.g., days) by adding or subtracting days.
 * @param date - The current date.
 * @param offset - The number of days to add (positive) or subtract (negative).
 * @param timeZone - The timezone identifier.
 */
export const navigateDate = (date: Date, offset: number, timeZone?: string): Date => {
    const tz = timeZone || getLocalTimeZone();
    const zonedDate = toZonedTime(date, tz);
    const newDate = addDays(zonedDate, offset);
    return newDate;
};

/**
 * Get the start of a period (day, week, month, quarter, year) in the specified timezone.
 */
export const startOfPeriod = (date: Date, period: 'day' | 'week' | 'month' | 'quarter' | 'year', timeZone?: string): Date => {
    const zonedDate = toZonedTime(date, timeZone || getLocalTimeZone());
    switch (period) {
        case 'day':
            return startOfDay(zonedDate);
        case 'week':
            return startOfWeek(zonedDate, { weekStartsOn: 1 });
        case 'month':
            return startOfMonth(zonedDate);
        case 'quarter':
            return startOfQuarter(zonedDate);
        case 'year':
            return startOfYear(zonedDate);
        default:
            return zonedDate;
    }
};

/**
 * Check if two dates are in the same period (day, week, month, quarter, year).
 */
export const isSamePeriod = (dateLeft: Date, dateRight: Date, period: 'day' | 'week' | 'month' | 'quarter' | 'year', timeZone?: string): boolean => {
    const startDateLeft = startOfPeriod(dateLeft, period, timeZone);
    const startDateRight = startOfPeriod(dateRight, period, timeZone);
    return isEqual(startDateLeft, startDateRight);
};
