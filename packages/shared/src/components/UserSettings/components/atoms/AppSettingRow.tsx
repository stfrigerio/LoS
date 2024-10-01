import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { Settings } from '@los/shared/src/types/UserSettings';
import { UserSettingData } from '@los/shared/src/types/UserSettings';

interface AppSettingRowProps {
  settingKey: string;
  label: string;
  type: 'appSettings';
  settings: Settings;
  updateSetting: (newHabit: UserSettingData) => Promise<void>;
  explainerText: string;
}

const AppSettingRow: React.FC<AppSettingRowProps> = ({ settingKey, label, type, settings, updateSetting, explainerText }) => {
  const { themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors, designs);

  const setting = settings[settingKey];
  const [isEnabled, setIsEnabled] = useState(setting?.value === 'true');
  const uuid = setting?.uuid || '';

  useEffect(() => {
    setIsEnabled(setting?.value === 'true');
  }, [setting?.value]);

  const handleToggle = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);

    const newHabit: UserSettingData = {
      uuid: uuid,
      settingKey: settingKey,
      value: newValue.toString(),
      type: 'appSettings',
    };

    updateSetting(newHabit);
  };

  return (
    <View style={styles.outsideContainer}>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Switch
          trackColor={{ false: themeColors.backgroundSecondary, true: themeColors.backgroundSecondary }}
          thumbColor={isEnabled ? themeColors.hoverColor : 'gray'}
          onValueChange={handleToggle}
          value={isEnabled}
        />
      </View>
      <Text style={styles.explainerText}>{explainerText}</Text>
    </View>
  );
};

const getStyles = (themeColors: any, designs: any) => StyleSheet.create({
  outsideContainer: {
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  label: {
    ...designs.text.body,
    color: themeColors.textColor,
  },
  explainerText: {
    color: 'gray',
  },
});

export default AppSettingRow;