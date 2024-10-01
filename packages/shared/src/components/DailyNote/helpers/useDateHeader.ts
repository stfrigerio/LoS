export const getFillColorForMonth = (monthName: string) => {
    const colors: { [key: string]: string } = {
        January: '#cfe2f3',
        February: '#a2c4c9',
        March: '#76a5af',
        April: '#93c47d',
        May: '#6aa84f',
        June: '#8fce00',
        July: '#ffd966',
        August: '#f1c232',
        September: '#ce7e00',
        October: '#e06666',
        November: '#f4cccc',
        December: '#eeeeee',
    };
    return colors[monthName] || '#FFFFFF';
};

export const getNextMonthColor = (monthName: string) => {
    const monthOrder = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentIndex = monthOrder.indexOf(monthName);
    const nextIndex = (currentIndex + 1) % 12;
    return getFillColorForMonth(monthOrder[nextIndex]);
};

export const getDateOfISOWeek = (week: number, year: number) => {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
};

export const getGradientColorsForWeek = (formattedDate: string) => {
    const [year, week] = formattedDate.split('-W').map(Number);
    const startOfWeek = getDateOfISOWeek(week, year);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const startMonth = startOfWeek.toLocaleString('en-US', { month: 'long' });
    const endMonth = endOfWeek.toLocaleString('en-US', { month: 'long' });
    const startColor = getFillColorForMonth(startMonth);
    const endColor = getNextMonthColor(endMonth);

    return { startColor, endColor };
}