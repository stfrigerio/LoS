import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

// Define a type for the props
type QuantifiableHabitProps = {
    name: string;
    value: number;
    color: string;
    onIncrement: () => void;
    onDecrement: () => void;
};

const QuantifiableHabit: React.FC<QuantifiableHabitProps> = ({ name, value, color, onIncrement, onDecrement }) => {
    const { theme, themeColors, designs } = useThemeStyles();

    const getStyles = (theme: any) => StyleSheet.create({
        habit: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        habitName: {
            flexGrow: 1,
            marginLeft: 25,
            flexShrink: 1,
            color: theme.textColor,
            fontSize: 18, // Adjust font size for emojis
            textAlignVertical: 'center', // Align text vertically
        },
        habitValue: {
            width: 44,
            textAlign: 'center',
            marginRight: 5,
            color: color,
            lineHeight: 24, // Align text vertically
        },
        button: {
            marginLeft: 50, // Reduce the left margin for the button
            padding: 8, // Adjust padding for touch area
            justifyContent: 'center',
            alignItems: 'center',
        },
        buttonText: {
            color: theme.textColor,
            fontSize: 20, 
        },
        incrementButton: {
            marginLeft: 50, 
        },
        decrementButton: {
            marginLeft: 30, 
        },
    });

    const styles = getStyles(themeColors);

    return (
        <View style={styles.habit}>
            <Text style={styles.habitName}>{`${name}`}</Text>
            <Text style={styles.habitValue}>{value}</Text>
            <TouchableOpacity style={[styles.button, styles.incrementButton]} onPress={onIncrement}>
                <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.decrementButton]} onPress={onDecrement}>
                <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
        </View>
    );
}

export default QuantifiableHabit;

