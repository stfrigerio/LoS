import {
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from 'date-fns';
import {
  getLocalTimeZone,
  parseDate,
  formatDate,
  navigateDate,
} from '@los/shared/src/utilities/timezoneBullshit';

export const navigatePeriod = (
  direction: 'previous' | 'next' | 'current',
  periodType: string,
  startDate: Date,
  endDate: Date,
  timeZone?: string
) => {
  const tz = timeZone || getLocalTimeZone();
  let newStartDate: Date, newEndDate: Date;

  if (direction === 'current') {
    const today = new Date();
    switch (periodType) {
      case 'day':
        newStartDate = startOfDay(today);
        newEndDate = newStartDate;
        break;
      case 'week':
        newStartDate = startOfWeek(today, { weekStartsOn: 1 });
        newEndDate = addDays(newStartDate, 6);
        break;
      case 'month':
        newStartDate = startOfMonth(today);
        newEndDate = addDays(addMonths(newStartDate, 1), -1);
        break;
      case 'quarter':
        newStartDate = startOfQuarter(today);
        newEndDate = addDays(addQuarters(newStartDate, 1), -1);
        break;
      case 'year':
        newStartDate = startOfYear(today);
        newEndDate = addDays(addYears(newStartDate, 1), -1);
        break;
      default:
        newStartDate = startDate;
        newEndDate = endDate;
    }
  } else {
    const offset = direction === 'previous' ? -1 : 1;
    switch (periodType) {
      case 'day':
        newStartDate = navigateDate(startDate, offset, tz);
        newEndDate = newStartDate;
        break;
      case 'week':
        newStartDate = addWeeks(startDate, offset);
        newEndDate = addDays(newStartDate, 6);
        break;
      case 'month':
        newStartDate = addMonths(startDate, offset);
        newEndDate = addDays(addMonths(newStartDate, 1), -1);
        break;
      case 'quarter':
        newStartDate = addQuarters(startDate, offset);
        newEndDate = addDays(addQuarters(newStartDate, 1), -1);
        break;
      case 'year':
        newStartDate = addYears(startDate, offset);
        newEndDate = addDays(addYears(newStartDate, 1), -1);
        break;
      default:
        newStartDate = startDate;
        newEndDate = endDate;
    }
  }

  return { newStartDate, newEndDate };
};