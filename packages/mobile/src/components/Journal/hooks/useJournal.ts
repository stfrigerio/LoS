import { useState, useCallback } from 'react';

import { databaseManagers } from '../../../database/tables';

import { JournalData } from '@los/shared/src/types/Journal';

export const useJournal = (date: string, uuid: string) => {
	const [journalEntry, setJournalEntry] = useState<string>('');
	const [entryUuid, setEntryUuid] = useState<string | undefined>(uuid || undefined);
	const [place, setPlace] = useState<string | undefined>(undefined);

	const loadJournalEntry = useCallback(async () => {
		if (!entryUuid) {
			setJournalEntry('');
			setPlace(undefined);
			return;
		}

		try {
			const entry = await databaseManagers.journal.getByUuid(uuid);
			if (entry) {
				setJournalEntry(entry.text);
				setPlace(entry.place);
			} else {
				setJournalEntry('');
				setPlace(undefined);
			}
		} catch (error) {
			console.error('Error loading journal entry:', error);
		}
	}, [uuid]);

	const saveJournalEntry = useCallback(async (text: string, newPlace?: string | undefined) => {
		try {
			const journalData: JournalData = {
				uuid: entryUuid,
				date,
				text,
				place: newPlace !== undefined ? newPlace : place,
				updatedAt: new Date().toISOString(),
			};

			const savedEntry = await databaseManagers.journal.upsert(journalData);
			setEntryUuid(savedEntry.uuid);
			setJournalEntry(savedEntry.text);
			setPlace(savedEntry.place);
		} catch (error) {
			console.error('Error saving journal entry:', error);
			throw error;
		}
	}, [date, entryUuid, place]);

	const saveAIJournalEntry = useCallback(async (journalData: JournalData) => {
		try {
			const savedEntry = await databaseManagers.journal.upsert(journalData);
			setEntryUuid(savedEntry.uuid);
			setJournalEntry(savedEntry.text);
			setPlace(savedEntry.place);
		} catch (error) {
			console.error('Error saving AI journal entry:', error);
			throw error;
		}
	}, [date, entryUuid, place]);

	const fetchAllJournal = useCallback(async () => {
		try {
			const entries = await databaseManagers.journal.list();
			return entries
		} catch (error) {
			console.error('Error fetching all journal dates:', error);
			return [];
		}
	}, []);

	const deleteJournalEntry = useCallback(async () => {
		try {
			if (entryUuid) {
				await databaseManagers.journal.removeByUuid(entryUuid);
			}
		} catch (error) {
			console.error('Error deleting journal entry:', error);
		}
	}, [entryUuid]);

	return {
		journalEntry,
		place,
		loadJournalEntry,
		saveJournalEntry,
		saveAIJournalEntry,
		fetchAllJournal,
		deleteJournalEntry
	};
};