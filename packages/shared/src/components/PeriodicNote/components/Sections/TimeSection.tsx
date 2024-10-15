import React, { useMemo, useState } from 'react';
import { View, Dimensions, StyleSheet, Platform, Text, Pressable, Switch } from 'react-native';

import EntriesList from '../atoms/EntriesList';
import SunburstChart from '../../../Charts/Sunburst/SunburstChart';
import TimeHeatmap from '../../../Charts/Heatmaps/TimeHeatmap/TimeHeatmap';
import SummaryItem from '../atoms/SummaryItem';
import { formatTimeEntries } from '../../helpers/dataTransformer';
import { processTimeSunburstData } from '../../helpers/dataProcessing';
import { processMultiDayHourData } from '@los/shared/src/components/Charts/Sunburst/dataProcessing';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { calculateTimeSummary } from '../../helpers/timeHelpers';

let usePeriodicData: any;
if (Platform.OS === 'web') {
    usePeriodicData = require('@los/desktop/src/components/PeriodicNote/hooks/usePeriodicData').usePeriodicData;
} else {
    usePeriodicData = require('@los/mobile/src/components/PeriodicNote/hooks/usePeriodicData').usePeriodicData;
}

interface ChartSectionProps {
    startDate: Date;
    endDate: Date;
    tagColors: any;
}

const ChartSection: React.FC<ChartSectionProps> = ({ 
    startDate,
    endDate,
    tagColors,
}) => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);
    const [isHeatmapLoaded, setIsHeatmapLoaded] = useState(false);
    const [excludeSleep, setExcludeSleep] = useState(false);

    const { current: { timeData }, previous: { timeData: previousTimeData } } = usePeriodicData(startDate, endDate);

    const filteredTimeData = useMemo(() => {
        if (!excludeSleep) return timeData;
        return timeData.filter((entry: any) => entry.tag.toLowerCase() !== 'sleep');
    }, [timeData, excludeSleep]);

    const filteredPreviousTimeData = useMemo(() => {
        if (!excludeSleep) return previousTimeData;
        return previousTimeData.filter((entry: any) => entry.tag.toLowerCase() !== 'sleep');
    }, [previousTimeData, excludeSleep]);

    const timeSunburstData = useMemo(() => processTimeSunburstData(filteredTimeData), [filteredTimeData]);
    const timeHeatmapData = useMemo(() => processMultiDayHourData(filteredTimeData), [filteredTimeData]);
    const timeSummary = useMemo(() => calculateTimeSummary(filteredTimeData, filteredPreviousTimeData), [filteredTimeData, filteredPreviousTimeData]);

    const timeHeatmapDataCurrentPeriod = useMemo(() => {
        return timeHeatmapData.filter((entry: any) => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate < new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
        });
    }, [timeHeatmapData, startDate, endDate]);
    
    const timeEntries = formatTimeEntries(timeSunburstData, tagColors);

    const { width } = Dimensions.get('window');
    const chartWidth = width * 0.8;
    const chartHeight = Dimensions.get('window').height * 0.3;

    if (!timeSunburstData || !timeEntries) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: 'gray' }}>No Time data available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Exclude Sleep</Text>
                <Switch
                    value={excludeSleep}
                    onValueChange={setExcludeSleep}
                    trackColor={{ false: theme.switchTrackColor, true: theme.switchTrackColorOn }}
                    thumbColor={excludeSleep ? theme.switchThumbColorOn : theme.switchThumbColor}
                />
            </View>
            <View >
                <SunburstChart
                    data={timeSunburstData}
                    width={chartWidth}
                    height={chartHeight}
                />      
            </View>
            {timeEntries.length > 0 && (
                <EntriesList entries={timeEntries} title="Time Entries" valueLabel="" />
            )}
            {!isHeatmapLoaded && (
                <Pressable style={styles.loadHeatmapButton} onPress={() => setIsHeatmapLoaded(true)}>
                    <Text style={styles.loadHeatmapButtonText}>Load Heatmap</Text>
                </Pressable>
            )}
            {isHeatmapLoaded && (
                <View>
                    <TimeHeatmap
                        data={timeHeatmapDataCurrentPeriod}
                        width={chartWidth}
                        height={chartHeight}
                    />
                </View>
            )}
            <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Time Summary</Text>
                <View style={styles.summaryGrid}>
                    <SummaryItem 
                        title="Total Time" 
                        value={timeSummary.totalTime}
                        // change={timeSummary.totalTimeChange}
                        // isPercentage={true}
                        // isTime={true}
                    />
                    <SummaryItem 
                        title="Time Tracked Per Day" 
                        value={timeSummary.timeTrackedPerDay}
                        // change={timeSummary.timeTrackedPerDayChange}
                        // isPercentage={false}
                        // isTime={true}
                    />
                    <SummaryItem title="Most Common Tag" value={timeSummary.mostCommonTag} />
                    <SummaryItem title="Longest Single Timer" value={timeSummary.longestSingleEntry} />
                    <SummaryItem title="Timers" value={timeSummary.numberOfTimers.toString()} />
                </View>
            </View>
        </View>
    );
};

const getStyles = (theme: any) => {
    const { width } = Dimensions.get('window');
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            paddingTop: 0,
            backgroundColor: theme.backgroundColor,
        },
        toggleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
        },
        toggleLabel: {
            marginRight: 10,
            fontSize: 16,
            color: theme.textColor,
        },
        loadHeatmapButton: {
            backgroundColor: theme.buttonColor,
            padding: 10,
            borderRadius: 5,
            margin: 10,
            marginTop: 30,
            alignSelf: 'center',
        },
        loadHeatmapButtonText: {
            color: theme.textColorItalic,
            fontSize: 16,
            fontStyle: 'italic',
        },
        summaryContainer: {
            marginBottom: 20,
            padding: 15,
            borderRadius: 10,
        },
        summaryTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 15,
            color: theme.textColor,
            textAlign: 'center',
        },
        summaryGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
    });
};

export default ChartSection;