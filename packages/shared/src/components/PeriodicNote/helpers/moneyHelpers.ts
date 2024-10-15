import { differenceInDays } from 'date-fns';
import { MoneyData } from '@los/shared/src/types/Money';

export const calculateMoneySummary = (currentMoneyData: MoneyData[], previousMoneyData: MoneyData[], startDate: Date, endDate: Date) => {
    const calculateSummary = (moneyData: MoneyData[]) => {
        let totalIncome = 0;
        let totalExpenses = 0;
        const tagCounts: {[key: string]: number} = {};
        const tagExpenses: {[key: string]: number} = {};

        moneyData.forEach(entry => {
            if (entry.type.toLowerCase() === 'income') {
                totalIncome += entry.amount;
            } else if (entry.type.toLowerCase() === 'expense') {
                totalExpenses += entry.amount;
                tagExpenses[entry.tag] = (tagExpenses[entry.tag] || 0) + entry.amount;
            }
            
            tagCounts[entry.tag] = (tagCounts[entry.tag] || 0) + 1;
        });

        const numberOfDays = differenceInDays(endDate, startDate) + 1;
        const averageSpentPerDay = numberOfDays > 0 ? totalExpenses / numberOfDays : 0;

        return { totalIncome, totalExpenses, tagCounts, tagExpenses, averageSpentPerDay };
    };

    const current = calculateSummary(currentMoneyData);
    const previous = calculateSummary(previousMoneyData);

    const calculatePercentageChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const totalExpensesChange = calculatePercentageChange(current.totalExpenses, previous.totalExpenses);
    const averageSpentPerDayChange = calculatePercentageChange(current.averageSpentPerDay, previous.averageSpentPerDay);

    const mostCommonTag = Object.entries(current.tagCounts).length > 0
        ? Object.entries(current.tagCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
        : 'N/A';

    const mostExpensiveTag = Object.entries(current.tagExpenses).length > 0
        ? Object.entries(current.tagExpenses).reduce((a, b) => a[1] > b[1] ? a : b)[0]
        : 'N/A';

    const expenses = currentMoneyData.filter(entry => entry.type.toLowerCase() === 'expense');
    const singleMostExpensiveTransaction = expenses.length > 0
        ? expenses.reduce((max, entry) => entry.amount > max.amount ? entry : max).amount.toFixed(2)
        : 'N/A';

    return {
        totalIncome: current.totalIncome,
        totalExpenses: current.totalExpenses,
        totalExpensesChange,
        net: current.totalIncome - current.totalExpenses,
        mostCommonTag,
        mostExpensiveTag,
        transactionCount: currentMoneyData.length,
        averageSpentPerDay: Number(current.averageSpentPerDay.toFixed(2)),
        averageSpentPerDayChange,
        numberOfDays: differenceInDays(endDate, startDate) + 1,
        singleMostExpensiveTransaction: singleMostExpensiveTransaction === 'N/A' ? 'N/A' : `€${singleMostExpensiveTransaction}`,
    };
};