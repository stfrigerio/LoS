import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, Pressable } from 'react-native';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import DeleteButton from '@los/shared/src/sharedComponents/DeleteButton';

import AddHabitModal from '../modals/AddHabitModal';

import { UserSettingData } from '@los/shared/src/types/UserSettings';

let useColors
if (Platform.OS === 'web') {
  useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
  useColors = require('@los/mobile/src/components/useColors').useColors;
}

interface HabitRowProps {
  habitName: string;
  setting: UserSettingData;
  updateSetting: (newHabit: UserSettingData) => Promise<void>;
  deleteRecord: (settingUuid: string) => Promise<void>;
}

const HabitRow: React.FC<HabitRowProps> = ({ habitName, setting, updateSetting, deleteRecord }) => {
  const { themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors, designs);
  const { colors: tagColors } = useColors();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const handlePress = () => {
    setIsModalVisible(true);
  }

  const handleCloseModal = () => {
    setIsModalVisible(false);
  }

  return (
    <>
      <Pressable onPress={handlePress} style={styles.settingRow}>
        <View style={styles.colorDotContainer}>
          <View style={[styles.colorDot, { backgroundColor: tagColors[setting.settingKey] || '#FFFFFF' }]} />
        </View>
        <Text style={styles.habitName}>{habitName}</Text>
        <Text style={styles.emoji}>{setting.value}</Text>
        <View style={styles.deleteButtonContainer}>
          <DeleteButton onDelete={() => deleteRecord(setting.uuid!)} />
        </View>
      </Pressable>
      {isModalVisible && (
        <AddHabitModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          initialHabit={setting}
          onUpdate={updateSetting}
        />    
      )}
    </>
  );
};

const getStyles = (theme: any, designs: any) => StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    // borderWidth: 1,
    // borderColor: 'red',
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
    width: '100%',
  },
  habitName: {
    width: '40%',
    paddingRight: 10,
    color: theme.textColor,
    // borderWidth: 1,
    // borderColor: 'blue',
  },
  emoji: {
    width: '20%',
    // height: 40,
    textAlign: 'center',
    fontSize: 18,
    // borderWidth: 1,
    // borderColor: 'green',
  },
  colorDotContainer: {
    width: '10%',
    alignItems: 'center',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  deleteButtonContainer: {
    width: '10%',
    // borderWidth: 1,
    // borderColor: 'purple',
    alignItems: 'flex-end',
  },
});

export default HabitRow;