// Libraries
import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet, Dimensions } from 'react-native';
import { format } from 'date-fns';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { DailyTextData } from '@los/shared/src/types/TextNotes';

let usePeriodicData: any;
if (Platform.OS === 'web') {
    usePeriodicData = require('@los/desktop/src/components/PeriodicNote/hooks/usePeriodicData').usePeriodicData;
} else {
    usePeriodicData = require('@los/mobile/src/components/PeriodicNote/hooks/usePeriodicData').usePeriodicData;
}

interface TextListsProps {
  startDate: string | Date;
  endDate: string | Date;
}

const TextLists: React.FC<TextListsProps> = ({ startDate, endDate }) => {
  const { theme, themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);

  const { dailyTextData } = usePeriodicData(startDate, endDate);

  const containerStyles = {
    success: 'successesContainer',
    beBetter: 'bebettersContainer'
  } as const;

  const formatDateWithDay = (dateString: string) => {
    const date = new Date(dateString);
    // return `${dateString} - ${format(date, 'EEEE')}`;
    return `${format(date, 'EEEE')}`;
  };

  const renderList = (title: string, dataKey: 'success' | 'beBetter') => (
    <View style={[styles.bothContainers]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.listContainer}>
        {dailyTextData.length > 0 ? (
          dailyTextData.map((note: DailyTextData) => (
            <View key={`${dataKey}-${note.date}`} style={styles.listItemContainer}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{formatDateWithDay(note.date)}</Text>
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.listItem}>{note[dataKey]}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: 'gray' }}>No data available</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.textContainer}>
      {renderList('Successes', 'success')}
      {renderList('Improvements', 'beBetter')}
    </View>
  );
};

const getStyles = (theme: any) => {
  const { width } = Dimensions.get('window');
  const isSmall = width < 1920;
  const isDesktop = Platform.OS === 'web';

  return StyleSheet.create({
    textContainer: {
      flexDirection: isSmall? 'column' : 'row',
      textAlign: 'center',
    },
    bothContainers: {
      alignItems: 'center',
      justifyContent: 'center',
      // borderWidth: 1,
      padding: 8,
      margin: 10,
      flexGrow: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.hoverColor,
      marginBottom: 8,
    },
    listContainer: {

    },
    listItemContainer: {
      marginBottom: 10,
      width: isDesktop ? '100%' : '70%',
      // borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    dateContainer: {
      width: isDesktop ? '50%' : '40%',
      // borderWidth: 1,
    },
    dateText: {
      fontWeight: 'bold',
      color: 'gray',
      // marginBottom: 5,
      marginRight: 10,
    },
    textWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      flex: 1,
    },
    listItem: {
      color: theme.textColor,
      flexShrink: 1,
      fontSize: 12
    },
  });
}

export default TextLists