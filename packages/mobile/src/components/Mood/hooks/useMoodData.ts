import { useState, useEffect, useCallback } from 'react';

import { databaseManagers } from '../../../database/tables';

import { MoodNoteData } from '@los/shared/src/types/Mood';

export const useMoodData = () => {
    const [entries, setEntries] = useState<MoodNoteData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMoods = useCallback(async () => {
        try {
            setIsLoading(true);
            const moods = await databaseManagers.mood.list();
            setEntries(moods);
            setError(null);
        } catch (err) {
            setError('Error fetching moods');
            console.error('Error fetching moods:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMoods();
    }, [fetchMoods]);

    const deleteMood = useCallback(async (id: number) => {
        try {
            await databaseManagers.mood.remove(id);
            setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
        } catch (err) {
            setError('Error deleting mood');
            console.error('Error deleting mood:', err);
        }
    }, []);

    const editMood = useCallback(async (updatedMood: MoodNoteData) => {
        try {
            await databaseManagers.mood.upsert(updatedMood);
            setEntries(prevEntries =>
                prevEntries.map(entry =>
                    entry.id === updatedMood.id ? updatedMood : entry
                )
            );
        } catch (err) {
            setError('Error updating mood');
            console.error('Error updating mood:', err);
        }
    }, []);

    const addMood = useCallback(async (newMood: Omit<MoodNoteData, 'id'>) => {
        try {
            const addedMood = await databaseManagers.mood.upsert(newMood);
            setEntries(prevEntries => [...prevEntries, addedMood]);
        } catch (err) {
            setError('Error adding mood');
            console.error('Error adding mood:', err);
        }
    }, []);

    return {
        entries,
        isLoading,
        error,
        fetchMoods,
        deleteMood,
        editMood,
        addMood,
        refreshMoods: fetchMoods,
    };
};