import { Platform } from 'react-native';

import { DailyNoteData } from '../../../types/DailyNote';
import { ChartData } from '../../Charts/QuantifiableHabitsChart/types/types';
import { SunBurstRecord } from '../../Charts/Sunburst/SunburstChart';
import { MoneyData } from '../../../types/Money';
import { TimeData } from '../../../types/Time';
import { EntryData } from '../components/EntriesList'

import { formatMinutes } from '../../../utilities/timeUtils';
import { hexToRgba } from '../../Charts/colorMap';

export function processQuantifiableHabits(dailyNoteData: DailyNoteData[]): ChartData {
  const habits: ChartData = { dates: [] };

  dailyNoteData.forEach((note: DailyNoteData) => {
    habits.dates.push(note.date!);
    if (note.quantifiableHabits) {
      if (Array.isArray(note.quantifiableHabits)) {
        // Desktop structure
        note.quantifiableHabits.forEach(habit => {
          if (!habits[habit.habitKey]) habits[habit.habitKey] = [];
          (habits[habit.habitKey] as number[]).push(Number(habit.value));
        });
      } else {
        // Mobile structure
        Object.entries(note.quantifiableHabits).forEach(([habit, value]) => {
          if (!habits[habit]) habits[habit] = [];
          (habits[habit] as number[]).push(Number(value));
        });
      }
    }
  });

  return habits;
}

export function processBooleanHabits(dailyNoteData: DailyNoteData[]): ChartData {
  const habits: ChartData = { dates: [] };

  dailyNoteData.forEach((note: DailyNoteData) => {
    habits.dates.push(note.date!);
    if (note.booleanHabits) {
      if (Array.isArray(note.booleanHabits)) {
        // Desktop structure
        note.booleanHabits.forEach(habit => {
          if (!habits[habit.habitKey]) habits[habit.habitKey] = [];
          (habits[habit.habitKey] as number[]).push(habit.value ? 1 : 0);
        });
      } else {
        // Mobile structure
        Object.entries(note.booleanHabits).forEach(([habit, value]) => {
          if (!habits[habit]) habits[habit] = [];
          (habits[habit] as number[]).push(Number(value));
        });
      }
    }
  });

  return habits;
}

export function transformMoneyDataForSunburst(data: MoneyData[]): SunBurstRecord {
  const root: SunBurstRecord = { name: 'Expenses', children: [] };
  const tagMap: { [key: string]: SunBurstRecord } = {};

  data.forEach(transaction => {
    if (transaction.type === 'Expense') {
      if (!tagMap[transaction.tag]) {
        tagMap[transaction.tag] = { name: transaction.tag, children: [] };
        root.children!.push(tagMap[transaction.tag]);
      }
      
      const existingChild = tagMap[transaction.tag].children!.find(
        child => child.name === transaction.description
      );

      if (existingChild) {
        existingChild.size! += transaction.amount;
      } else {
        tagMap[transaction.tag].children!.push({
          name: transaction.description,
          size: transaction.amount
        });
      }
    }
  });

  return root;
}

export function transformTimeDataForSunburst(data: TimeData[]): SunBurstRecord | null {
  if (!data || data.length === 0) {
    console.warn('No time data available for sunburst chart');
    return null;
  }

  const root: SunBurstRecord = { name: 'Time Spent', children: [] };
  const tagMap: { [key: string]: SunBurstRecord } = {};

  function timeStringToMinutes(timeString: string): number {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
  }

  data.forEach(timeEntry => {
    if (timeEntry.duration) {
      if (!tagMap[timeEntry.tag]) {
        tagMap[timeEntry.tag] = { name: timeEntry.tag, children: [] };
        root.children!.push(tagMap[timeEntry.tag]);
      }
      
      const description = timeEntry.description || 'Unspecified';
      const durationInMinutes = timeStringToMinutes(timeEntry.duration);

      const existingChild = tagMap[timeEntry.tag].children!.find(child => child.name === description);
      
      if (existingChild) {
        existingChild.size! += durationInMinutes;
      } else {
        tagMap[timeEntry.tag].children!.push({
          name: description,
          size: durationInMinutes
        });
      }
    }
  });

  if (root.children!.length === 0) {
    console.warn('No valid time entries found for sunburst chart');
    return null;
  }

  // Sort children by size (descending order)
  root.children!.forEach(tagNode => {
    tagNode.children!.sort((a, b) => (b.size || 0) - (a.size || 0));
  });
  root.children!.sort((a, b) => 
    (b.children!.reduce((sum, child) => sum + (child.size || 0), 0)) - 
    (a.children!.reduce((sum, child) => sum + (child.size || 0), 0))
  );

  return root;
}

export const formatTimeEntries = (data: any, tagColors: Record<string, string> = {}): EntryData[] => {
  // console.log('Formatting time entries. Data:', data, 'TagColors:', tagColors);
  if (!data || !data.children || !Array.isArray(data.children)) {
    // console.warn('Invalid time data structure');
    return [];
  }

  const totalMinutes = data.children.reduce((sum: number, tag: any) => 
    sum + (tag.children?.reduce((tagSum: number, child: any) => tagSum + (child.size || 0), 0) || 0), 0);
  
  const result = data.children.flatMap((tag: any) =>
    (tag.children || []).map((child: any) => {
      const baseColor = (tagColors && tagColors[tag.name]) || '#000000';
      const opacity = 0.8; //^ adjust this value as needed
      const colorWithOpacity = hexToRgba(baseColor, opacity);

      return {
        color: colorWithOpacity,
        description: child.name || 'No description',
        percentage: totalMinutes > 0 ? ((child.size || 0) / totalMinutes * 100).toFixed(2) : '0',
        value: formatMinutes(child.size || 0),
      };
    })
  );

  return result;
};

export const formatMoneyEntries = (data: any, tagColors: Record<string, string> = {}): EntryData[] => {
  if (!data || !data.children || !Array.isArray(data.children)) {
    // console.warn('Invalid money data structure');
    return [];
  }

  const totalAmount = data.children.reduce((sum: number, category: any) => 
    sum + (category.children?.reduce((catSum: number, subcategory: any) => catSum + (subcategory.size || 0), 0) || 0), 0);

  const result = data.children.flatMap((category: any) =>
    (category.children || []).map((subcategory: any) => {
      const baseColor = (tagColors && tagColors[category.name]) || '#000000';
      const opacity = 0.8; //^ adjust this value as needed
      const colorWithOpacity = hexToRgba(baseColor, opacity);
      
      return {
        color: colorWithOpacity,
        description: subcategory.name || 'No description',
        percentage: totalAmount > 0 ? ((subcategory.size || 0) / totalAmount * 100).toFixed(2) : '0',
        value: (subcategory.size || 0).toFixed(2),
      };
    })
  );

  return result;
};