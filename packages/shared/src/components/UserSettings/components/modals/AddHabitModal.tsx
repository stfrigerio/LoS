import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Platform, Modal } from 'react-native';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { UniversalModal } from '@los/shared/src/sharedComponents/UniversalModal';
import AlertModal from '@los/shared/src/components/modals/AlertModal'; 


import { UseSettingsType } from '../types/DailyNote';
import { UserSettingData } from '../../../../types/UserSettings';

let ColorPicker: any;

let useSettings: UseSettingsType;
if (Platform.OS === 'web') {
  useSettings = require('@los/desktop/src/components/UserSettings/hooks/useSettings').useSettings;
  ColorPicker = null;
} else {
  useSettings = require('@los/mobile/src/components/UserSettings/hooks/useSettings').useSettings;
  ColorPicker = require('./components/ColorPicker').default;

}

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  initialHabit?: UserSettingData;
  onUpdate: (newHabit: UserSettingData) => void;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ visible, onClose, initialHabit, onUpdate }) => {
  const { themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitType, setNewHabitType] = useState<'booleanHabits' | 'quantifiableHabits'>('booleanHabits');
  const [habitColor, setHabitColor] = useState('#FFFFFF');
  const [habitEmoji, setHabitEmoji] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState('#FFFFFF');
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // New state for AlertModal

  const { addNewHabit } = useSettings();

  useEffect(() => {
    if (initialHabit) {
      setNewHabitName(initialHabit.settingKey);
      setNewHabitType(initialHabit.type as 'booleanHabits' | 'quantifiableHabits');
      setHabitColor(initialHabit.color || '#FFFFFF');
      setHabitEmoji(initialHabit.value);
      setIsEditing(true);
    } else {
      resetForm();
    }
  }, [initialHabit]);

  const resetForm = () => {
    setNewHabitName('');
    setNewHabitType('booleanHabits');
    setHabitColor('#FFFFFF');
    setHabitEmoji('');
    setIsEditing(false);
  };

  const handleAddNewHabit = () => {
    if (!newHabitName.trim()) {
      setShowAlert(true);
      return;
    }

    if (initialHabit) {
      const updatedHabit = {
        ...initialHabit,
        settingKey: newHabitName,
        type: newHabitType,
        color: habitColor,
        value: habitEmoji || '📌', // Use a default emoji if none is provided
      };
      onUpdate(updatedHabit);
      resetForm();
      onClose();
    } else {
      const newHabit = {
        settingKey: newHabitName,
        type: newHabitType,
        color: habitColor,
        value: habitEmoji || '📌', // Use a default emoji if none is provided
      };

      addNewHabit(newHabit).then(() => {
        resetForm();
        onClose();
      }).catch((error) => {
        console.error(`Error adding new habit: ${error}`);
      });
    }
  };

  const handleColorSelect = (color: string) => {
    setTempColor(color);
  };

  const confirmColor = () => {
    setHabitColor(tempColor);
    setShowColorPicker(false);
  };

  const renderColorPicker = () => {
    if (!ColorPicker) return null;
  
    return (
      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={designs.modal.modalContainer}>
          <View style={designs.modal.modalView}>
            <View style={[styles.colorPickerContent, { padding: 30 }]}>
              <ColorPicker
                onColorSelected={handleColorSelect}
                style={{ width: '100%', height: 600 }}
                initialColor={habitColor}
              />
              <View style={styles.colorPickerButtons}>
                <Pressable style={[designs.button.marzoPrimary, { width: '40%' }]} onPress={() => setShowColorPicker(false)}>
                  <Text style={designs.button.buttonText}>Cancel</Text>
                </Pressable>
                <Pressable style={[designs.button.marzoSecondary, { width: '40%' }]} onPress={confirmColor}>
                  <Text style={designs.button.buttonText}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  const selectHabitType = (type: 'booleanHabits' | 'quantifiableHabits') => {
    setNewHabitType(type);
  };

  const modalContent = (
    <View style={styles.modalContent}>
      <Text style={designs.text.title}>{isEditing ? 'Edit Habit' : 'Add New Habit'}</Text>
      <TextInput
        style={styles.inputHabitText}
        onChangeText={setNewHabitName}
        value={newHabitName}
        placeholder="New habit name"
        placeholderTextColor='#969DA3'
      />
      <TextInput
        style={styles.inputHabitText}
        onChangeText={setHabitEmoji}
        value={habitEmoji}
        placeholder="Habit emoji (optional)"
        placeholderTextColor='#969DA3'
      />
      <View style={{ height: 20 }}/>
      <View style={styles.habitTypeContainer}>
        <Pressable
          style={[
            styles.habitTypeButton,
            newHabitType === 'booleanHabits' && styles.selectedHabitType
          ]}
          onPress={() => selectHabitType('booleanHabits')}
        >
          <Text style={[
            styles.habitTypeText,
            newHabitType === 'booleanHabits' && styles.selectedHabitTypeText
          ]}>Switch (ON/OFF)</Text>
        </Pressable>
        <Pressable
          style={[
            styles.habitTypeButton,
            newHabitType === 'quantifiableHabits' && styles.selectedHabitType
          ]}
          onPress={() => selectHabitType('quantifiableHabits')}
        >
          <Text style={[
            styles.habitTypeText,
            newHabitType === 'quantifiableHabits' && styles.selectedHabitTypeText
          ]}>Countable (1, 2, 3, ...)</Text>
        </Pressable>
      </View>
      {ColorPicker && (
        <View style={styles.colorSelectionContainer}>
          <Pressable
            style={styles.colorPickerButton}
            onPress={() => setShowColorPicker(true)}
          >
            <View style={[styles.colorDot, { backgroundColor: habitColor }]} />
            <Text style={styles.colorPickerButtonText}>Select Color</Text>
          </Pressable>
        </View>
      )}
      <Pressable
        style={[designs.button.marzoSecondary, {width: '90%'}]}
        onPress={handleAddNewHabit}
      >
        <Text style={designs.button.buttonText}>{isEditing ? 'Update habit' : 'Add habit'}</Text>
      </Pressable>
    </View>
  );

  return (
    <>
      <UniversalModal isVisible={visible} onClose={onClose} modalViewStyle='taller'>
        {modalContent}
      </UniversalModal>
      {renderColorPicker()}
      <AlertModal
        isVisible={showAlert}
        title="Error"
        message="Please enter a habit name."
        onConfirm={() => setShowAlert(false)}
        onCancel={() => setShowAlert(false)}
      />
    </>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  modalContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  inputHabitText: {
    fontSize: 14,
    marginTop: 20, 
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: theme.borderColor,
    paddingHorizontal: 18,
    width: '100%',
    color: theme.textColor,
    height: 60
  },
  habitTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  habitTypeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedHabitType: {
    borderColor: theme.hoverColor,
  },
  habitTypeText: {
    color: theme.textColor,
    fontSize: 10,
  },
  selectedHabitTypeText: {
    color: theme.hoverColor,
    fontWeight: 'bold',
  },
  colorSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  colorPickerButton: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerButtonText: {
    marginLeft: 15,
    color: 'gray',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  colorPickerContent: {
    backgroundColor: theme.backgroundColor,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    height: 500,
  },
  colorPickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginLeft: -50,
    width: 250,
    // borderWidth: 1,
    // borderColor: 'red',
  },
});

export default AddHabitModal;