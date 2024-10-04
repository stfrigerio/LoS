import { 
    format, 
    parseISO, 
    differenceInCalendarDays, 
    differenceInCalendarMonths, 
    differenceInCalendarQuarters, 
    differenceInCalendarYears 
} from 'date-fns';

export const calculatePeriodTypeAndFormatDate = (startDate: string | Date, endDate: string | Date) => {
    let periodType;
    let formattedDate;

    try {
        const start = startDate instanceof Date ? startDate : parseISO(startDate);
        const end = endDate instanceof Date ? endDate : parseISO(endDate);

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
                formattedDate = format(start, 'yyyy-') + 'W' + format(start, 'II');
                break;
            case 'month':
                formattedDate = format(start, 'yyyy-MM');
                break;
            case 'quarter':
                const quarter = Math.ceil((start.getMonth() + 1) / 3);
                formattedDate = `${format(start, 'yyyy')}-Q${quarter}`;
                break;
            case 'year':
                formattedDate = format(start, 'yyyy');
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