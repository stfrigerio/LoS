import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '@los/shared/src/utilities/constants';

export const useBirthdays = () => {
  const [birthdays, setBirthdays] = useState<any>([]);

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const fetchBirthdays = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/userSettings/getByType/birthday`);
      const formattedBirthdays = response.data.map((b: any) => ({
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
      alert('Please enter both name and date of birth.');
      return;
    }

    const newSetting = {
      settingKey: newBirthdayName,
      value: newBirthdayDate,
      type: 'birthday'
    };
    
    try {
      await axios.post(`${BASE_URL}/userSettings/create`, newSetting);
      return await fetchBirthdays();
    } catch (error) {
      console.error('Error adding birthday:', error);
      return [];
    }
  };

  const deleteBirthday = async (id: number) => {
    try {
      await axios.delete(`${BASE_URL}/userSettings/remove`, { data: { id } });
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