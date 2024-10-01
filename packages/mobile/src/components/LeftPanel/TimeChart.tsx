import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Switch, Text, StyleSheet, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChartPie, faClock } from '@fortawesome/free-solid-svg-icons';

import { databaseManagers } from '../../database/tables';
import { getDatesOfWeek } from '@los/shared/src/utilities/timeUtils';
import { formatTimeEntries } from '@los/shared/src/components/PeriodicNote/helpers/dataTransformer';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { processTimeSunburstData } from '@los/shared/src/components/PeriodicNote/helpers/dataProcessing';
import { processHourData } from '@los/shared/src/components/Charts/Sunburst/dataProcessing';
import { processTimerSpanningMidnight } from './helpers/chartDataProcessing';
import { useColors } from '@los/mobile/src/components/useColors';

import EntriesList from '@los/shared/src/components/PeriodicNote/components/EntriesList';
import SunburstChart, { SunBurstRecord} from '@los/shared/src/components/Charts/Sunburst/SunburstChart';
import HoursSunburst, { HourData } from '@los/shared/src/components/Charts/Sunburst/24hSunburstChart';
import { TimeData } from '@los/shared/src/types/Time';

function TimeSunburstChart() {
    const [chartData, setChartData] = useState<SunBurstRecord | null>(null);
    const [isWeekly, setIsWeekly] = useState(false);
    const [totalHours, setTotalHours] = useState(0);
    const [hourData, setHourData] = useState<HourData[] | null>(null);
    const [showHoursSunburst, setShowHoursSunburst] = useState(false);
    const [is12HourView, setIs12HourView] = useState(false);

    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);
    const { colors: tagColors } = useColors();

    async function fetchData(dateRange: string[]) {
        try {
            const data: TimeData[] = await databaseManagers.time.getTime({ dateRange: dateRange });
            const totalSeconds = data.reduce((sum, record) => {
                const [hours, minutes, seconds] = (record.duration || '00:00:00').split(':').map(Number);
                return sum + (hours * 3600 + minutes * 60 + seconds);
            }, 0);
            const totalHours = totalSeconds / 3600;
            setTotalHours(totalHours);
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            setTotalHours(0);
            return [];
        }
    }

    useEffect(() => {
        const fetchAndProcessData = async () => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            let dateRange = [yesterday.toISOString().split('T')[0], today.toISOString().split('T')[0]];

            if (isWeekly && !showHoursSunburst) {
                dateRange = getDatesOfWeek(today).map(date => date.toISOString().split('T')[0]);
            }

            try {
                let data = await fetchData(dateRange);
                data = data.filter(record => record.endTime); // Filter out rows with no endTime or undefined
                if (data.length === 0) {
                    console.log("No data found for the selected range.");
                    setChartData(null);
                    return;
                }

                let timeSuburstData, hoursSunburstData;

                if (!isWeekly) {
                    const processedData = processTimerSpanningMidnight(data);
                    timeSuburstData = processTimeSunburstData(processedData);
                    hoursSunburstData = processHourData(processedData);
                } else {
                    timeSuburstData = processTimeSunburstData(data);
                    hoursSunburstData = processHourData(data);
                }
                
                setChartData(timeSuburstData);
                setHourData(hoursSunburstData);
            } catch (error) {
                console.error('Error processing data:', error);
                setChartData(null);
            }
        };

        fetchAndProcessData();
    }, [isWeekly, showHoursSunburst]);

    const handleShowHoursSunburst = (value: boolean) => {
        setShowHoursSunburst(value);
        if (value) {
            setIsWeekly(false);
        }
    };

    const timeEntries = useMemo(() => 
        chartData ? formatTimeEntries(chartData, tagColors) : [],
        [chartData]
    );

    const getCurrentHalfDay = useCallback(() => {
        const currentHour = new Date().getHours();
        return currentHour < 12 ? 'AM' : 'PM';
    }, []);

    const [currentHalfDay, setCurrentHalfDay] = useState(getCurrentHalfDay());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHalfDay(getCurrentHalfDay());
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [getCurrentHalfDay]);

    const filteredHourData = useMemo(() => {
        if (!is12HourView || !hourData) return hourData;
        const startHour = currentHalfDay === 'AM' ? 0 : 12;
        return hourData.filter(data => data.hour >= startHour && data.hour < startHour + 12);
    }, [hourData, is12HourView, currentHalfDay]);
    
    // Dimensions for the chart
    const screenWidth = 250;
    const screenHeight = 200;

    return (
        <View>
            <View style={{ height: 20}} />
            <View style={styles.viewToggleContainer}>
                <Pressable
                    onPress={() => handleShowHoursSunburst(false)}
                    style={styles.iconButton}
                >
                    <FontAwesomeIcon
                        icon={faChartPie}
                        size={24}
                        color={!showHoursSunburst ? themeColors.hoverColor : 'gray'}
                    />
                </Pressable>
                <Pressable
                    onPress={() => handleShowHoursSunburst(true)}
                    style={styles.iconButton}
                >
                    <FontAwesomeIcon
                        icon={faClock}
                        size={24}
                        color={showHoursSunburst ? themeColors.hoverColor : 'gray'}
                    />
                </Pressable>
            </View>

            {!showHoursSunburst && chartData && (
                <SunburstChart 
                    data={chartData}
                    width={screenWidth}
                    height={screenHeight}
                />
            )}
            {/* ho fatto casino con le interfaces */}
            {showHoursSunburst && hourData && (
                <HoursSunburst data={filteredHourData as any} width={screenWidth} height={screenHeight} />
            )}

            <View style={styles.controlsContainer}>
                <Text style={designs.text.text}>
                    {showHoursSunburst ? is12HourView ? `12-Hour View` : '24-Hour View' : (isWeekly ? 'Weekly Data' : 'Daily Data')}
                </Text>
                {showHoursSunburst && is12HourView ? <Text style={styles.ampmText}>({currentHalfDay.toLowerCase()})</Text> : null}
                <Text style={designs.text.text}>{totalHours.toFixed(2)} hrs</Text>
                {showHoursSunburst ? (
                    <>
                        <Switch
                            value={is12HourView}
                            onValueChange={(value) => setIs12HourView(value)}
                        />
                    </>
                ) : (
                    <>
                        <Switch
                            value={isWeekly}
                            onValueChange={(value) => setIsWeekly(value)}
                        />
                    </>
                )}
            </View>
            {/* <View style={styles.entriesContainer}> 
                <EntriesList entries={timeEntries} title="Time Entries" valueLabel="" />
            </View> */}
        </View>
    );  
}

export default TimeSunburstChart;

const getStyles = (theme: any) => StyleSheet.create({
    controlsContainer: {
        flexDirection: 'row', // Horizontal layout for the switch and texts
        padding: 5,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    container: {
        padding: 5,
        paddingVertical: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    entriesContainer: {
        marginLeft: -15
    },
    viewToggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    iconButton: {
        padding: 5,
        marginHorizontal: 10,
    },
    ampmText: {
        color: 'gray',
        marginLeft: -12,
        fontSize: 12
    },
});