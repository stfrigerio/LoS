import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { databaseManagers } from '../../../database/tables';

import { NoteData } from '@los/shared/src/types/DailyNote';

interface DayStatus {
  date: string;
  complete: boolean;
  hasNotes: boolean;
}

const DayNotesStatus: React.FC = () => {
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([]);

  const isComplete = (note: NoteData): boolean => {
    const requiredFields: (keyof NoteData)[] = ["morningComment", "energy", "wakeHour", "success", "beBetter", "dayRating", "sleepTime"];
    
    // Check if all required fields are present and not null
    for (const field of requiredFields) {
      if (note[field] === null || note[field] === undefined) {
        return false; // If any field is missing, the note is not complete
      }
    }
    
    return true; // otherwise is complete
  };

  useEffect(() => {
    (async () => {
      const statuses: DayStatus[] = [];
      const today = new Date();
      const utcDayOfWeek = today.getUTCDay();
      const utcDaysSinceMonday = (utcDayOfWeek + 6) % 7;
      const mostRecentMonday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - utcDaysSinceMonday));

      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(mostRecentMonday);
        checkDate.setDate(checkDate.getDate() + i);
        const dateString = checkDate.toISOString().split('T')[0];
        try {
          const notes = await databaseManagers.dailyNotes.getByDate(dateString);
          const hasNotes = notes.length > 0;
          const complete = hasNotes ? notes.every(note => isComplete(note)) : false;
          statuses.push({ date: dateString, complete, hasNotes });
        } catch (error) {
          console.error(`Error fetching note for date ${dateString}:`, error);
        }
      }
      setDayStatuses(statuses);
    })();
  }, []);

  return (
    <View style={styles.container}>
      {dayStatuses.map((status, index) => (
        <View
          key={index}
          style={[styles.dot, { backgroundColor: status.hasNotes ? (status.complete ? 'rgba(125, 224, 123, 0.7)' : 'rgba(217, 59, 82, 0.7)') : 'transparent' }]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 0.2,
    margin: 2,
  },
});

export default DayNotesStatus;
