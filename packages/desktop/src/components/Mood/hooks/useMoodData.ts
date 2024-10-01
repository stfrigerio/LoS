import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { BASE_URL } from '@los/shared/src/utilities/constants';

import { MoodNoteData } from '@los/shared/src/types/Mood';

export const useMoodData = () => {
    const [entries, setEntries] = useState<MoodNoteData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMoods = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get<MoodNoteData[]>(`${BASE_URL}/mood/list`);
            setEntries(response.data);
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

    const deleteMood = useCallback(async (uuid: string) => {
        try {
            await axios.delete(`${BASE_URL}/mood/remove/${uuid}`);
            setEntries(prevEntries => prevEntries.filter(entry => entry.uuid !== uuid));
        } catch (err) {
            setError('Error deleting mood');
            console.error('Error deleting mood:', err);
        }
    }, []);

    const editMood = useCallback(async (updatedMood: MoodNoteData) => {
        try {
            await axios.put(`${BASE_URL}/mood/upsert`, updatedMood);
            setEntries(prevEntries =>
                prevEntries.map(entry =>
                    entry.uuid === updatedMood.uuid ? updatedMood : entry
                )
            );
        } catch (err) {
            setError('Error updating mood');
            console.error('Error updating mood:', err);
        }
    }, []);

    const addMood = useCallback(async (newMood: Omit<MoodNoteData, 'id'>) => {
        try {
            const response = await axios.post<MoodNoteData>(`${BASE_URL}/mood/upsert`, newMood);
            setEntries(prevEntries => [...prevEntries, response.data]);
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
    };
};