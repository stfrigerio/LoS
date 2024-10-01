import { useState, useEffect } from 'react';
import { formatInTimeZone, toDate } from 'date-fns-tz';

import { databaseManagers } from '../../../database/tables';

import { DailyNoteData, NoteData } from '@los/shared/src/types/DailyNote';
import { UseDailyDataReturnType } from '@los/shared/src/components/DailyNote/types/DailyData';
import { BooleanHabitsData } from '@los/shared/src/types/BooleanHabits';
import { QuantifiableHabitsData } from '@los/shared/src/types/QuantifiableHabits';

export const useDailyData = (currentDate: Date, lastSubmissionTime: number): UseDailyDataReturnType => {
  const [dailyData, setDailyData] = useState<DailyNoteData | null>(null);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localDate = toDate(currentDate, { timeZone });
  const dateStr = formatInTimeZone(localDate, timeZone, 'yyyy-MM-dd');

  useEffect(() => {
    fetchDailyNoteAndHabits();
  }, [currentDate, lastSubmissionTime]);

  const fetchDailyNoteAndHabits = async () => {
    try {
      // Fetch user settings for boolean and quantifiable habits
      const userSettingsBooleans = await databaseManagers.userSettings.getByType('booleanHabits');
      const userSettingsQuantifiables = await databaseManagers.userSettings.getByType('quantifiableHabits');
      
      // Fetch or create daily note for the current date
      let dailyNotes = await databaseManagers.dailyNotes.getByDate(dateStr);
      let dailyNote: NoteData | null = dailyNotes[0] || null;
      
      if (!dailyNote) {
        // Create a new daily note if it doesn't exist
        dailyNote = await databaseManagers.dailyNotes.upsert({
          date: dateStr,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          synced: 0
        });
      }

      // Create boolean habits if they don't exist for the current date
      const booleanPromises = userSettingsBooleans.map(async (setting) => {
        const existingHabit = await databaseManagers.booleanHabits.getHabitByDateAndKey(dateStr, setting.settingKey);
        if (!existingHabit) {
          await databaseManagers.booleanHabits.upsert({ 
            date: dateStr, 
            habitKey: setting.settingKey, 
            value: 0 
          } as BooleanHabitsData);
        }
      });

      // Create quantifiable habits if they don't exist for the current date
      const quantifiablePromises = userSettingsQuantifiables.map(async (setting) => {
        const existingHabit = await databaseManagers.quantifiableHabits.getHabitByDateAndKey(dateStr, setting.settingKey);
        if (!existingHabit) {
          await databaseManagers.quantifiableHabits.upsert({ 
            date: dateStr, 
            habitKey: setting.settingKey, 
            value: 0 
          } as QuantifiableHabitsData);
        }
      });

      // Wait for all habit creation operations to complete
      await Promise.all([...booleanPromises, ...quantifiablePromises]);

      // Fetch updated habits for the current date
      const booleanHabits = await databaseManagers.booleanHabits.getByDate(dateStr);
      const quantifiableHabits = await databaseManagers.quantifiableHabits.getByDate(dateStr);

      // Filter habits to only include those in current user settings
      const filteredBooleanHabits = booleanHabits.filter(habit => 
        userSettingsBooleans.some(setting => setting.settingKey === habit.habitKey)
      );
      const filteredQuantifiableHabits = quantifiableHabits.filter(habit => 
        userSettingsQuantifiables.some(setting => setting.settingKey === habit.habitKey)
      );

      setDailyData({
        ...dailyNote,
        booleanHabits: filteredBooleanHabits,
        quantifiableHabits: filteredQuantifiableHabits,
      } as DailyNoteData);

    } catch (error) {
      console.error('Error in fetchDailyNoteAndHabits:', error);
    }
  };

  const onUpdateDaySections = async (updatedFields: Partial<NoteData>) => {
    try {
      let currentNotes = await databaseManagers.dailyNotes.getByDate(dateStr);
      let currentNote: NoteData | null = currentNotes[0] || null;
  
      if (!currentNote) {
        currentNote = {
          date: dateStr,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          synced: 0,
        };
      }
  
      const newNoteData: NoteData = {
        ...currentNote,
        ...updatedFields,
        updatedAt: new Date().toISOString(),
      };
        
      await databaseManagers.dailyNotes.upsert(newNoteData);
      setDailyData(prevData => ({ ...prevData, ...newNoteData } as DailyNoteData));
  
    } catch (error) {
      console.error("Error updating note data:", error);
    }
  };

  // const fetchDailyTasks = async (date: Date) => {
  //   try {
  //     const todaysTasks = await databaseManagers.tasks.getTasksDueOnDate(date);
  //     setTasks(todaysTasks);
  //   } catch (error) {
  //     console.error("Error fetching daily tasks:", error);
  //   }
  // };

  // const toggleTaskCompletion = async (uuid: string, completed: boolean): Promise<void> => {
  //   try {
  //     const task = await databaseManagers.tasks.getByUuid(uuid);
  //     if (!task) {
  //       throw new Error('Task not found');
  //     }
  
  //     const updatedTask: TaskData = {
  //       ...task,
  //       completed: completed,
  //       updatedAt: new Date().toISOString(),
  //       synced: 0,
  //     };
  //       await databaseManagers.tasks.upsert(updatedTask);
  //   } catch (error) {
  //     console.error('Error toggling task completion:', error);
  //     throw error;
  //   }
  // };

  return { dailyData, setDailyData, onUpdateDaySections };
};