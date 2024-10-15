import { useState, useEffect, useMemo } from 'react';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import { format, sub } from 'date-fns';

import { databaseManagers } from '../../../database/tables';
import { NoteData } from '@los/shared/src/types/DailyNote';
import { MoodNoteData } from '@los/shared/src/types/Mood';
import { MoneyData } from '@los/shared/src/types/Money';
import { TimeData } from '@los/shared/src/types/Time';
import { UserSettingData } from '@los/shared/src/types/UserSettings';
import { JournalData } from '@los/shared/src/types/Journal';
import { DailyTextData } from '@los/shared/src/types/TextNotes';

interface UsePeriodicDataReturnType {
	current: {
		dailyNoteData: ExtendedNoteData[];
		moneyData: MoneyData[];
		timeData: TimeData[];
		moodData: MoodNoteData[];
		userSettingsBooleans: UserSettingData[];
		userSettingsQuantifiables: UserSettingData[];
		journalData: JournalData[];
		dailyTextData: DailyTextData[];
	};
	previous: {
		dailyNoteData: ExtendedNoteData[];
		moneyData: MoneyData[];
		timeData: TimeData[];
		moodData: MoodNoteData[];
		userSettingsBooleans: UserSettingData[];
		userSettingsQuantifiables: UserSettingData[];
		journalData: JournalData[];
		dailyTextData: DailyTextData[];
	};
}

export interface ExtendedNoteData extends NoteData {
	quantifiableHabits: { [key: string]: number };
	booleanHabits: { [key: string]: boolean };
}

export const usePeriodicData = (startDate: Date, endDate: Date): UsePeriodicDataReturnType => {
	const [currentData, setCurrentData] = useState({
		dailyNoteData: [] as ExtendedNoteData[],
		moneyData: [] as MoneyData[],
		timeData: [] as TimeData[],
		moodData: [] as MoodNoteData[],
		userSettingsBooleans: [] as UserSettingData[],
		userSettingsQuantifiables: [] as UserSettingData[],
		journalData: [] as JournalData[],
		dailyTextData: [] as DailyTextData[],
	});
	
	// Previous period state
	const [previousData, setPreviousData] = useState({
		dailyNoteData: [] as ExtendedNoteData[],
		moneyData: [] as MoneyData[],
		timeData: [] as TimeData[],
		moodData: [] as MoodNoteData[],
		userSettingsBooleans: [] as UserSettingData[],
		userSettingsQuantifiables: [] as UserSettingData[],
		journalData: [] as JournalData[],
		dailyTextData: [] as DailyTextData[],
	});

	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	// Determine the period type based on the difference between startDate and endDate
	const periodType = useMemo(() => {
		const diffInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
		if (diffInDays <= 7) return 'week';
		if (diffInDays <= 31) return 'month';
		// Add more period types as needed
		return 'custom';
	}, [startDate, endDate]);

	// Calculate previous period's start and end dates
	const { previousStartDate, previousEndDate } = useMemo(() => {
		let prevStart: Date, prevEnd: Date;

		switch (periodType) {
		case 'week':
			prevStart = sub(startDate, { weeks: 1 });
			prevEnd = sub(endDate, { weeks: 1 });
			break;
		case 'month':
			prevStart = sub(startDate, { months: 1 });
			prevEnd = sub(endDate, { months: 1 });
			break;
		// Add more cases as needed
		default:
			// For custom periods, adjust accordingly
			prevStart = sub(startDate, { days: (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) });
			prevEnd = sub(endDate, { days: (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) });
			break;
		}

		return { previousStartDate: prevStart, previousEndDate: prevEnd };
	}, [periodType, startDate, endDate]);

	const { startDateStr, endDateStr, previousStartDateStr, previousEndDateStr } = useMemo(() => {
		const localStartDate = toDate(startDate, { timeZone });
		const localEndDate = toDate(endDate, { timeZone });
		const localPrevStartDate = toDate(previousStartDate, { timeZone });
		const localPrevEndDate = toDate(previousEndDate, { timeZone });

		return {
		startDateStr: formatInTimeZone(localStartDate, timeZone, 'yyyy-MM-dd'),
		endDateStr: formatInTimeZone(localEndDate, timeZone, 'yyyy-MM-dd'),
		previousStartDateStr: formatInTimeZone(localPrevStartDate, timeZone, 'yyyy-MM-dd'),
		previousEndDateStr: formatInTimeZone(localPrevEndDate, timeZone, 'yyyy-MM-dd'),
		};
	}, [startDate, endDate, previousStartDate, previousEndDate, timeZone]);

	useEffect(() => {
		const fetchData = async (
		startStr: string,
		endStr: string
		): Promise<{
		dailyNoteData: ExtendedNoteData[];
		moneyData: MoneyData[];
		timeData: TimeData[];
		moodData: MoodNoteData[];
		userSettingsBooleans: UserSettingData[];
		userSettingsQuantifiables: UserSettingData[];
		journalData: JournalData[];
		dailyTextData: DailyTextData[];
		}> => {
			try {
				const [userSettingsBooleans, userSettingsQuantifiables] = await Promise.all([
					databaseManagers.userSettings.getByType('booleanHabits'),
					databaseManagers.userSettings.getByType('quantifiableHabits'),
				]);

				const [
					dailyNotes,
					moneyRecords,
					timeRecords,
					moodRecords,
					journalRecords,
				] = await Promise.all([
					databaseManagers.dailyNotes.getByDateRange(startStr, endStr),
					databaseManagers.money.getByDateRange(startStr, endStr),
					databaseManagers.time.getByDateRange(startStr, endStr),
					databaseManagers.mood.getByDateRange(startStr, endStr),
					databaseManagers.journal.getByDateRange(startStr, endStr),
				]);

				// Sanitize daily note data
				const sanitizedDailyNotes = sanitizeDailyNoteData(
					dailyNotes,
					userSettingsBooleans,
					userSettingsQuantifiables
				);

				// Format daily text data
				const dailyTextData: DailyTextData[] = dailyNotes && dailyNotes.length > 0
				? dailyNotes.map(note => ({
					date: format(new Date(note.date!), 'yyyy-MM-dd'),
					success: note.success!,
					beBetter: note.beBetter!,
					morningComment: note.morningComment!,
					}))
				: [];

				return {
					dailyNoteData: sanitizedDailyNotes,
					moneyData: moneyRecords,
					timeData: timeRecords,
					moodData: moodRecords,
					userSettingsBooleans,
					userSettingsQuantifiables,
					journalData: journalRecords,
					dailyTextData,
				};
			} catch (error) {
				console.error('Error fetching data:', error);
				return {
					dailyNoteData: [],
					moneyData: [],
					timeData: [],
					moodData: [],
					userSettingsBooleans: [],
					userSettingsQuantifiables: [],
					journalData: [],
					dailyTextData: [],
				};
			}
		};	

		const fetchPeriodicData = async () => {
		// Fetch current period data
		const current = await fetchData(startDateStr, endDateStr);
		setCurrentData(current);

		// Fetch previous period data
		const previous = await fetchData(previousStartDateStr, previousEndDateStr);
		setPreviousData(previous);
		};

		fetchPeriodicData();
	}, [startDateStr, endDateStr, previousStartDateStr, previousEndDateStr]);

	return {
		current: currentData,
		previous: previousData,
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