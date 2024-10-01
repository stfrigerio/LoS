import { useState, useEffect } from 'react';
import axios from 'axios';

import { UseBooleanHabitsType, UseBooleanHabitsReturnType } from '@los/shared/src/components/DailyNote/types/BooleanHabits';
import { BooleanHabitSetting } from '@los/shared/src/types/BooleanHabits';
import { BASE_URL } from '@los/shared/src/utilities/constants';

export const useBooleanHabits: UseBooleanHabitsType = (data, date): UseBooleanHabitsReturnType => {
  const [habits, setHabits] = useState<BooleanHabitSetting[]>([]);
  const [emojis, setEmojis] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (data) {
      const activeHabits = data.map(habit => ({
        uuid: habit.uuid,
        key: habit.habitKey,
        value: Boolean(habit.value)
      }));
      setHabits(activeHabits);
    }
  }, [data]);

  useEffect(() => {
    const fetchEmojis = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/userSettings/getByType/booleanHabits`);
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

  const handleToggle = async (uuid: string, habitKey: string) => {
    const currentHabit = habits.find(habit => habit.key === habitKey);

    if (currentHabit) {
      const newValue = !currentHabit.value;
        // Make the API call to update the daily note
        const response = await axios.post(`${BASE_URL}/dailyNotes/upsert`, {
          updatedAt: new Date().toISOString(),
          date: date,
          uuid: uuid,
          booleanHabits: [{ habitKey, value: Number(newValue) }]
        });
    
        if (response.status !== 200) {
          throw new Error('Failed to update boolean habit');
        }
      setHabits(currentHabits => currentHabits.map(habit => 
        habit.key === habitKey ? { ...habit, value: newValue } : habit
      ));
    }
  };

  return { habits, emojis, handleToggle };
};