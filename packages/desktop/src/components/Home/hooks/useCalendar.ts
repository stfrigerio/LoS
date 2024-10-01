import { Platform } from 'react-native';
import axios from 'axios'

interface BirthdayRecord {
  value: string;
  settingKey: string;
}

import { ChecklistItemData, TempDueDates, MarkedDateDetails, ExtendedChecklistItemData } from '@los/shared/src/types/ChecklistItem'; 

export const parseChecklistItems = (items: ChecklistItemData[]): TempDueDates => {
  const tempDueDates: TempDueDates = {};
  items.forEach(item => {
    const datePart = item.due!.split('T')[0];
    if (!tempDueDates[datePart]) {
      tempDueDates[datePart] = { marked: true, dotColor: 'rgba(61, 247, 52, 0.5)', incompleteTasks: 0, tasks: [] };
    }
    tempDueDates[datePart].tasks.push(item);
    if (!item.completed) {
      tempDueDates[datePart].dotColor = '#CBA95F';
    }
  });
  return tempDueDates;
}

export const getUpdatedBirthdayDates = async (currentYear: number): Promise<Record<string, MarkedDateDetails>> => {
    let birthdayRecords


    const response = await axios.get('http://localhost:3000/userSettings/listByType/birthday');
    birthdayRecords = response.data;


    const updatedBirthdayDates: Record<string, MarkedDateDetails> = {};

    birthdayRecords.forEach((birthday: BirthdayRecord) => {
        const monthDay = birthday.value.substring(5);
        const fullDate = `${currentYear}-${monthDay}`;
        const age = calculateAge(birthday.value);
        updatedBirthdayDates[fullDate] = {
        marked: true,
        dotColor: 'rgba(247, 92, 120, 0.8)',
        isBirthday: true,
        name: birthday.settingKey, // Assuming 'settingKey' holds the name
        dateOfBirth: birthday.value,
        age
        };
    });

    return updatedBirthdayDates;
}

export const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    
    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();

    return age;
};

export const mergeDates = (taskDates: TempDueDates, birthdayDates: Record<string, MarkedDateDetails>): Record<string, MarkedDateDetails> => {
    const dueDates: Record<string, MarkedDateDetails> = { ...birthdayDates };
    Object.keys(taskDates).forEach(date => {
        if (dueDates[date]) { // If the date is already marked as a birthday
        // Merge but keep the birthday's dotColor
        dueDates[date] = {
            ...taskDates[date],
            ...dueDates[date],
            dotColor: dueDates[date].dotColor // Ensures the birthday's dotColor takes precedence
        };
        } else {
        // If no birthday, just copy the task date details
        dueDates[date] = taskDates[date];
        }
    });
    return dueDates;
};

export const getDayItems = async (date: string, markedDates: Record<string, MarkedDateDetails>): Promise<ExtendedChecklistItemData[]> => {
    let items

    const response = await axios.get(`http://localhost:3000/task/listByRange/${date}T00:00:00/${date}T23:59:59`);
    items = response.data;

    const extendedItems: ExtendedChecklistItemData[] = items.map((item: ChecklistItemData) => ({ ...item }));

    if (markedDates[date]?.isBirthday) {
        extendedItems.push({
        text: `${markedDates[date].name} turns ${markedDates[date].age} today!`,
        due: date,
        completed: false,
        isBirthday: true,
        });
    }

    return extendedItems;
}
