import React, { useMemo } from 'react';
import { View, Dimensions, StyleSheet, Platform, Text } from 'react-native';
import SunburstChart from '../../../Charts/Sunburst/SunburstChart';
import EntriesList from '../atoms/EntriesList';
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
    const { moneyData } = usePeriodicData(startDate, endDate);
    const moneySunburstData = useMemo(() => processMoneySunburstData(moneyData), [moneyData]);
    const moneyEntries = formatMoneyEntries(moneySunburstData, tagColors);
    const { width } = Dimensions.get('window');
    const chartWidth = width * 0.8;
    const chartHeight = Dimensions.get('window').height * 0.3;
    const moneySummary = useMemo(() => calculateMoneySummary(moneyData, startDate, endDate), [moneyData, startDate, endDate]);

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
                    <SummaryItem title="Total Expenses" value={`€${moneySummary.totalExpenses.toFixed(2)}`} />
                    <SummaryItem title="Most Common Tag" value={moneySummary.mostCommonTag} />
                    <SummaryItem title="Transactions" value={moneySummary.transactionCount.toString()} />
                    <SummaryItem title="Avg. Spent/Day" value={`€${moneySummary.averageSpentPerDay}`} />
                </View>
            </View>


        </View>
    );
};

const SummaryItem = ({ title, value }: { title: string; value: string }) => {
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);
    
    return (
        <View style={styles.summaryItem}>
            <Text style={styles.summaryItemTitle}>{title}</Text>
            <Text style={styles.summaryItemValue}>{value}</Text>
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
        summaryItem: {
            width: '48%',
            marginBottom: 15,
            padding: 10,
            borderRadius: 8,
            backgroundColor: theme.backgroundSecondary,
        },
        summaryItemTitle: {
            fontSize: 14,
            color: theme.secondaryTextColor,
            marginBottom: 5,
        },
        summaryItemValue: {
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.primaryTextColor,
        },
        trendChartContainer: {
            marginBottom: 20,
        },
        chartTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            color: theme.primaryTextColor,
            textAlign: 'center',
        },
        noDataText: {
            color: theme.secondaryTextColor,
            fontSize: 16,
            textAlign: 'center',
        },
    });
};

export default MoneySection;