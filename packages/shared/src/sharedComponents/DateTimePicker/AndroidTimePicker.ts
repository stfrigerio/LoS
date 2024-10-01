import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

interface TimePickerOptions {
  mode: 'date' | 'time' | 'datetime';
  value: Date;
  is24Hour?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

const AndroidTimePicker = () => {
  const showPicker = (options: TimePickerOptions, onChange: (date: Date | undefined) => void) => {
    const { mode, value, is24Hour = true, minimumDate, maximumDate } = options;

    const showDatePicker = () => {
      DateTimePickerAndroid.open({
        mode: 'date',
        value,
        onChange: (_, selectedDate) => {
          if (selectedDate) {
            if (mode === 'datetime') {
              showTimePicker(selectedDate);
            } else {
              onChange(selectedDate);
            }
          } else {
            onChange(undefined);
          }
        },
        minimumDate,
        maximumDate,
      });
    };

    const showTimePicker = (dateValue: Date = value) => {
      DateTimePickerAndroid.open({
        mode: 'time',
        value: dateValue,
        is24Hour,
        onChange: (_, selectedTime) => {
          if (selectedTime) {
            const combinedDate = new Date(dateValue);
            combinedDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
            onChange(combinedDate);
          } else {
            onChange(undefined);
          }
        },
      });
    };

    if (mode === 'date' || mode === 'datetime') {
      showDatePicker();
    } else {
      showTimePicker();
    }
  };

  return { showPicker };
};

export default AndroidTimePicker;