import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { startOfWeek, format, isToday, isSameWeek, isSameMonth, isSameQuarter, isSameYear } from 'date-fns';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { useHomepage } from '@los/shared/src/components/Home/helpers/useHomepage';

import { NotePeriod } from '@los/shared/src/components/Home/helpers/useHomepage';

interface TimeBoxProps {
  startDate: string;
  endDate: string;
  currentViewType?: string;
}

const TimeBox: React.FC<TimeBoxProps> = ({ startDate, endDate, currentViewType }) => {
  const { theme, themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);

  const { openNote } = useHomepage()
  const today = new Date();
  const noteStartDate = useMemo(() => new Date(startDate), [startDate]);
  const noteEndDate = useMemo(() => new Date(endDate), [endDate]);

  const displayYear = useMemo(() => format(noteStartDate, 'yyyy'), [noteStartDate]);
  const displayQuarter = useMemo(() => `Q${Math.ceil((noteStartDate.getMonth() + 1) / 3)}`, [noteStartDate]);
  const displayMonthName = useMemo(() => format(noteStartDate, 'MMMM'), [noteStartDate]);
  const displayWeek = useMemo(() => `W${format(startOfWeek(noteStartDate, { weekStartsOn: 1 }), 'w')}`, [noteStartDate]);
  const displayDay = useMemo(() => format(noteStartDate, 'd'), [noteStartDate]);

  const isCurrentYear = useMemo(() => isSameYear(noteStartDate, today), [noteStartDate, today]);
  const isCurrentQuarter = useMemo(() => isSameQuarter(noteStartDate, today), [noteStartDate, today]);
  const isCurrentMonth = useMemo(() => isSameMonth(noteStartDate, today), [noteStartDate, today]);
  const isCurrentWeek = useMemo(() => isSameWeek(noteStartDate, today, { weekStartsOn: 1 }), [noteStartDate, today]);
  const isCurrentDay = useMemo(() => isToday(noteStartDate), [noteStartDate]);

  const renderPeriod = (period: NotePeriod, display: string, isCurrentPeriod: boolean, isCurrentView: boolean) => (
    <Pressable onPress={() => openNote(period, startDate)} style={styles.button}>
      <Text style={[
        styles.buttonText, 
        isCurrentPeriod && styles.currentPeriodText,
        isCurrentView && styles.currentViewText
      ]}>{display}</Text>
    </Pressable>
  );

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