import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Pressable, StyleSheet, View, Text } from 'react-native';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { UniversalModal } from '@los/shared/src/sharedComponents/UniversalModal';

interface TimePickerOptions {
  mode: 'date' | 'time' | 'datetime';
  value: Date;
  is24Hour?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

const DesktopTimePicker = () => {
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [currentOptions, setCurrentOptions] = useState<TimePickerOptions | null>(null);
  const [currentOnChange, setCurrentOnChange] = useState<((date: Date | undefined) => void) | null>(null);

  const { themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);

  const showPicker = (options: TimePickerOptions, onChange: (date: Date | undefined) => void) => {
    setCurrentOptions(options);
    setCurrentOnChange(() => onChange);
    const { mode, value } = options;

    setTempDate(value);
    if (mode === 'date' || mode === 'datetime') {
      setIsDateModalOpen(true);
    } else {
      setIsTimeModalOpen(true);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setTempDate(date);
      if (currentOptions?.mode === 'datetime') {
        setIsDateModalOpen(false);
        setIsTimeModalOpen(true);
      } else {
        currentOnChange?.(date);
        setIsDateModalOpen(false);
      }
    } else {
      currentOnChange?.(undefined);
      setIsDateModalOpen(false);
    }
  };

  const handleTimeChange = (date: Date | null) => {
    if (date && tempDate) {
      const newDate = new Date(tempDate);
      newDate.setHours(date.getHours(), date.getMinutes());
      currentOnChange?.(newDate);
    } else {
      currentOnChange?.(undefined);
    }
    setIsTimeModalOpen(false);
  };

  const DatePickerContent = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Select Date</Text>
      <DatePicker
        selected={tempDate}
        onChange={handleDateChange}
        inline
        minDate={currentOptions?.minimumDate}
        maxDate={currentOptions?.maximumDate}
      />
      <Pressable style={designs.button.marzoSecondary} onPress={() => setIsDateModalOpen(false)}>
        <Text style={designs.button.buttonText}>Cancel</Text>
      </Pressable>
    </View>
  );

  const TimePickerContent = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Select Time</Text>
      <DatePicker
        selected={tempDate}
        onChange={handleTimeChange}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="HH:mm"
        inline
      />
      <Pressable style={designs.button.marzoSecondary} onPress={() => setIsTimeModalOpen(false)}>
        <Text style={designs.button.buttonText}>Cancel</Text>
      </Pressable>
    </View>
  );

  const picker = (
    <>
      <UniversalModal
        isVisible={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        modalViewStyle="dateTimePicker"
      >
        <DatePickerContent />
      </UniversalModal>

      <UniversalModal
        isVisible={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        modalViewStyle="dateTimePicker"
      >
        <TimePickerContent />
      </UniversalModal>
    </>
  );

  return { showPicker, picker };
};

const getStyles = (themeColors: any) => StyleSheet.create({
  modalContent: {
    backgroundColor: themeColors.backgroundColor,
    borderWidth: 1,
    borderColor: themeColors.borderColor,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: themeColors.textColor,
  },
});

export default DesktopTimePicker;