import { useState, useEffect, useCallback } from 'react';
import { timeTableManager } from '../../../database/tables/timeTable';
import { TimeData } from '@los/shared/src/types/Time';

export const useTimeData = () => {
    const [entries, setEntries] = useState<TimeData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTimeEntries = useCallback(async () => {
        try {
            setIsLoading(true);

            const timeEntries = await timeTableManager.list();

            setEntries(timeEntries);
            setError(null);
        } catch (err) {
            setError('Error fetching time entries');
            console.error('Error fetching time entries:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTimeEntries();
    }, [fetchTimeEntries]);

    const deleteTimeEntry = useCallback(async (id: number) => {
        try {
            await timeTableManager.remove(id);
            setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
        } catch (err) {
            setError('Error deleting time entry');
            console.error('Error deleting time entry:', err);
        }
    }, []);

    const editTimeEntry = useCallback(async (updatedEntry: TimeData) => {
        try {
            await timeTableManager.upsert(updatedEntry);
            setEntries(prevEntries =>
                prevEntries.map(entry =>
                    entry.id === updatedEntry.id ? updatedEntry : entry
                )
            );
        } catch (err) {
            setError('Error updating time entry');
            console.error('Error updating time entry:', err);
        }
    }, []);

    const batchUpdateTimeEntries = useCallback(
        async (uuids: string[], updatedFields: Partial<TimeData>) => {
            try {
                setIsLoading(true);
                
                const updatePromises = uuids.map(async (uuid) => {
                    const existingEntry = entries.find(e => e.uuid === uuid);
                    if (existingEntry) {
                        const updatedEntry = { ...existingEntry, ...updatedFields };
                        return await timeTableManager.upsert(updatedEntry);
                    }
                    return null;
                });

                const updatedEntries = await Promise.all(updatePromises);
                const validUpdatedEntries = updatedEntries.filter(e => e !== null) as TimeData[];

                // Create a new array with updated entries
                setEntries(prevEntries => {
                    const entriesMap = new Map(prevEntries.map(e => [e.uuid, e]));
                    validUpdatedEntries.forEach(updated => {
                        entriesMap.set(updated.uuid, updated);
                    });
                    return Array.from(entriesMap.values());
                });

                // Force a refresh of the data
                await fetchTimeEntries();
            } catch (err) {
                console.error('Batch update failed:', err);
                setError('Failed to batch update time entries');
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [entries, fetchTimeEntries]
    );

    const addTimeEntry = useCallback(async (newEntry: Omit<TimeData, 'id'>) => {
        try {
            const addedEntry = await timeTableManager.upsert(newEntry);
            setEntries(prevEntries => [...prevEntries, addedEntry]);
        } catch (err) {
            setError('Error adding time entry');
            console.error('Error adding time entry:', err);
        }
    }, []);

    return {
        entries,
        isLoading,
        error,
        fetchTimeEntries,
        deleteTimeEntry,
        editTimeEntry,
        addTimeEntry,
        batchUpdateTimeEntries,
    };
};