import React, { useMemo, useState, useEffect } from 'react';
import { View, Dimensions, StyleSheet, Platform, Text } from 'react-native';

import BooleanHeatmap from '../../../Charts/Heatmaps/BooleansHeatmap/BooleansHeatmap';
import AlertModal from '@los/shared/src/components/modals/AlertModal';
import { PickerInput } from '../../../modals/components/FormComponents';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

let usePeriodicData: any;
if (Platform.OS === 'web') {
    usePeriodicData = require('@los/desktop/src/components/PeriodicNote/hooks/usePeriodicData').usePeriodicData;
} else {
    usePeriodicData = require('@los/mobile/src/components/PeriodicNote/hooks/usePeriodicData').usePeriodicData;
}

interface BooleanSectionProps {
    startDate: Date;
    endDate: Date;
    periodType: string;
}

const BooleanSection: React.FC<BooleanSectionProps> = ({ 
    startDate, 
    endDate,
    periodType,
}) => {
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);
    const [error, setError] = useState<Error | null>(null);
    const [selectedHabit, setSelectedHabit] = useState<string>('');
    const [selectedHabitName, setSelectedHabitName] = useState<string>('');

    const { width } = Dimensions.get('window');
    const chartWidth = width * 0.8;
    const chartHeight = 200; // Adjust as needed

    const { current: { dailyNoteData, userSettingsBooleans } } = usePeriodicData(startDate, endDate);

    const booleanItems = useMemo(() => [
        { label: 'None', value: '' },
        ...userSettingsBooleans.map((habit: any) => ({
            label: `${habit.settingKey} ${habit.value}`,
            value: habit.uuid,
            settingKey: habit.settingKey
        }))
    ], [userSettingsBooleans]);

    const handleHabitChange = (value: string) => {
        const selectedItem = booleanItems.find(item => item.value === value);
        if (selectedItem) {
            setSelectedHabit(selectedItem.value);
            setSelectedHabitName(selectedItem.settingKey);
        } else {
            setSelectedHabit('');
            setSelectedHabitName('');
        }
    };

    const booleanHabitsData = useMemo(() => {
        try {
            if (!dailyNoteData || dailyNoteData.length === 0 || !selectedHabit) {
                // console.log('No data or selected habit');
                return null;
            }
    
            const selectedHabitData = userSettingsBooleans.find((h: any) => h.uuid === selectedHabit);
            if (!selectedHabitData) {
                console.log('Selected habit not found in userSettingsBooleans');
                return null;
            }
    
            const processedData: { [date: string]: boolean } = {};
            let hasAnyData = false;
    
            dailyNoteData.forEach((note: any) => {
                const habitValue = note.booleanHabits[selectedHabitData.settingKey];
                if (habitValue !== undefined) {
                    processedData[note.date] = habitValue === true || habitValue === 1 || habitValue === '1' || habitValue === 'true';
                    hasAnyData = true;
                } else {
                    processedData[note.date] = false; // or you might want to use null to indicate no data
                }
            });
    
            return hasAnyData ? processedData : null;
        } catch (err) {
            console.error("Error in booleanHabitsData calculation:", err);
            setError(err instanceof Error ? err : new Error('Error in data processing'));
            return null;
        }
    }, [dailyNoteData, selectedHabit, userSettingsBooleans]);

    useEffect(() => {
        if (booleanItems.length > 1) {
            setSelectedHabit(booleanItems[1].value); // Select the first habit by default
        }
    }, [booleanItems]);
    
    if (error) {
        return (
            <AlertModal
                isVisible={true}
                title="Error in BooleanSection"
                message={`An error occurred: ${error.message}\nPlease take a screenshot and send it to support.`}
                onConfirm={() => setError(null)}
                onCancel={() => setError(null)}
            />
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.pickerContainer}>
                <PickerInput
                    label="Select Boolean Habit"
                    selectedValue={selectedHabit}
                    onValueChange={(item) => handleHabitChange(item)}
                    items={booleanItems}
                />
            </View>
            {booleanHabitsData ? (
                <BooleanHeatmap 
                    data={booleanHabitsData}
                    width={chartWidth}
                    height={chartHeight}
                    habitName={selectedHabitName}
                />
            ) : (
                <Text style={{ color: 'gray' }}>No data available for the selected habit.</Text>
            )}
        </View>
    );
};

const getStyles = (theme: any) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        pickerContainer: {
            marginBottom: 10,
            marginHorizontal: 40
        },
    });
};

export default BooleanSection;