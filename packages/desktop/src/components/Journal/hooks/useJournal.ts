import { useState, useCallback } from 'react';
import axios from 'axios';

import { BASE_URL } from '@los/shared/src/utilities/constants';

import { JournalData } from '@los/shared/src/types/Journal';

export const useJournal = (date: string, uuid: string) => {
  const [journalEntry, setJournalEntry] = useState<string>('');
  const [entryUuid, setEntryUuid] = useState<string | undefined>(uuid || undefined);

  const loadJournalEntry = useCallback(async () => {
    if (!entryUuid) {
      setJournalEntry('');
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/journal/read`, { params: { uuid: entryUuid } });
      if (response.data && response.data.text) {
        setJournalEntry(response.data.text);
      } else {
        setJournalEntry('');
      }
    } catch (error) {
      console.error('Error loading journal entry:', error);
    }
  }, [uuid]);

  const saveJournalEntry = useCallback(async (text: string) => {
    try {
      const entry: JournalData = {
        uuid: entryUuid,
        date,
        text,
        updatedAt: new Date().toISOString(),
      };

      const response = await axios.post(`${BASE_URL}/journal/upsert`, entry);
      setEntryUuid(response.data.uuid);
      setJournalEntry(response.data.text);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      throw error;
    }
  }, [date, entryUuid]);

  const fetchAllJournal = useCallback(async (): Promise<JournalData[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/journal/list`);
      return response.data
    } catch (error) {
      console.error('Error fetching all journal entries:', error);
      return [];
    }
  }, []);

  const deleteJournalEntry = useCallback(async () => {
    try {
      await axios.delete(`${BASE_URL}/journal/remove`, { params: { uuid: entryUuid } });
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  }, [entryUuid]);

  return {
    journalEntry,
    loadJournalEntry,
    saveJournalEntry,
    fetchAllJournal,
    deleteJournalEntry
  };
};