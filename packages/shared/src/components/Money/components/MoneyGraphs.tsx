import React, { useMemo } from 'react';
import { View, Dimensions, StyleSheet, Platform, Text, ScrollView } from 'react-native';

import SunburstChart from '@los/shared/src/components/Charts/Sunburst/SunburstChart';
import EntriesList from '@los/shared/src/components/PeriodicNote/components/EntriesList';

import { formatMoneyEntries } from '@los/shared/src/components/PeriodicNote/helpers/dataTransformer';
import { processMoneySunburstData } from '@los/shared/src/components/PeriodicNote/helpers/dataProcessing';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { MoneyData } from '../../../types/Money';

let useColors: any;
if (Platform.OS === 'web') {
    useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
    useColors = require('@los/mobile/src/components/useColors').useColors;
}

interface ChartSectionProps {
    transactions: MoneyData[];
}

const MoneyGraphs: React.FC<ChartSectionProps> = ({ transactions }) => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);
    const { colors: tagColors} = useColors();

    const moneySunburstData = useMemo(() => processMoneySunburstData(transactions), [transactions]);

    const moneyEntries = formatMoneyEntries(moneySunburstData, tagColors);

    const { width } = Dimensions.get('window');
    const chartWidth = width * 0.8;
    const chartHeight = Dimensions.get('window').height * 0.3;

    if (!moneySunburstData || !moneyEntries) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'gray' }}>No Money data available.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ marginBottom: 50 }}>
            <View style={{ alignItems: 'center' }}>
                <SunburstChart
                    data={moneySunburstData}
                    width={chartWidth}
                    height={chartHeight}
                />      
            </View>
            {moneyEntries.length > 0 && (
                <EntriesList entries={moneyEntries} title="Money Entries" valueLabel="€" />
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

export default MoneyGraphs;