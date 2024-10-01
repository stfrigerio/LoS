import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { setWeek, format, addDays } from 'date-fns';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { getFillColorForMonth, getNextMonthColor } from '@los/shared/src/components/DailyNote/helpers/useDateHeader';
import { DateHeaderProps } from '@los/shared/src/components/DailyNote/types/DateHeader';

// Utility function to validate color strings using regex
const isValidColor = (color: string) => {
    const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
    const rgbColorRegex = /^rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)$/;
    const rgbaColorRegex = /^rgba\((\d{1,3}), (\d{1,3}), (\d{1,3}), (0|1|0?\.\d+)\)$/;
    const namedColorRegex = /^(?:[a-zA-Z]+)$/;

    return hexColorRegex.test(color) || rgbColorRegex.test(color) || rgbaColorRegex.test(color) || namedColorRegex.test(color);
};

const DateHeader: React.FC<DateHeaderProps> = ({ formattedDate, periodType }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
        }).start();
    }, [fadeAnim]);

    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);

    let dateText = formattedDate;
    let startColor = '';
    let endColor = '';

    if (periodType === 'day') {
        const [dayOfWeek, dateOfMonth] = formattedDate.split(', ');
        const monthName = dateOfMonth.split(' ')[1];
        startColor = getFillColorForMonth(monthName);
        endColor = getNextMonthColor(monthName);
        dateText = dateOfMonth;
    } else if (periodType === 'week') {
        const [year, week] = formattedDate.split('-W');
        const startDate = setWeek(new Date(parseInt(year, 10), 0, 1), parseInt(week, 10));
        const endDate = addDays(startDate, 6);
        const startMonth = format(startDate, 'MMMM');
        const endMonth = format(endDate, 'MMMM');
        startColor = getFillColorForMonth(startMonth) || startColor;
        endColor = getNextMonthColor(endMonth) || endColor;
        dateText = `${year}-W${week}`;
    } else if (periodType === 'month') {
        const [year, month] = formattedDate.split('-');
        const monthName = format(new Date(parseInt(year, 10), parseInt(month, 10) - 1), 'MMMM');
        startColor = getFillColorForMonth(monthName);
        endColor = getNextMonthColor(monthName);
    } else if (periodType === 'quarter') {
        const [year, quarter] = formattedDate.split('Q');
        const monthName = format(new Date(parseInt(year, 10), (parseInt(quarter, 10) - 1) * 3), 'MMMM');
        startColor = getFillColorForMonth(monthName);
        endColor = getNextMonthColor(monthName);
    } else if (periodType === 'year') {
        const [year] = formattedDate.split('-');
        const monthName = format(new Date(parseInt(year, 10), 0, 1), 'MMMM');
        startColor = getFillColorForMonth(monthName);
        endColor = getNextMonthColor(monthName);
    }

    // Ensure colors are valid
    startColor = isValidColor(startColor) ? startColor : 'transparent';
    endColor = isValidColor(endColor) ? endColor : 'transparent';

    return (
        <View style={styles.container}>
            <Svg height="50" width="300">
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="100%" y2="0">
                        <Stop offset="0.4" stopColor={startColor} stopOpacity="0.8" />
                        <Stop offset="1" stopColor={endColor} stopOpacity="0.8" />
                    </LinearGradient>
                </Defs>
                <SvgText
                    fill="url(#grad)"
                    stroke="none"
                    fontSize="24"
                    letterSpacing={1}
                    fontFamily='serif'
                    x="150"
                    y="35"
                    textAnchor="middle">{dateText}</SvgText>
            </Svg>
            {periodType === 'day' && (
                <Animated.Text style={[styles.dayOfWeek, { opacity: fadeAnim }]}>
                    {formattedDate.split(', ')[0]}
                </Animated.Text>
            )}
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        alignItems: 'center',
        // borderWidth: 1,
        // borderColor: 'red',
    },
    dayOfWeek: {
        textAlign: 'center',
        fontSize: 22,
        color: theme.textColor,
        fontFamily: 'Roboto',
        fontStyle: 'italic'
    },
});

export default DateHeader;