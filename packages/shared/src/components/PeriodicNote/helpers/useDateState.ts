import { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek } from 'date-fns';
import { getLocalTimeZone, parseDate } from '@los/shared/src/utilities/timezoneBullshit';
import { calculatePeriodTypeAndFormatDate } from './periodCalculation';

export const useDateState = (propStartDate?: string, propEndDate?: string, routeStartDate?: string, routeEndDate?: string) => {
    const [dateState, setDateState] = useState(() => {
        const timeZone = getLocalTimeZone();
        const today = new Date();

        let startDate = propStartDate ? parseDate(propStartDate, timeZone) : startOfWeek(today, { weekStartsOn: 1 });
        let endDate = propEndDate ? parseDate(propEndDate, timeZone) : endOfWeek(startDate, { weekStartsOn: 1 });

        if (routeStartDate && routeEndDate) {
        startDate = parseDate(routeStartDate, timeZone);
        endDate = parseDate(routeEndDate, timeZone);
        }

        const { periodType, formattedDate } = calculatePeriodTypeAndFormatDate(startDate, endDate);
        
        return { startDate, endDate, periodType, formattedDate };
    });

    useEffect(() => {
        const timeZone = getLocalTimeZone();
        const today = new Date();

        let startDate = propStartDate ? parseDate(propStartDate, timeZone) : startOfWeek(today, { weekStartsOn: 1 });
        let endDate = propEndDate ? parseDate(propEndDate, timeZone) : endOfWeek(startDate, { weekStartsOn: 1 });

        if (routeStartDate && routeEndDate) {
        startDate = parseDate(routeStartDate, timeZone);
        endDate = parseDate(routeEndDate, timeZone);
        }

        const { periodType, formattedDate } = calculatePeriodTypeAndFormatDate(startDate, endDate);

        setDateState({ startDate, endDate, periodType, formattedDate });
    }, [propStartDate, propEndDate, routeStartDate, routeEndDate]);

    return [dateState, setDateState] as const;
};