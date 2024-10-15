import React, { useMemo } from 'react';
import { View, Dimensions, StyleSheet, Platform, Text } from 'react-native';

import SunburstChart from '../../../Charts/Sunburst/SunburstChart';
import EntriesList from '../atoms/EntriesList';
import SummaryItem from '../atoms/SummaryItem';

import { formatMoneyEntries } from '../../helpers/dataTransformer';
import { processMoneySunburstData } from '../../helpers/dataProcessing';
import { calculateMoneySummary } from '../../helpers/moneyHelpers';
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

const MoneySection: React.FC<ChartSectionProps> = ({
    startDate,
    endDate,
    tagColors,
}) => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);
    // Destructure both current and previous moneyData
    const { 
        current: { moneyData: currentMoneyData },
        previous: { moneyData: previousMoneyData }
    } = usePeriodicData(startDate, endDate);

    const moneySunburstData = useMemo(() => processMoneySunburstData(currentMoneyData), [currentMoneyData]);
    const moneyEntries = formatMoneyEntries(moneySunburstData, tagColors);
    
    const { width } = Dimensions.get('window');
    const chartWidth = width * 0.8;
    const chartHeight = Dimensions.get('window').height * 0.3;
    
    const moneySummary = useMemo(() => calculateMoneySummary(currentMoneyData, previousMoneyData, startDate, endDate), [currentMoneyData, previousMoneyData, startDate, endDate]);

    if (!moneySunburstData || !moneyEntries) {
        return (
            <View style={styles.container}>
                <Text style={styles.noDataText}>No Money data available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.chartContainer}>
                <SunburstChart
                    data={moneySunburstData}
                    width={chartWidth}
                    height={chartHeight}
                />
            </View>

            {moneyEntries.length > 0 && (
                <EntriesList entries={moneyEntries} title="Money Entries" valueLabel="€" />
            )}
            
            <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Money Summary</Text>
                <View style={styles.summaryGrid}>
                <SummaryItem 
                        title="Total Expenses" 
                        value={`€${moneySummary.totalExpenses.toFixed(2)}`}
                        change={moneySummary.totalExpensesChange}
                        isPercentage={true}
                    />
                    <SummaryItem 
                        title="Avg. Spent/Day" 
                        value={`€${moneySummary.averageSpentPerDay}`}
                        change={moneySummary.averageSpentPerDayChange}
                        isPercentage={false}
                    />
                    <SummaryItem title="Most Common Tag" value={moneySummary.mostCommonTag} />
                    <SummaryItem title="Most Expensive Tag" value={moneySummary.mostExpensiveTag} />
                    <SummaryItem title="Transactions" value={moneySummary.transactionCount.toString()} />
                    <SummaryItem title="Most Expensive Transaction" value={moneySummary.singleMostExpensiveTransaction} />
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
            backgroundColor: theme.backgroundColor,
        },
        chartContainer: {
            alignItems: 'center',
            marginBottom: 20,
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
        trendChartContainer: {
            marginBottom: 20,
        },
        chartTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            color: theme.textColor,
            textAlign: 'center',
        },
        noDataText: {
            color: 'gray',
            fontSize: 16,
            textAlign: 'center',
        },
        changeText: {
            fontSize: 12,
            fontWeight: 'bold',
            marginLeft: 5,
        },
    });
};

export default MoneySection;