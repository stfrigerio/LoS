import React, { useMemo, useState } from 'react';
import { View, Dimensions, StyleSheet, Platform, Text, Pressable } from 'react-native';

import EntriesList from '../EntriesList';
import SunburstChart from '../../../Charts/Sunburst/SunburstChart';
import TimeHeatmap from '../../../Charts/Heatmaps/TimeHeatmap/TimeHeatmap';

import { formatTimeEntries } from '../../helpers/dataTransformer';
import { processTimeSunburstData } from '../../helpers/dataProcessing';
import { processMultiDayHourData } from '@los/shared/src/components/Charts/Sunburst/dataProcessing';
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

    const { timeData } = usePeriodicData(startDate, endDate);
    // log the timeData when date is 2024-08-28
    // console.log("timeData: ", timeData.filter((entry: any) => entry.date === "2024-08-28"));
    const timeSunburstData = useMemo(() => processTimeSunburstData(timeData), [timeData]);
    const timeHeatmapData = useMemo(() => processMultiDayHourData(timeData), [timeData]);
    
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
            <View style={styles.container}>
                <Text style={{ color: 'gray' }}>No Time data available.</Text>
            </View>
        );
    }

    return (
        <View>
            <View>
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
    });
};

export default ChartSection;