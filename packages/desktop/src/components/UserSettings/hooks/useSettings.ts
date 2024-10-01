import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Settings, UserSettingData } from '@los/shared/src/types/UserSettings';
import { BASE_URL } from '@los/shared/src/utilities/constants';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({});

  const transformFetchedSettings = (fetchedSettings: UserSettingData[]): Settings => {
    return fetchedSettings.reduce((acc, setting) => {
      if (setting.id !== undefined) {
        acc[setting.settingKey] = {
          id: setting.id,
          uuid: setting.uuid!,
          settingKey: setting.settingKey,
          value: setting.value,
          type: setting.type as "booleanHabits" | "quantifiableHabits",
        };
      }
      return acc;
    }, {} as Settings);
  };
  
  const fetchSettings = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/userSettings/list`);
      const fetchedSettings = response.data;
      const transformedSettings = transformFetchedSettings(fetchedSettings);
      setSettings(transformedSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, []);

  const addNewHabit = async (newHabit: UserSettingData) => {
    const defaultEmoji = '';
    
    try {
      await axios.post(`${BASE_URL}/userSettings/upsert`, {
        settingKey: newHabit.settingKey,
        value: defaultEmoji,
        color: newHabit.color,
        type: newHabit.type,
      });
      fetchSettings();
    } catch (error) {
      console.error(`Failed to add new habit '${newHabit.settingKey}':`, error);
    }
  };  

  const updateSetting = async (settingUuid: string, newValue: string, settingKey: string, type: 'booleanHabits' | 'quantifiableHabits') => {
    try {
      await axios.put(`${BASE_URL}/userSettings/upsert`, {
        uuid: settingUuid,
        type: type,
        settingKey: settingKey,
        value: newValue,
      });
      fetchSettings();
    } catch (error) {
      console.error(`Failed to update setting with id ${settingUuid}:`, error);
    }
  };

  const deleteRecord = async (settingUuid: string) => {
    try {
      await axios.delete(`${BASE_URL}/userSettings/remove/${settingUuid}`);
      fetchSettings();
    } catch (error) {
      console.error(`Failed to delete setting with uuid ${settingUuid}:`, error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { 
    settings, 
    fetchSettings, 
    addNewHabit, 
    deleteRecord, 
    updateSetting,
  };
};