import { addDays, addWeeks, addMonths, addYears, setDate, setMonth } from 'date-fns';

export function calculateNextOccurrence(currentDate: Date, frequency: string): Date {
    const [baseFrequency, detail] = frequency.includes('_') ? frequency.split('_') : [frequency, ''];
    
    switch (baseFrequency) {
        case 'daily':
            if (detail === 'weekday' || frequency === 'weekday') {
                let nextDate = addDays(currentDate, 1);
                while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
                    nextDate = addDays(nextDate, 1);
                }
                return nextDate;
            } else if (detail === 'weekend' || frequency === 'weekend') {
                let nextDate = addDays(currentDate, 1);
                while (nextDate.getDay() !== 0 && nextDate.getDay() !== 6) {
                    nextDate = addDays(nextDate, 1);
                }
                return nextDate;
            }
            return addDays(currentDate, 1);
    
        case 'weekly':
            const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            const targetDay = daysOfWeek.indexOf(detail);
            if (targetDay === -1) {
                throw new Error(`Invalid day of week: ${detail}`);
            }
            let nextDate = addDays(currentDate, 1);
            while (nextDate.getDay() !== targetDay) {
                nextDate = addDays(nextDate, 1);
            }
            return nextDate;
    
        case 'monthly':
            if (detail === 'last') {
                const nextMonth = addMonths(currentDate, 1);
                return new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
            }
            const day = parseInt(detail, 10);
            if (isNaN(day) || day < 1 || day > 31) {
                throw new Error(`Invalid day of month: ${detail}`);
            }
            return setDate(addMonths(currentDate, 1), day);
        
        case 'yearly':
            const month = parseInt(detail.substring(0, 2), 10) - 1;
            const date = parseInt(detail.substring(2), 10);
            if (isNaN(month) || isNaN(date) || month < 0 || month > 11 || date < 1 || date > 31) {
                throw new Error(`Invalid month or date: ${detail}`);
            }
            let nextYear = addYears(currentDate, 1);
            return setDate(setMonth(nextYear, month), date);
    
        case 'weekday':
        case 'weekend':
            // Handle the case where 'weekday' or 'weekend' is passed directly
            return calculateNextOccurrence(currentDate, `daily_${baseFrequency}`);
    
        default:
            throw new Error(`Unsupported frequency: ${frequency}`);
    }
}