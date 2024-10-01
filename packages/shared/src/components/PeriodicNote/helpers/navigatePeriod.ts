import { addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth, addYears, subYears, startOfYear, endOfYear, startOfQuarter, endOfQuarter, startOfDay, startOfWeek, startOfMonth as startOfMonthFn, startOfQuarter as startOfQuarterFn, startOfYear as startOfYearFn } from 'date-fns';

export const navigatePeriod = (direction: 'previous' | 'next' | 'current', periodType: string, startDate: Date, endDate: Date) => {
  let newStartDate = new Date(startDate);
  let newEndDate = new Date(endDate);

  if (direction === 'current') {
    const today = new Date();
    switch (periodType) {
      case 'day':
        newStartDate = startOfDay(today);
        newEndDate = newStartDate;
        break;
      case 'week':
        newStartDate = startOfWeek(today);
        newEndDate = addDays(newStartDate, 6);
        break;
      case 'month':
        newStartDate = startOfMonthFn(today);
        newEndDate = endOfMonth(newStartDate);
        break;
      case 'quarter':
        newStartDate = startOfQuarterFn(today);
        newEndDate = endOfQuarter(newStartDate);
        break;
      case 'year':
        newStartDate = startOfYearFn(today);
        newEndDate = endOfYear(newStartDate);
        break;
    }
  } else {
    switch (periodType) {
      case 'day':
        if (direction === 'previous') {
          newStartDate = subDays(newStartDate, 1);
          newEndDate = newStartDate;
        } else if (direction === 'next') {
          newStartDate = addDays(newStartDate, 1);
          newEndDate = newStartDate;
        }
        break;
      case 'week':
        if (direction === 'previous') {
          newStartDate = subWeeks(newStartDate, 1);
          newEndDate = addDays(newStartDate, 6);
        } else if (direction === 'next') {
          newStartDate = addWeeks(newStartDate, 1);
          newEndDate = addDays(newStartDate, 6);
        }
        break;
      case 'month':
        if (direction === 'previous') {
          newStartDate = subMonths(newStartDate, 1);
        } else if (direction === 'next') {
          newStartDate = addMonths(newStartDate, 1);
        }
        newStartDate = startOfMonth(newStartDate);
        newEndDate = endOfMonth(newStartDate);
        break;
      case 'quarter':
        if (direction === 'previous') {
          newStartDate = subMonths(newStartDate, 3);
        } else if (direction === 'next') {
          newStartDate = addMonths(newStartDate, 3);
        }
        newStartDate = startOfQuarter(newStartDate);
        newEndDate = endOfQuarter(newStartDate);
        break;
      case 'year':
        if (direction === 'previous') {
          newStartDate = subYears(newStartDate, 1);
        } else if (direction === 'next') {
          newStartDate = addYears(newStartDate, 1);
        }
        newStartDate = startOfYear(newStartDate);
        newEndDate = endOfYear(newStartDate);
        break;
    }
  }

  return { newStartDate, newEndDate };
};