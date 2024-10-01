import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Platform } from 'react-native';
import { format } from 'date-fns';

import createTimePicker from '@los/shared/src/sharedComponents/DateTimePicker';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { getStyles } from './style';
import { DailyNoteData } from '@los/shared/src/types/DailyNote';

type EveningDataProps = {
    data?: DailyNoteData | null;
    onUpdate?: (eveningData: Partial<DailyNoteData>) => void;
};

const EveningData: React.FC<EveningDataProps> = ({ data, onUpdate }) => {
    const initialData = {
        success: data?.success || '',
        beBetter: data?.beBetter || '',
        dayRating: data?.dayRating || 0,
        sleepTime: data?.sleepTime || '',
    };
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(theme);
    const [eveningData, setEveningData] = useState(initialData);

    useEffect(() => {
        setEveningData({
            success: data?.success || '',
            beBetter: data?.beBetter || '',
            dayRating: data?.dayRating || 0,
            sleepTime: data?.sleepTime || '',
        });
    }, [data]);

    const { showPicker, picker } = createTimePicker();

    const handleInputChange = (field: keyof typeof initialData, value: string | number) => {
        const updatedData = { ...eveningData, [field]: value };
        setEveningData(updatedData);
        onUpdate?.(updatedData as Partial<DailyNoteData>);
    };

    const handleSleepTimeChange = (date: Date | undefined) => {
        if (date) {
            const formattedTime = format(date, 'HH:mm');
            handleInputChange('sleepTime', formattedTime);
        }
    };

    const showSleepTimePicker = () => {
        const currentDate = new Date();
        if (eveningData.sleepTime) {
            const [hours, minutes] = eveningData.sleepTime.split(':').map(Number);
            currentDate.setHours(hours, minutes);
        }

        showPicker({
            mode: 'time',
            value: currentDate,
            is24Hour: true,
        }, handleSleepTimeChange);
    };

    const red = themeColors.red;
    const yellow = themeColors.yellow;
    const green = themeColors.green;

    const getDayRatingColor = (rating: number): string => {
        if (rating <= 4) return red;
        if (rating <= 7) return yellow;
        return green;
    };

    const getSleepTimeColor = (bedTime: string | null): string => {
        const time = parseFloat(bedTime || '0');
    
        if ((time >= 23 && time <= 24) || (time >= 0 && time < 1)) {
            return green;
        } else if (time >= 1 && time < 5) {
            return yellow;
        } else {
            return red;
        }
    };

    return (
        <View style={styles.EveningContainer}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Success: </Text>
                <TextInput
                    style={styles.input}
                    value={eveningData.success}
                    onChangeText={(value) => handleInputChange('success', value)}
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Be Better: </Text>
                <TextInput
                    style={styles.input}
                    value={eveningData.beBetter}
                    onChangeText={(value) => handleInputChange('beBetter', value)}
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Day Rating: </Text>
                <TextInput
                    style={[styles.input, { color: getDayRatingColor(eveningData.dayRating) }]}
                    value={eveningData.dayRating.toString()}
                    keyboardType="numeric"
                    onChangeText={(value) => handleInputChange('dayRating', Number(value))}
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Sleep Time: </Text>
                <View style={styles.timeInputContainer}>
                    <Pressable style={styles.timeInputWrapper} onPress={showSleepTimePicker}>
                        <TextInput
                            style={[styles.input, { color: getSleepTimeColor(eveningData.sleepTime) }]}
                            value={eveningData.sleepTime}
                            editable={false}
                            placeholder="Tap to set time"
                            placeholderTextColor={'gray'}
                        />
                    </Pressable>
                </View>
            </View>
            {picker}
        </View>
    );
};

export default EveningData;
