import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatInTimeZone, toDate } from 'date-fns-tz';

import { BASE_URL } from '@los/shared/src/utilities/constants';
import { DailyNoteData, NoteData } from '@los/shared/src/types/DailyNote';
import { UseDailyDataType, UseDailyDataReturnType } from '@los/shared/src/components/DailyNote/types/DailyData';

import { UserSettingData } from '@los/shared/src/types/UserSettings';
import { TaskData } from '@los/shared/src/types/Task';

export const useDailyData: UseDailyDataType = (currentDate, lastSubmissionTime): UseDailyDataReturnType => {
  const [dailyData, setDailyData] = useState<DailyNoteData | null>(null);
  const [habitSettings, setHabitSettings] = useState<{booleanHabits: UserSettingData[], quantifiableHabits: UserSettingData[]}>({
    booleanHabits: [],
    quantifiableHabits: []
  });
  const [ tasks, setTasks ] = useState<TaskData[]>([]);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localDate = toDate(currentDate, { timeZone });
  const dateStr = formatInTimeZone(localDate, timeZone, 'yyyy-MM-dd');

  useEffect(() => {
    const fetchHabitSettings = async () => {
      try {
        const [booleanHabits, quantifiableHabits] = await Promise.all([
          axios.get<UserSettingData[]>(`${BASE_URL}/userSettings/getByType/booleanHabits`),
          axios.get<UserSettingData[]>(`${BASE_URL}/userSettings/getByType/quantifiableHabits`)
        ]);
        setHabitSettings({
          booleanHabits: booleanHabits.data,
          quantifiableHabits: quantifiableHabits.data
        });
      } catch (error) {
        console.error('Error fetching habit settings:', error);
      }
    };

    fetchHabitSettings();
  }, []);

  useEffect(() => {
    const fetchDailyNote = async () => {
      try {
        const response = await axios.get<DailyNoteData>(`${BASE_URL}/dailyNotes/read`, { params: { date: dateStr } });
        let dailyNote = response.data;

        // Ensure all habits from settings are present in the daily note
        const booleanHabits = habitSettings.booleanHabits.map(setting => {
          const existingHabit = dailyNote.booleanHabits?.find(h => h.habitKey === setting.settingKey);
          return existingHabit || { date: dateStr, habitKey: setting.settingKey, value: 0 };
        });

        const quantifiableHabits = habitSettings.quantifiableHabits.map(setting => {
          const existingHabit = dailyNote.quantifiableHabits?.find(h => h.habitKey === setting.settingKey);
          return existingHabit || { date: dateStr, habitKey: setting.settingKey, value: 0 };
        });

        dailyNote = {
          ...dailyNote,
          booleanHabits,
          quantifiableHabits
        };

        // Update the daily note with any missing habits
        await axios.post<DailyNoteData>(`${BASE_URL}/dailyNotes/upsert`, dailyNote);

        setDailyData(dailyNote);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // If no data found, create a new daily note with default habits
          const newDailyNote: DailyNoteData = {
            id: 0, // This will be assigned by the database
            date: dateStr,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            booleanHabits: habitSettings.booleanHabits.map(setting => ({ date: dateStr, habitKey: setting.settingKey, value: 0 })),
            quantifiableHabits: habitSettings.quantifiableHabits.map(setting => ({ date: dateStr, habitKey: setting.settingKey, value: 0 })),
            // Add any other required fields with default values
            morningComment: '',
            energy: 0,
            wakeHour: '',
            success: '',
            beBetter: '',
            dayRating: 0,
            sleepTime: '',
          };
          const response = await axios.post<DailyNoteData>(`${BASE_URL}/dailyNotes/upsert`, newDailyNote);
          setDailyData(response.data);
        } else {
          console.error('Error fetching daily note:', error);
        }
      }
    };

    if (habitSettings.booleanHabits.length > 0 || habitSettings.quantifiableHabits.length > 0) {
      fetchDailyNote();
    }
  }, [currentDate, lastSubmissionTime, habitSettings]);


  const onUpdateDaySections = async (updatedFields: Partial<NoteData>) => {
    if (!dailyData) return;

    try {
      const newNoteData: NoteData = {
        ...dailyData,
        ...updatedFields,
        date: dateStr,
        updatedAt: new Date().toISOString(),
      };

      const response = await axios.post(`${BASE_URL}/dailyNotes/upsert`, newNoteData);
      setDailyData(prevData => ({ ...prevData, ...response.data } as DailyNoteData));
    } catch (error) {
      console.error("Error updating note data:", error);
    }
  };

  useEffect(() => {
    const fetchDailyTasks = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/tasks/getTasksDueToday`);
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching daily tasks:", error);
      }
    };

    fetchDailyTasks();
  }, [currentDate]);
  
  const toggleTaskCompletion = async (uuid: string, completed: boolean) => {
    try {
      const response = await axios.post<TaskData>(`${BASE_URL}/tasks/toggleTask`, { itemId: uuid });
      
      if (response.data) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.uuid === uuid ? { ...task, completed: response.data.completed } : task
          )
        );
      } else {
        throw new Error('No data returned from server');
      }
  
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  };

  return { dailyData, setDailyData, onUpdateDaySections, tasks, toggleTaskCompletion};
};
