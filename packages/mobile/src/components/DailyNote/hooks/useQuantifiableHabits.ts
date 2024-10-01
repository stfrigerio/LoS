import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

import { databaseManagers } from '../../../database/tables';
import { UseQuantifiableHabitsType, UseQuantifiableHabitsReturnType } from '@los/shared/src/components/DailyNote/types/QuantifiableHabits';
import { habitThresholds } from '@los/shared/src/components/DailyNote/components/QuantifiableHabits/helpers/colors';
import capitalize from '@los/shared/src/utilities/textManipulation';
import { QuantifiableHabitsData } from '@los/shared/src/types/QuantifiableHabits';

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
        const emojiSettings = await databaseManagers.userSettings.getByType('quantifiableHabits');
        const emojiMap: { [key: string]: string } = {};
        
        emojiSettings.forEach(setting => {
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

  const scheduleMindfulReminder = async (habit: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Mindful Reminder",
        body: `Looks like you're having a lot of ${habit} today. Remember to take it easy!`,
        data: { habit },
      },
      trigger: { seconds: 1 },
    });
  };

  const handleIncrement = async (uuid: string, habitKey: string) => {
    const key = habitKey as keyof typeof habitThresholds;
    const currentValue = habits[key]?.value ?? 0;
    const newValue = currentValue + 1;

    setHabits(prev => ({ ...prev, [key]: { ...prev[key], value: newValue } }));

    if (habitThresholds[key] && newValue >= habitThresholds[key].red) {
      const habitForReminder = emojis[key] || capitalize(key);
      scheduleMindfulReminder(habitForReminder);
    }

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
    habitKey = capitalize(habitKey);
    await databaseManagers.quantifiableHabits.upsert({
      uuid: uuid,
      date: date, 
      habitKey,
      value: newValue
    } as QuantifiableHabitsData)

    // Fetch the daily note and get its UUID
    const dailyNotes = await databaseManagers.dailyNotes.getByDate(date);
    if (dailyNotes.length > 0) {
      const dailyNoteUuid = dailyNotes[0].uuid;
      await databaseManagers.dailyNotes.upsert({
        uuid: dailyNoteUuid,
        updatedAt: new Date().toISOString()
      });
    }
    
  };

  return { habits, emojis, handleIncrement, handleDecrement, scheduleMindfulReminder };
};