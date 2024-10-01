export const periodToNumber = (period: string | undefined): number => {
    if (!period) {
        console.warn('No period provided!');
        return 0;
    }
  
    if (period.includes('-W')) {
      // Weekly format: 2024-W23
      const [year, week] = period.split('-W');
      return parseInt(year) * 100 + parseInt(week);
    } else if (period.includes('-')) {
      // Monthly format: 2024-06
      return parseInt(period.replace('-', ''));
    } else if (period.includes('Q')) {
      // Quarterly format: 2024Q1
      const [year, quarter] = period.split('Q');
      return parseInt(year) * 10 + parseInt(quarter);
    } else {
      // Yearly format: 2024
      return parseInt(period) * 100;
    }
};

export const comparePeriods = (a: string | undefined, b: string | undefined): number => {
    return periodToNumber(b) - periodToNumber(a);
};