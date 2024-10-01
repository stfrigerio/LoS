import { useState, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';

import { timeStringToMinutes, minutesToTimeString } from '@los/shared/src/utilities/timeUtils'

import { NoteData } from '../../../types/DailyNote';
import { UseSleepDataProps, UseSleepDataReturn, SleepData, SleepAverages } from '../types/Sleep';

let fetchAdditionalData
if (Platform.OS === 'web') {
  fetchAdditionalData = require('@los/desktop/src/components/PeriodicNote/hooks/useSleepData').fetchAdditionalData;
} else {
  fetchAdditionalData = require('@los/mobile/src/components/PeriodicNote/hooks/useSleepData').fetchAdditionalData;
}

export const useSleepData = ({ fetchedSleepData }: UseSleepDataProps): UseSleepDataReturn => {
  const [sleepAverages, setSleepAverages] = useState<SleepAverages>({
    average_sleep_time: '',
    average_wake_time: ''
  });
  const [sleepData, setSleepData] = useState<SleepData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const transformData = useMemo(() => (allData: SleepData[]): SleepData[] => {
    return allData.slice(0, -1).map((currentDay, index) => ({
      date: allData[index + 1].date,
      sleep_time: currentDay.sleep_time,
      wake_hour: allData[index + 1].wake_hour,
    }));
  }, []);

  useEffect(() => {
    const processSleepData = async () => {
      setIsLoading(true);
      setError(null);

      if (!fetchedSleepData || fetchedSleepData.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const firstDay = new Date(fetchedSleepData[0].date);
        const lastDay = new Date(fetchedSleepData[fetchedSleepData.length - 1].date);

        const dayBefore = new Date(firstDay);
        dayBefore.setDate(dayBefore.getDate() - 1);

        const additionalDataBefore = await fetchAdditionalData(dayBefore.toISOString().split('T')[0]);

        const allData = [
          ...(additionalDataBefore ? [{ 
            date: additionalDataBefore.date,
            sleep_time: additionalDataBefore.sleepTime,
            wake_hour: additionalDataBefore.wakeHour
          }] : []),
          ...fetchedSleepData
        ];

        const transformedData = transformData(allData);
        setSleepData(transformedData);

        // Calculate averages
        const { totalSleepMinutes, totalWakeMinutes, daysCounted } = fetchedSleepData.reduce((acc, entry) => ({
          totalSleepMinutes: acc.totalSleepMinutes + timeStringToMinutes(entry.sleep_time),
          totalWakeMinutes: acc.totalWakeMinutes + timeStringToMinutes(entry.wake_hour),
          daysCounted: acc.daysCounted + 1
        }), { totalSleepMinutes: 0, totalWakeMinutes: 0, daysCounted: 0 });

        const averageSleepTime = minutesToTimeString(daysCounted ? totalSleepMinutes / daysCounted : 0);
        const averageWakeTime = minutesToTimeString(daysCounted ? totalWakeMinutes / daysCounted : 0);

        setSleepAverages({
          average_sleep_time: averageSleepTime,
          average_wake_time: averageWakeTime,
        });

      } catch (err) {
        console.error('Error processing sleep data:', err);
        setError('Error processing sleep data');
      } finally {
        setIsLoading(false);
      }
    };

    processSleepData();
  }, [fetchedSleepData, transformData]);

  return { sleepAverages, processedSleepData: sleepData, isLoading, sleepError: error };
};

export const extractSleepData = (notes: NoteData[]): SleepData[] => {
  return notes
    .map(note => ({
      date: note.date,
      sleep_time: note.sleepTime ?? '',  // Use empty string if undefined
      wake_hour: note.wakeHour ?? '',    // Use empty string if undefined
    }))
    .filter(
      (data): data is SleepData => 
        data.sleep_time !== '' && data.wake_hour !== ''
    );
};