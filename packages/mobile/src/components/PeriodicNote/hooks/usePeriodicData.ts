import { useState, useEffect, useMemo } from 'react';
import { formatInTimeZone, toDate, format } from 'date-fns-tz';

import { databaseManagers } from '../../../database/tables';
import { NoteData } from '@los/shared/src/types/DailyNote';
import { MoodNoteData } from '@los/shared/src/types/Mood';
import { MoneyData } from '@los/shared/src/types/Money';
import { TimeData } from '@los/shared/src/types/Time';
import { UserSettingData } from '@los/shared/src/types/UserSettings';
import { JournalData } from '@los/shared/src/types/Journal';
import { DailyTextData } from '@los/shared/src/types/TextNotes';

export interface UsePeriodicDataReturnType {
    dailyNoteData: ExtendedNoteData[];
    moneyData: MoneyData[];
    timeData: TimeData[];
    moodData: MoodNoteData[];
    userSettingsBooleans: UserSettingData[];
    userSettingsQuantifiables: UserSettingData[];
    journalData: JournalData[];
    dailyTextData: DailyTextData[];
}

export interface ExtendedNoteData extends NoteData {
  quantifiableHabits: { [key: string]: number };
  booleanHabits: { [key: string]: boolean };
}

export const usePeriodicData = (startDate: Date, endDate: Date): UsePeriodicDataReturnType => {
  const [dailyNoteData, setDailyNoteData] = useState<ExtendedNoteData[]>([]);
  const [moneyData, setMoneyData] = useState<MoneyData[]>([]);
  const [timeData, setTimeData] = useState<TimeData[]>([]);
  const [moodData, setMoodData] = useState<MoodNoteData[]>([]);
  const [userSettingsBooleans, setUserSettingsBooleans] = useState<UserSettingData[]>([]);
  const [userSettingsQuantifiables, setUserSettingsQuantifiables] = useState<UserSettingData[]>([]);
  const [journalData, setJournalData] = useState<JournalData[]>([]);
  const [dailyTextData, setDailyTextData] = useState<DailyTextData[]>([]);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { startDateStr, endDateStr } = useMemo(() => {
    const localStartDate = toDate(startDate, { timeZone });
    const localEndDate = toDate(endDate, { timeZone });
    return {
      startDateStr: formatInTimeZone(localStartDate, timeZone, 'yyyy-MM-dd'),
      endDateStr: formatInTimeZone(localEndDate, timeZone, 'yyyy-MM-dd')
    };
  }, [startDate, endDate, timeZone]);

  useEffect(() => {
    const fetchPeriodicData = async () => {
      try {
        const userSettingsBooleans = await databaseManagers.userSettings.getByType('booleanHabits');
        const userSettingsQuantifiables = await databaseManagers.userSettings.getByType('quantifiableHabits');

        const dailyNotes = await databaseManagers.dailyNotes.getByDateRange(startDateStr, endDateStr);
        const moneyRecords = await databaseManagers.money.getByDateRange(startDateStr, endDateStr);
        const timeRecords = await databaseManagers.time.getByDateRange(startDateStr, endDateStr);
        const moodRecords = await databaseManagers.mood.getByDateRange(startDateStr, endDateStr);
        const journalRecords = await databaseManagers.journal.getByDateRange(startDateStr, endDateStr);

        // Sanitize daily note data
        const sanitizedDailyNotes = sanitizeDailyNoteData(dailyNotes, userSettingsBooleans, userSettingsQuantifiables);

        setDailyNoteData(sanitizedDailyNotes);
        setMoneyData(moneyRecords);
        setTimeData(timeRecords);
        setMoodData(moodRecords);
        setUserSettingsBooleans(userSettingsBooleans);
        setUserSettingsQuantifiables(userSettingsQuantifiables);
        setJournalData(journalRecords);

        if (dailyNotes && dailyNotes.length > 0) {
          const formattedDailyData = dailyNotes.map(note => ({
              date: format(new Date(note.date!), 'yyyy-MM-dd'),
              success: note.success!,
              beBetter: note.beBetter!,
              morningComment: note.morningComment!
          }));
          setDailyTextData(formattedDailyData);
        }
      } catch (error) {
        console.error('Error in fetchPeriodicData:', error);
      }
    };

    fetchPeriodicData();
  }, [startDateStr, endDateStr]); 

  // console.log('about to return userSettingsQuantifiables', userSettingsQuantifiables);

  return { 
    dailyNoteData, 
    moneyData, 
    timeData, 
    moodData,
    userSettingsBooleans,
    userSettingsQuantifiables,
    journalData,
    dailyTextData
  };
};

function sanitizeDailyNoteData(
  dailyNotes: ExtendedNoteData[],
  booleanHabits: UserSettingData[],
  quantifiableHabits: UserSettingData[]
): ExtendedNoteData[] {
  const validBooleanHabits = new Set(booleanHabits.map(habit => habit.settingKey));
  const validQuantifiableHabits = new Set(quantifiableHabits.map(habit => habit.settingKey));

  return dailyNotes.map(note => {
    const sanitizedNote: ExtendedNoteData = {
      ...note,
      booleanHabits: {},
      quantifiableHabits: {}
    };

    for (const [key, value] of Object.entries(note.booleanHabits)) {
      if (validBooleanHabits.has(key)) {
        sanitizedNote.booleanHabits[key] = value;
      }
    }

    for (const [key, value] of Object.entries(note.quantifiableHabits)) {
      if (validQuantifiableHabits.has(key)) {
        sanitizedNote.quantifiableHabits[key] = value;
      }
    }

    return sanitizedNote;
  });
}