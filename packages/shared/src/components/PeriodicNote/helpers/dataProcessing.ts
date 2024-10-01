import { Platform } from 'react-native';
import { processQuantifiableHabits, processBooleanHabits, transformMoneyDataForSunburst, transformTimeDataForSunburst } from './dataTransformer';
import { extractSleepData } from './sleepCalculation';

export const processQuantifiableHabitsData = (dailyNoteData: any) => {
  if (Platform.OS === 'web') {
    if (!dailyNoteData.data || dailyNoteData.data.length === 0) return null;
    return processQuantifiableHabits(dailyNoteData.data);
  } else {
    if (!dailyNoteData || dailyNoteData.length === 0) return null;
    return processQuantifiableHabits(dailyNoteData);
  }
};

export const processBooleanHabitsData = (dailyNoteData: any) => {
  if (Platform.OS === 'web') {
    if (!dailyNoteData.data || dailyNoteData.data.length === 0) return null;
    return processBooleanHabits(dailyNoteData.data);
  } else {
    if (!dailyNoteData || dailyNoteData.length === 0) return null;
    return processBooleanHabits(dailyNoteData);
  }
};

export const processMoneySunburstData = (moneyData: any) => {
  if (!moneyData || moneyData.length === 0) return null;
  return transformMoneyDataForSunburst(moneyData);
};

export const processTimeSunburstData = (timeData: any) => {
  if (!timeData || timeData.length === 0) return null;
  return transformTimeDataForSunburst(timeData);
};

export const processSleepData = (dailyNoteData: any) => {
  if (!dailyNoteData || dailyNoteData.length === 0) return null;
  return extractSleepData(dailyNoteData);
};
