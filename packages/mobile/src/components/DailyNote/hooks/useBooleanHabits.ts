import { useState, useEffect } from 'react';
import { databaseManagers } from '../../../database/tables';
import { UseBooleanHabitsType, UseBooleanHabitsReturnType } from '@los/shared/src/components/DailyNote/types/BooleanHabits';
import { BooleanHabitSetting, BooleanHabitsData } from '@los/shared/src/types/BooleanHabits';

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
        const emojiSettings = await databaseManagers.userSettings.getByType('booleanHabits');
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

  const handleToggle = async (uuid: string, habitKey: string) => {
    const currentHabit = habits.find(habit => habit.key === habitKey);

    if (currentHabit) {
      const newValue = !currentHabit.value;
      
      // Use the dateStr derived from the input date
      await databaseManagers.booleanHabits.upsert({
        uuid: uuid,
        date: date,
        habitKey,
        value: Number(newValue)
      } as BooleanHabitsData);

      // Fetch the daily note and get its UUID
      const dailyNotes = await databaseManagers.dailyNotes.getByDate(date);
      if (dailyNotes.length > 0) {
        const dailyNoteUuid = dailyNotes[0].uuid;
        await databaseManagers.dailyNotes.upsert({
          uuid: dailyNoteUuid,
          updatedAt: new Date().toISOString()
        });
      }

      setHabits(currentHabits => currentHabits.map(habit => 
        habit.key === habitKey ? { ...habit, value: newValue } : habit
      ));
    }
  };

  return { habits, emojis, handleToggle };
};