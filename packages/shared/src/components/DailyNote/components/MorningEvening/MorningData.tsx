import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Platform } from 'react-native';
import { format } from 'date-fns';

import { getStyles } from './style';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { DailyNoteData } from '@los/shared/src/types/DailyNote';

import createTimePicker from '@los/shared/src/sharedComponents/DateTimePicker';

type MorningDataProps = {
    data?: DailyNoteData | null;
    onUpdate?: (morningData: Partial<DailyNoteData>) => void;
};

const MorningData: React.FC<MorningDataProps> = ({ data, onUpdate }) => {
    const initialData = {
        morningComment: data?.morningComment || '',
        wakeHour: data?.wakeHour || '',
        energy: data?.energy || 0,
    };
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(theme);
    const [morningData, setMorningData] = useState(initialData);


    useEffect(() => {
        setMorningData({
            morningComment: data?.morningComment || '',
            wakeHour: data?.wakeHour || '',
            energy: data?.energy || 0,
        });
    }, [data]);

    const handleInputChange = (field: keyof typeof initialData, value: string | number) => {
        const updatedData = { ...morningData, [field]: value };
        setMorningData(updatedData);
        onUpdate?.(updatedData as Partial<DailyNoteData>);
    };

    const { showPicker, picker } = createTimePicker();
    
    const red = themeColors.red;
    const yellow = themeColors.yellow;
    const green = themeColors.green;

    const handleWakeHourChange = (date: Date | undefined) => {
        if (date) {
            const formattedTime = format(date, 'HH:mm');
            handleInputChange('wakeHour', formattedTime);
        }
    };

    const showWakeHourPicker = () => {
        const currentDate = new Date();
        if (morningData.wakeHour) {
            const [hours, minutes] = morningData.wakeHour.split(':').map(Number);
            currentDate.setHours(hours, minutes);
        }

        showPicker({
            mode: 'time',
            value: currentDate,
            is24Hour: true,
        }, handleWakeHourChange);
    };

    const getWakeHourColor = (wakeHour: string): string => {
        const [hours, minutes] = wakeHour.split(':').map(Number);
        const decimalHour = hours + minutes / 60;
        if (decimalHour < 9.5) return green;
        if (decimalHour <= 11) return yellow;
        return red;
    };

    const getEnergyColor = (energy: number): string => {
        if (energy <= 4) return red;
        if (energy <= 7) return yellow;
        return green;
    };

    return (
        <View style={styles.MorningContainer}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Morning Comment: </Text>
                <TextInput
                    style={styles.input}
                    value={morningData.morningComment}
                    onChangeText={(value) => handleInputChange('morningComment', value)}
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Energy Level: </Text>
                <TextInput
                    style={[styles.input, { color: getEnergyColor(morningData.energy) }]}
                    value={morningData.energy.toString()}
                    keyboardType="numeric"
                    onChangeText={(value) => handleInputChange('energy', Number(value))}
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Wake Hour: </Text>
                <Pressable style={styles.timeInputWrapper} onPress={showWakeHourPicker}>
                    <TextInput
                        style={[styles.input, { color: getWakeHourColor(morningData.wakeHour) }]}
                        value={morningData.wakeHour}
                        editable={false}
                        placeholder="Tap to set time"
                        placeholderTextColor={'gray'}
                    />
                </Pressable>
            </View>
            {picker}
        </View>
    );
};

export default MorningData;
