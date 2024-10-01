import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { formatInTimeZone, toDate, format } from 'date-fns-tz';

import { BASE_URL } from '@los/shared/src/utilities/constants';

import { UsePeriodicDataReturnType, ExtendedNoteData } from '@los/mobile/src/components/PeriodicNote/hooks/usePeriodicData';
import { UserSettingData } from '@los/shared/src/types/UserSettings';
import { MoneyData } from '@los/shared/src/types/Money';
import { TimeData } from '@los/shared/src/types/Time';
import { MoodNoteData } from '@los/shared/src/types/Mood';
import { JournalData } from '@los/shared/src/types/Journal';
import { DailyTextData } from '@los/shared/src/types/TextNotes';

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
        const [
          userSettingsBooleans,
          userSettingsQuantifiables,
          dailyNotes,
          moneyRecords,
          timeRecords,
          moodRecords,
          journalRecords
        ] = await Promise.all([
          axios.get<UserSettingData[]>(`${BASE_URL}/userSettings/getByType/booleanHabits`),
          axios.get<UserSettingData[]>(`${BASE_URL}/userSettings/getByType/quantifiableHabits`),
          axios.get<ExtendedNoteData[]>(`${BASE_URL}/dailyNotes/listByRange`, {
            params: { startDate: startDateStr, endDate: endDateStr }
          }),
          axios.get<MoneyData[]>(`${BASE_URL}/money/listsByTypeAndRange/Expense`, {
            params: { startDate: startDateStr, endDate: endDateStr }
          }),
          axios.get<TimeData[]>(`${BASE_URL}/time/listByRange`, {
            params: { startDate: startDateStr, endDate: endDateStr }
          }),
          axios.get<MoodNoteData[]>(`${BASE_URL}/mood/listByRange`, {
            params: { startDate: startDateStr, endDate: endDateStr }
          }),
          axios.get<JournalData[]>(`${BASE_URL}/journal/listByRange`, {
            params: { startDate: startDateStr, endDate: endDateStr }
          })
        ]);

        setUserSettingsBooleans(userSettingsBooleans.data);
        setUserSettingsQuantifiables(userSettingsQuantifiables.data);
        setDailyNoteData(dailyNotes.data);
        setMoneyData(moneyRecords.data);
        setTimeData(timeRecords.data);
        setMoodData(moodRecords.data);
        setJournalData(journalRecords.data);

        if (dailyNotes.data && dailyNotes.data.length > 0) {
          const formattedDailyData = dailyNotes.data.map(note => ({
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
  }, [startDate, endDate]);

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