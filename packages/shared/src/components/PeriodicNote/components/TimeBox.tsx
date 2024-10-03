import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { useHomepage, NotePeriod } from '@los/shared/src/components/Home/helpers/useHomepage';
import {
	parseDate,
	formatDate,
	getStartOfToday,
	getLocalTimeZone,
	isSamePeriod,
	getUTCISOWeekNumber,
	getUTCISOWeekYear,
	parseDateUTC
} from '@los/shared/src/utilities/timezoneBullshit';

interface TimeBoxProps {
	startDate: string;
	endDate: string;
	currentViewType?: string;
}

const TimeBox: React.FC<TimeBoxProps> = ({ startDate, endDate, currentViewType }) => {
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);

    const { openNote } = useHomepage();
    const timeZone = getLocalTimeZone();

    // Parse dates using dateUtils
    const noteStartDate = useMemo(() => parseDate(startDate, timeZone), [startDate, timeZone]);
    const today = useMemo(() => getStartOfToday(timeZone), [timeZone]);

    // Format dates
    const displayYear = useMemo(() => formatDate(noteStartDate, 'yyyy', timeZone), [noteStartDate, timeZone]);
    const displayQuarter = useMemo(() => `Q${Math.ceil((noteStartDate.getMonth() + 1) / 3)}`, [noteStartDate]);
    const displayMonthName = useMemo(() => formatDate(noteStartDate, 'MMMM', timeZone), [noteStartDate]);

    // Update displayWeek to use UTC-based ISO week number
    const displayWeek = useMemo(() => {
        const startUTC = parseDateUTC(startDate);
        const weekNumber = getUTCISOWeekNumber(startUTC);
        return `W${weekNumber.toString().padStart(2, '0')}`;
    }, [startDate]);

    const displayDay = useMemo(() => formatDate(noteStartDate, 'd', timeZone), [noteStartDate, timeZone]);

    // Compare dates
    const isCurrentYear = useMemo(() => isSamePeriod(noteStartDate, today, 'year', timeZone), [noteStartDate, today, timeZone]);
    const isCurrentQuarter = useMemo(() => isSamePeriod(noteStartDate, today, 'quarter', timeZone), [noteStartDate, today, timeZone]);
    const isCurrentMonth = useMemo(() => isSamePeriod(noteStartDate, today, 'month', timeZone), [noteStartDate, today, timeZone]);
    const isCurrentWeek = useMemo(() => isSamePeriod(noteStartDate, today, 'week', timeZone), [noteStartDate, today, timeZone]);
    const isCurrentDay = useMemo(() => isSamePeriod(noteStartDate, today, 'day', timeZone), [noteStartDate, today, timeZone]);

    const handleOpenNote = (period: NotePeriod) => {
		console.log('startDate', startDate);
        openNote(period, startDate);
    };

    const renderPeriod = (period: NotePeriod, display: string, isCurrentPeriod: boolean, isCurrentView: boolean) => {
        return (
            <Pressable onPress={() => handleOpenNote(period)} style={styles.button}>
                <Text
                    style={[
                        styles.buttonText,
                        isCurrentPeriod && styles.currentPeriodText,
                        isCurrentView && styles.currentViewText
                    ]}
                >
                    {display}
                </Text>
            </Pressable>
        );
    };

    const isDaily = currentViewType === 'daily';
    const isWeekly = currentViewType === 'week';
    const isMonthly = currentViewType === 'month';
    const isQuarterly = currentViewType === 'quarter';
    const isYearly = currentViewType === 'year';

    return (
        <View style={styles.container}>
            {!isDaily && !isWeekly && renderPeriod('year', displayYear, isCurrentYear, currentViewType === 'year')}
            {!isDaily && !isYearly && (
                <>
                    {!isDaily && !isWeekly && <Text style={styles.arrow}> » </Text>}
                    {renderPeriod('quarter', displayQuarter, isCurrentQuarter, currentViewType === 'quarter')}
                </>
            )}
            {!isYearly && (
                <>
                    {!isDaily && <Text style={styles.arrow}> » </Text>}
                    {renderPeriod('month', displayMonthName, isCurrentMonth, currentViewType === 'month')}
                </>
            )}
            {(isWeekly || isDaily) && (
                <>
                    <Text style={styles.arrow}> » </Text>
                    {renderPeriod('week', displayWeek, isCurrentWeek, currentViewType === 'week')}
                </>
            )}
            {isDaily && (
                <>
                    <Text style={styles.arrow}> » </Text>
                    {renderPeriod('day', displayDay, isCurrentDay, currentViewType === 'daily')}
                </>
            )}
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 16,
        paddingBottom: 0,
        flexWrap: 'wrap',
    },
    button: {
        padding: 5,
        marginHorizontal: 5,
    },
    buttonText: {
        fontSize: 24,
        color: theme.hoverColor,
    },
    currentPeriodText: {
        // fontWeight: 'bold',
    },
    currentViewText: {
        color: 'rgba(217, 166, 0, 0.7)',
    },
    arrow: {
        fontSize: 24,
        color: 'gray',
    },
});

export default React.memo(TimeBox);