import { 
    differenceInCalendarDays, 
    differenceInCalendarMonths, 
    differenceInCalendarQuarters, 
    differenceInCalendarYears,
    getISOWeek,
    getYear,
} from 'date-fns';
import {
    parseDate,
    formatDate,
    getLocalTimeZone
} from '@los/shared/src/utilities/timezoneBullshit';

export const calculatePeriodTypeAndFormatDate = (startDate: string | Date, endDate: string | Date) => {
    let periodType;
    let formattedDate;

    try {
        const timeZone = getLocalTimeZone();
        const start = startDate instanceof Date ? startDate : parseDate(startDate, timeZone);
        const end = endDate instanceof Date ? endDate : parseDate(endDate, timeZone);

        // Determine the period type based on the range
        if (differenceInCalendarDays(end, start) <= 7) {
            periodType = 'week';
        } else if (differenceInCalendarMonths(end, start) < 2) {
            periodType = 'month';
        } else if (differenceInCalendarQuarters(end, start) < 2) {
            periodType = 'quarter';
        } else if (differenceInCalendarYears(end, start) < 2) {
            periodType = 'year';
        } else {
            periodType = 'unknown';
        }

        // Format the current date based on the period type
        switch (periodType) {
            case 'week':
                const weekNumber = getISOWeek(start);
                const year = getYear(start);
                formattedDate = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
                break;
            case 'month':
                formattedDate = formatDate(start, 'yyyy-MM', timeZone);
                break;
            case 'quarter':
                const quarter = Math.ceil((start.getMonth() + 1) / 3);
                formattedDate = `${formatDate(start, 'yyyy', timeZone)}-Q${quarter}`;
                break;
            case 'year':
                formattedDate = formatDate(start, 'yyyy', timeZone);
                break;
            default:
                formattedDate = 'Unknown Period';
                break;
        }
    } catch (error) {
        console.error('Error parsing date:', error);
        periodType = 'unknown';
        formattedDate = 'Invalid Date';
    }

    return { periodType, formattedDate };
};