import React, { useMemo } from 'react';
import { View, Dimensions, StyleSheet, Platform, Text } from 'react-native';

import SleepChart from '../../../Charts/SleepChart/SleepChart';

import { processSleepData } from '../../helpers/dataProcessing';
import { useSleepData } from '../../helpers/sleepCalculation';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

let usePeriodicData: any;
if (Platform.OS === 'web') {
    usePeriodicData = require('@los/desktop/src/components/PeriodicNote/hooks/usePeriodicData').usePeriodicData;
} else {
    usePeriodicData = require('@los/mobile/src/components/PeriodicNote/hooks/usePeriodicData').usePeriodicData;
}

interface ChartSectionProps {
    startDate: Date;
    endDate: Date;
    periodType: string;
}

interface SleepEntry {
    date: string;
    sleep_time: string;
    wake_hour: string;
}

const SleepSection: React.FC<ChartSectionProps> = ({ 
    startDate,
    endDate,
    periodType,
}) => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const { dailyNoteData } = usePeriodicData(startDate, endDate);
    const sleepData = useMemo(() => {
        if (dailyNoteData) {
            return processSleepData(dailyNoteData);
        }
        return null;
    }, [dailyNoteData]);

    const { sleepAverages, processedSleepData } = useSleepData({ 
        fetchedSleepData: sleepData || undefined 
    });

    const { width } = Dimensions.get('window');
    const chartWidth = width * 0.8;
    const chartHeight = Dimensions.get('window').height * 0.3;

    if (!processedSleepData) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'gray' }}>No Sleep data available.</Text>
            </View>
        );
    }

    const validSleepData = processedSleepData.filter(
        (entry): entry is SleepEntry => 
            entry !== null &&
            typeof entry === 'object' &&
            'date' in entry &&
            'sleep_time' in entry &&
            'wake_hour' in entry &&
            typeof entry.date === 'string' &&
            typeof entry.sleep_time === 'string' &&
            typeof entry.wake_hour === 'string'
    );

    const openNote = () => {
        console.log('openNote');
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <SleepChart
                sleepData={validSleepData}
                openNoteForDay={openNote}
                width={chartWidth}
                height={chartHeight}
                isMonthView={periodType === 'month'}
            />
        </View>
    );
};

const getStyles = (theme: any) => {
    const { width } = Dimensions.get('window');
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
};

export default SleepSection;