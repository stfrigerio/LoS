import { 
    differenceInCalendarDays, 
    differenceInCalendarMonths, 
    differenceInCalendarQuarters, 
    differenceInCalendarYears
} from 'date-fns';
import {
    parseDate,
    parseDateUTC, // Ensure this function exists as per previous instructions
    formatDate,
    getLocalTimeZone,
    getUTCISOWeekNumber,
    getUTCISOWeekYear
} from '@los/shared/src/utilities/timezoneBullshit';

export const calculatePeriodTypeAndFormatDate = (startDate: string | Date, endDate: string | Date) => {
    let periodType: string;
    let formattedDate: string;

    try {
        const timeZone = getLocalTimeZone();
        
        // Parse dates normally
        const start = startDate instanceof Date ? startDate : parseDate(startDate, timeZone);
        const end = endDate instanceof Date ? endDate : parseDate(endDate, timeZone);

        // Calculate the difference in days
        const daysDifference = differenceInCalendarDays(end, start);

        // Determine the period type based on the range
        if (daysDifference === 7) {
            periodType = 'week';
        } else if (daysDifference <= 31 && daysDifference > 7) {
            periodType = 'month';
        } else if (differenceInCalendarQuarters(end, start) === 0) {
            periodType = 'quarter';
        } else if (differenceInCalendarYears(end, start) === 0) {
            periodType = 'year';
        } else {
            periodType = 'unknown';
        }

        // Format the current date based on the period type
        switch (periodType) {
            case 'week':
                // Parse the startDate in UTC without shifting to local time
                const startUTC = startDate instanceof Date ? startDate : parseDateUTC(startDate as string);
                const weekNumber = getUTCISOWeekNumber(startUTC);
                const isoYear = getUTCISOWeekYear(startUTC);
                formattedDate = `${isoYear}-W${weekNumber.toString().padStart(2, '0')}`;
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