import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

import { databaseManagers } from '@los/mobile/src/database/tables';
import { Settings, UserSettingData } from '@los/shared/src/types/UserSettings';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({});

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const transformFetchedSettings = (fetchedSettings: UserSettingData[]): Settings => {
    return fetchedSettings.reduce((acc, setting) => {
      if (setting.id !== undefined) {
        acc[setting.settingKey] = {
          id: setting.id,
          uuid: setting.uuid!,
          settingKey: setting.settingKey,
          value: setting.value,
          color: setting.color,
          type: setting.type as "booleanHabits" | "quantifiableHabits",
        };
      }
      return acc;
    }, {} as Settings);
  };
  
  const fetchSettings = useCallback(async () => {
    try {
      const fetchedSettings = await databaseManagers.userSettings.list();
  
      const transformedSettings = transformFetchedSettings(fetchedSettings);
      setSettings(transformedSettings);

    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, []);

  const addNewHabit = async (newHabit: UserSettingData) => {
    if (!newHabit.settingKey.trim()) {
      Alert.alert('Error', 'Please enter a habit name.');
      return;
    }
      
    try {
      const newSetting = {
        settingKey: capitalizeFirstLetter(newHabit.settingKey),
        value: newHabit.value,
        color: newHabit.color,
        type: newHabit.type,
      } as UserSettingData;

      const addedSetting = await databaseManagers.userSettings.upsert(newSetting);
      setSettings(prevSettings => ({
        ...prevSettings,
        [addedSetting.settingKey]: {
          id: addedSetting.id,
          uuid: addedSetting.uuid!,
          settingKey: addedSetting.settingKey,
          value: addedSetting.value,
          color: addedSetting.color,
          type: addedSetting.type as "booleanHabits" | "quantifiableHabits",
        },
      }));
    } catch (error) {
      console.error(`Failed to add new habit '${newHabit.settingKey}':`, error);
    }
  };

  const updateSetting = async (newHabit: UserSettingData) => {
    try {
      const newSetting = {
        uuid: newHabit.uuid,
        settingKey: capitalizeFirstLetter(newHabit.settingKey),
        type: newHabit.type,
        value: newHabit.value
      } as UserSettingData;

      const updatedSetting = await databaseManagers.userSettings.upsert(newSetting);
      fetchSettings();
      
      setSettings(prevSettings => ({
        ...prevSettings,
        [updatedSetting.settingKey]: {
          id: updatedSetting.id,
          uuid: updatedSetting.uuid!,
          settingKey: updatedSetting.settingKey,
          value: updatedSetting.value,
          color: updatedSetting.color,
          type: updatedSetting.type as "booleanHabits" | "quantifiableHabits",
        },
      }));
    } catch (error) {
      console.error(`Failed to update setting with id ${newHabit.uuid}:`, error);
    }
  };

  const deleteRecord = async (settingId: number) => {
    try {
      await databaseManagers.userSettings.removeByUuid(settingId);
      fetchSettings();
    } catch (error) {
      console.error(`Failed to delete setting with id ${settingId}:`, error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, fetchSettings, addNewHabit, deleteRecord, updateSetting };
};
