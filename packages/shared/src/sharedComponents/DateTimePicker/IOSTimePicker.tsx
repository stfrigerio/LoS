import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimePickerOptions {
    mode: 'date' | 'time' | 'datetime';
    value: Date;
    is24Hour?: boolean;
    minimumDate?: Date;
    maximumDate?: Date;
}

const IOSTimePicker = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentMode, setCurrentMode] = useState<'date' | 'time'>('date');
    const [tempDate, setTempDate] = useState<Date>(new Date());
    const [callback, setCallback] = useState<((date: Date | undefined) => void) | null>(null);

    const showPicker = (options: TimePickerOptions, onChange: (date: Date | undefined) => void) => {
        const { mode, value, minimumDate, maximumDate } = options;

        setTempDate(value);
        setCallback(() => onChange);

        if (mode === 'datetime') {
        setCurrentMode('date');
        } else {
        setCurrentMode(mode);
        }

        setIsVisible(true);
    };

    const handleChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
        setIsVisible(false);
        if (callback) callback(undefined);
        return;
        }

        const currentDate = selectedDate || tempDate;
        setTempDate(currentDate);

        if (currentMode === 'date' && callback) {
        setCurrentMode('time');
        } else {
        setIsVisible(false);
        if (callback) callback(currentDate);
        }
    };

    return {
        showPicker,
        picker: (
        <Modal
            transparent={true}
            visible={isVisible}
            onRequestClose={() => setIsVisible(false)}
        >
            <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <DateTimePicker
                testID="dateTimePicker"
                value={tempDate}
                mode={currentMode}
                is24Hour={true}
                display="spinner"
                onChange={handleChange}
                />
                <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    setIsVisible(false);
                    if (callback) callback(undefined);
                }}
                >
                <Text style={styles.textStyle}>Cancel</Text>
                </TouchableOpacity>
            </View>
            </View>
        </Modal>
        ),
    };
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        backgroundColor: '#2196F3',
        marginTop: 15,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default IOSTimePicker;