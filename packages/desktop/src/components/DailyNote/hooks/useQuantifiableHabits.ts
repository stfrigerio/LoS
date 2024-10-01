import { useState, useEffect } from 'react';
import axios from 'axios';
import { UseQuantifiableHabitsType, UseQuantifiableHabitsReturnType } from '@los/shared/src/components/DailyNote/types/QuantifiableHabits';
import { habitThresholds } from '@los/shared/src/components/DailyNote/components/QuantifiableHabits/helpers/colors';

import { BASE_URL } from '@los/shared/src/utilities/constants';

export const useQuantifiableHabits: UseQuantifiableHabitsType = (data, date): UseQuantifiableHabitsReturnType => {
  const [habits, setHabits] = useState<{ [key: string]: { value: number; uuid: string } }>({});
  const [emojis, setEmojis] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const initialHabits = Object.fromEntries(
      data.map(item => [item.habitKey, { value: item.value, uuid: item.uuid || '' }])
    );
    setHabits(initialHabits);
  }, [data]);

  useEffect(() => {
    const fetchEmojis = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/userSettings/getByType/quantifiableHabits`);
        const emojiMap: { [key: string]: string } = {};
        
        response.data.forEach((setting: any) => {
          if (setting.settingKey && setting.value) {
            emojiMap[setting.settingKey] = setting.value;
          }
        });
        
        setEmojis(emojiMap);
      } catch (error) {
        console.error('Failed to fetch habit emojis:', error);
      }
    };

    fetchEmojis();
  }, []);

  const handleIncrement = async (uuid: string, habitKey: string) => {
    const key = habitKey as keyof typeof habitThresholds;
    const currentValue = habits[key]?.value ?? 0;
    const newValue = currentValue + 1;

    setHabits(prev => ({ ...prev, [key]: { ...prev[key], value: newValue } }));

    await updateDatabaseAndPropagate(uuid, key, newValue);
  };

  const handleDecrement = async (uuid: string, habitKey: string) => {
    const key = habitKey as keyof typeof habitThresholds;
    const currentValue = habits[key]?.value ?? 0;
    const newValue = Math.max(0, currentValue - 1);

    setHabits(prev => ({ ...prev, [key]: { ...prev[key], value: newValue } }));

    await updateDatabaseAndPropagate(uuid, key, newValue);
  };

  const updateDatabaseAndPropagate = async (uuid: string, habitKey: string, newValue: number) => {
    try {
      const response = await axios.post(`${BASE_URL}/dailyNotes/upsert`, {
        updatedAt: new Date().toISOString(),
        date: date,
        uuid: uuid,
        quantifiableHabits: [{ habitKey, value: newValue }]
      });
    
      if (response.status !== 200) {
        throw new Error('Failed to update quantifiable habit');
      }
  
    } catch (error: any) {
      console.error('Failed to update quantifiable habit value:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  return { habits, emojis, handleIncrement, handleDecrement };
};