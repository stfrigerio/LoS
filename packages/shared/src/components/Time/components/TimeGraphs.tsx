import React, { useMemo, useState, useEffect } from 'react';
import { View, Dimensions, StyleSheet, Platform, Text, ScrollView, Pressable } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

import SunburstChart from '@los/shared/src/components/Charts/Sunburst/SunburstChart';
import EntriesList from '@los/shared/src/components/PeriodicNote/components/EntriesList';
import FullScreenHeatmap from './FullScreenHeatmap';

import { formatTimeEntries } from '@los/shared/src/components/PeriodicNote/helpers/dataTransformer';
import { processTimeSunburstData } from '@los/shared/src/components/PeriodicNote/helpers/dataProcessing';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { processMultiDayHourData } from '@los/shared/src/components/Charts/Sunburst/dataProcessing';

import { TimeData } from '../../../types/Time';
import TimeHeatmap from '../../Charts/Heatmaps/TimeHeatmap/TimeHeatmap';

let useColors: any;
if (Platform.OS === 'web') {
    useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
    useColors = require('@los/mobile/src/components/useColors').useColors;
}

interface ChartSectionProps {
    entries: TimeData[];
}

const TimeGraphs: React.FC<ChartSectionProps> = ({ 
    entries,
}) => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);
    const { colors: tagColors} = useColors();

    const [isFullScreenHeatmapVisible, setIsFullScreenHeatmapVisible] = useState(false);
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));

    const timeSunburstData = useMemo(() => processTimeSunburstData(entries), [entries]);
    const timeEntries = formatTimeEntries(timeSunburstData, tagColors);
    const timeHeatmapData = useMemo(() => processMultiDayHourData(entries), [entries]);

    const chartWidth = dimensions.width * 0.88; //^ boh, affects only heatmap e non so se va bene su tutti i devices
    const chartHeight = dimensions.height * 0.3;

    useEffect(() => {
        const handleOrientationChange = async () => {
            if (isFullScreenHeatmapVisible) {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            } else {
                await ScreenOrientation.unlockAsync();
            }
        };

        handleOrientationChange();

        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });

        return () => {
            ScreenOrientation.unlockAsync();
            subscription.remove();
        };
    }, [isFullScreenHeatmapVisible]);

    if (!timeSunburstData || !timeEntries) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'gray' }}>No Time data available.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ marginBottom: 50 }}>
            <View style={{ alignItems: 'center' }}>
                <SunburstChart
                    data={timeSunburstData}
                    width={chartWidth}
                    height={chartHeight}
                />      
            </View>
            {timeEntries.length > 0 && (
                <EntriesList entries={timeEntries} title="Time Entries" valueLabel="" />
            )}
            <Pressable onPress={() => setIsFullScreenHeatmapVisible(true)}>
                <View>
                    <TimeHeatmap
                        data={timeHeatmapData}
                        width={chartWidth}
                        height={chartHeight}
                    />
                </View>
            </Pressable>
            {isFullScreenHeatmapVisible && (
                <FullScreenHeatmap
                    isVisible={isFullScreenHeatmapVisible}
                    onClose={() => setIsFullScreenHeatmapVisible(false)}
                    data={timeHeatmapData}
                />
            )}
        </ScrollView>
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

export default TimeGraphs;