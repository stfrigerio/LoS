import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { databaseManagers } from '@los/mobile/src/database/tables';

export const useBirthdays = () => {
  const [birthdays, setBirthdays] = useState<any>([]);

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const fetchBirthdays = async () => {
    try {
      const fetchedBirthdays = await databaseManagers.userSettings.getByType('birthday');
      const formattedBirthdays = fetchedBirthdays.map(b => ({
        id: b.id,
        name: b.settingKey,
        date: b.value
      }));
      setBirthdays(formattedBirthdays);
      return formattedBirthdays;
    } catch (error) {
      console.error('Error fetching birthdays:', error);
      return [];
    }
  };

  const addBirthday = async (newBirthdayName: string, newBirthdayDate: string) => {
    if (!newBirthdayName.trim() || !newBirthdayDate.trim()) {
      Alert.alert('Error', 'Please enter both name and date of birth.');
      return;
    }

    const newSetting = {
      settingKey: newBirthdayName,
      value: newBirthdayDate,
      type: 'birthday'
    };
    
    try {
      await databaseManagers.userSettings.upsert(newSetting);
      return await fetchBirthdays();
    } catch (error) {
      console.error('Error adding birthday:', error);
      return [];
    }
  };

  const deleteBirthday = async (id: number) => {
    try {
      await databaseManagers.userSettings.remove(id);
      return await fetchBirthdays();
    } catch (error) {
      console.error('Error deleting birthday:', error);
      return [];
    }
  };

  return {
    birthdays,
    fetchBirthdays,
    addBirthday,
    deleteBirthday,
  };
};