import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

import QuantifiableHabit from './QuantifiableHabit';

import capitalize from '@los/shared/src/utilities/textManipulation';
import { habitThresholds, getColorForValue } from './helpers/colors';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { QuantifiableHabitsData } from '@los/shared/src/types/QuantifiableHabits';
import { UseQuantifiableHabitsType } from '../../types/QuantifiableHabits';

let useQuantifiableHabits: UseQuantifiableHabitsType;
if (Platform.OS === 'web') {
    useQuantifiableHabits = require('@los/desktop/src/components/DailyNote/hooks/useQuantifiableHabits').useQuantifiableHabits;
} else {
    useQuantifiableHabits = require('@los/mobile/src/components/DailyNote/hooks/useQuantifiableHabits').useQuantifiableHabits;
}

export interface QuantifiableHabitsProps {
    data: QuantifiableHabitsData[];
    date: string;
}

const QuantifiableHabits: React.FC<QuantifiableHabitsProps> = ({ data, date }) => {
    const { habits, emojis, handleIncrement, handleDecrement, scheduleMindfulReminder } = useQuantifiableHabits(data, date);
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);

    //^ My personal shit
    const habitOrder = ['Cigarettes', 'Herbs', 'Coffees', 'Alcohols'];
    const sortedHabits = Object.entries(habits ?? {}).sort((a, b) => {
        const orderA = habitOrder.indexOf(a[0]);
        const orderB = habitOrder.indexOf(b[0]);

        if (orderA !== -1 && orderB !== -1) {
            return orderA - orderB;
        }
        if (orderA === -1) {
            return 1;
        }
        if (orderB === -1) {
            return -1;
        }
        return a[0].localeCompare(b[0]);
    });

    return (
        <View style={styles.QuantifiableHabitsContainer}>
            {sortedHabits.map(([key, habitData]) => {
                const habitDisplay = emojis[key] || capitalize(key);
                const color = getColorForValue(
                    key as keyof typeof habitThresholds,
                    habitData.value,
                    'rgba(250, 37, 37, 0.8)', // Color for high values (red)
                    'rgba(204, 197, 20, 0.9)', // Color for medium values (yellow)
                    'rgba(61, 247, 52, 0.5)', // Color for low values (green)
                    'rgba(200, 200, 200, 0.6)' // Default color for unspecified habits
                );

                return (
                    <QuantifiableHabit
                        key={key}
                        name={habitDisplay}
                        value={habitData.value}
                        color={color}
                        onIncrement={() => handleIncrement(habitData.uuid, key)}
                        onDecrement={() => handleDecrement(habitData.uuid, key)}
                    />
                );
            })}
        </View>
    );
};

export default QuantifiableHabits;

const getStyles = (theme: any) => StyleSheet.create({
    QuantifiableHabitsContainer: {
        flex: 1,
        marginTop: 10,
        padding: 15,
    },
});