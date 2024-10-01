import { useState, useEffect, useCallback } from 'react';
import { timeTableManager } from '../../../database/tables/timeTable';
import { TimeData } from '@los/shared/src/types/Time';
import { startOfDay, startOfMonth, subDays, format, eachDayOfInterval } from 'date-fns';

export const useTimeData = () => {
    const [entries, setEntries] = useState<TimeData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTimeEntries = useCallback(async () => {
        try {
            setIsLoading(true);
            const endDate = startOfDay(new Date());
            const startDate = subDays(endDate, 14); // Fetch last 14 days

            // Generate an array of all dates in the range
            const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
                .map(date => format(date, 'yyyy-MM-dd'));

            const timeEntries = await timeTableManager.getTime({ dateRange });

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
    };
};