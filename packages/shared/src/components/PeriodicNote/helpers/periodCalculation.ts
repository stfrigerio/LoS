// main.ts
import { 
    parseISO, 
    differenceInCalendarDays, 
    isSameMonth, 
    isSameQuarter, 
    isSameYear,
} from 'date-fns';

import { getUTCISOWeekNumber, getUTCISOWeekYear } from '../../../utilities/timezoneBullshit';

// Function to parse dates in UTC
export const parseDateUTC = (dateString: string): Date => {
    if (!dateString.endsWith('Z') && !/[+\-]\d{2}:\d{2}$/.test(dateString)) {
        dateString += 'Z'; // Append 'Z' to enforce UTC
    }
    return parseISO(dateString);
};

// Comprehensive function with hierarchical period checks
export const calculatePeriodTypeAndFormatDate = (
    startDate: string | Date, 
    endDate: string | Date
) => {
    let periodType: string;
    let formattedDate: string;

    try {
        // Parse dates in UTC
        const startUTC = startDate instanceof Date ? startDate : parseDateUTC(startDate as string);
        const endUTC = endDate instanceof Date ? endDate : parseDateUTC(endDate as string);

        // Calculate difference in days
        const daysDifference = differenceInCalendarDays(endUTC, startUTC);

        if (daysDifference < 0) {
            throw new Error('End date must be after start date');
        }

        // Get ISO week and year using UTC-based functions
        const startWeek = getUTCISOWeekNumber(startUTC);
        const endWeek = getUTCISOWeekNumber(endUTC);
        const startWeekYear = getUTCISOWeekYear(startUTC);
        const endWeekYear = getUTCISOWeekYear(endUTC);

        // Hierarchical Checks: Week > Month > Quarter > Year > Unknown
        if (startWeek === endWeek && startWeekYear === endWeekYear) {
            // Same ISO Week
            periodType = 'week';
            formattedDate = `${startWeekYear}-W${startWeek.toString().padStart(2, '0')}`;
        }
        else if (isSameMonth(startUTC, endUTC)) {
            // Same Month
            const startYear = startUTC.getUTCFullYear();
            const startMonth = (startUTC.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
            periodType = 'month';
            formattedDate = `${startYear}-${startMonth}`;
        }
        else if (isSameQuarter(startUTC, endUTC)) {
            // Same Quarter
            const startYear = startUTC.getUTCFullYear();
            const startQuarter = Math.ceil((startUTC.getUTCMonth() + 1) / 3);
            periodType = 'quarter';
            formattedDate = `${startYear}-Q${startQuarter}`;
        }
        else if (isSameYear(startUTC, endUTC)) {
            // Same Year
            const startYear = startUTC.getUTCFullYear();
            periodType = 'year';
            formattedDate = `${startYear}`;
        }
        else {
            // Different Years - Decide on fallback logic
            // For this example, we'll categorize based on daysDifference
            if (daysDifference <= 7) {
                periodType = 'week';
                formattedDate = `${startWeekYear}-W${startWeek.toString().padStart(2, '0')}`;
            }
            else if (daysDifference <= 31) {
                periodType = 'month';
                const startYear = startUTC.getUTCFullYear();
                const startMonth = (startUTC.getUTCMonth() + 1).toString().padStart(2, '0');
                formattedDate = `${startYear}-${startMonth}`;
            }
            else if (daysDifference <= 90) {
                periodType = 'quarter';
                const startYear = startUTC.getUTCFullYear();
                const startQuarter = Math.ceil((startUTC.getUTCMonth() + 1) / 3);
                formattedDate = `${startYear}-Q${startQuarter}`;
            }
            else {
                periodType = 'year';
                const startYear = startUTC.getUTCFullYear();
                formattedDate = `${startYear}`;
            }
        }
    } catch (error) {
        console.error('Error parsing date:', error);
        periodType = 'unknown';
        formattedDate = 'Invalid Date';
    }

    return { periodType, formattedDate };
};
