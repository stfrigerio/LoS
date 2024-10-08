import { differenceInDays } from 'date-fns';

import { MoneyData } from '@los/shared/src/types/Money';

export const calculateMoneySummary = (moneyData: MoneyData[], startDate: Date, endDate: Date) => {
    let totalIncome = 0;
    let totalExpenses = 0;
    const tagCounts: {[key: string]: number} = {};
    
    moneyData.forEach(entry => {
        if (entry.type.toLowerCase() === 'income') {
            totalIncome += entry.amount;
        } else if (entry.type.toLowerCase() === 'expense') {
            totalExpenses += entry.amount;
        }
        
        tagCounts[entry.tag] = (tagCounts[entry.tag] || 0) + 1;
    });

    const mostCommonTag = Object.entries(tagCounts).length > 0
        ? Object.entries(tagCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
        : 'N/A';

    // Calculate the number of days in the period
    const numberOfDays = differenceInDays(endDate, startDate) + 1; // +1 to include both start and end dates

    // Calculate average spent per day
    const averageSpentPerDay = numberOfDays > 0 ? totalExpenses / numberOfDays : 0;

    return {
        totalIncome,
        totalExpenses,
        net: totalIncome - totalExpenses,
        mostCommonTag,
        transactionCount: moneyData.length,
        averageSpentPerDay: Number(averageSpentPerDay.toFixed(2)), // Round to 2 decimal places
        numberOfDays,
    };
};