import { Platform } from 'react-native';

interface TimePickerOptions {
    mode: 'date' | 'time' | 'datetime';
    value: Date;
    is24Hour?: boolean;
    minimumDate?: Date;
    maximumDate?: Date;
}

interface TimePickerComponent {
    showPicker: (options: TimePickerOptions, onChange: (date: Date | undefined) => void) => void;
    picker?: React.ReactNode; // This is mainly for the iOS implementation
}

let createTimePicker: () => TimePickerComponent;

if (Platform.OS === 'web') {
    createTimePicker = require('./DesktopTimePicker').default;
} else if (Platform.OS === 'android') {
    createTimePicker = require('./AndroidTimePicker').default;
} else if (Platform.OS === 'ios') {
    createTimePicker = require('./IOSTimePicker').default;
} else {
    console.error('Unsupported platform for TimePicker');
    createTimePicker = () => ({
        showPicker: () => {
            console.error('TimePicker is not supported on this platform');
        },
        picker: null
    });
}

export default createTimePicker;