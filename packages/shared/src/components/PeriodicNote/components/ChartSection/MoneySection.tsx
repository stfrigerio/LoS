import React, { useMemo } from 'react';
import { View, Dimensions, StyleSheet, Platform, Text } from 'react-native';

import SunburstChart from '../../../Charts/Sunburst/SunburstChart';
import EntriesList from '../EntriesList';

import { formatMoneyEntries } from '../../helpers/dataTransformer';
import { processMoneySunburstData } from '../../helpers/dataProcessing';
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

    if (!moneySunburstData || !moneyEntries) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'gray' }}>No Money data available.</Text>
            </View>
        );
    }

    return (
        <View>
            <View>
                <SunburstChart
                    data={moneySunburstData}
                    width={chartWidth}
                    height={chartHeight}
                />      
            </View>
            {moneyEntries.length > 0 && (
                <EntriesList entries={moneyEntries} title="Money Entries" valueLabel="€" />
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
    });
};

export default MoneySection;