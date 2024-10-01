import { useState, useEffect, useCallback, useRef } from 'react';
import { format, getISOWeek } from 'date-fns';

import { databaseManagers } from '../../../database/tables';
import { TextNotesData, AggregateTextData } from '@los/shared/src/types/TextNotes';

interface useTextSectionProps {
    periodType: string;
    startDate: string | Date;
    endDate: string | Date;
}

export const useTextSection = ({ periodType, startDate, endDate }: useTextSectionProps) => {
    const [textData, setTextData] = useState<AggregateTextData>({
        date: '',
        successes: [],
        beBetters: [],
        thinks: []
    });
    const [error, setError] = useState<string | null>(null);
    const [editingStates, setEditingStates] = useState<Record<string, boolean>>({});

    const generatePeriodString = useCallback(() => {
        if (!startDate) return '';

        const date = startDate instanceof Date ? startDate : new Date(startDate);

        switch (periodType) {
            case 'day':
                return format(date, 'yyyy-MM-dd');
            case 'week':
                const isoWeek = getISOWeek(date);
                return `${format(date, 'yyyy')}-W${String(isoWeek).padStart(2, '0')}`;
            case 'month':
                return format(date, 'yyyy-MM');
            case 'quarter':
                const quarter = Math.ceil(parseInt(format(date, 'M'), 10) / 3);
                return `${format(date, 'yyyy')}-Q${quarter}`;
            case 'year':
                return format(date, 'yyyy');
            default:
                return '';
        }
    }, [startDate, periodType]);
    
    const periodString = generatePeriodString();

    const fetchData = useCallback(async () => {
        try {
            const textResults = await databaseManagers.text.getByPeriod(periodString);
            if (textResults && textResults.length > 0) {
                const aggregatedData: AggregateTextData = {
                    date: periodString,
                    successes: [],
                    beBetters: [],
                    thinks: []
                };
                textResults.forEach(item => {
                    if (item.key === 'success') aggregatedData.successes.push(item);
                    if (item.key === 'beBetter') aggregatedData.beBetters.push(item);
                    if (item.key === 'think') aggregatedData.thinks.push(item);
                });
                setTextData(aggregatedData);
            } else {
                setTextData({ date: periodString, successes: [], beBetters: [], thinks: [] });
            }
        } catch (error: any) {
            setError(`Error fetching data: ${error.message}`);
            setTextData({ date: periodString, successes: [], beBetters: [], thinks: [] });
        }
    }, [periodString, startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = useCallback(async (item: TextNotesData) => {
        try {
            // Immediately update local state
            setTextData(prevData => {
                const section = item.key === 'success' ? 'successes' : item.key === 'beBetter' ? 'beBetters' : 'thinks';
                const newItems = prevData[section].map(existingItem => 
                    existingItem.uuid === item.uuid ? item : existingItem
                );
        
                return {
                    ...prevData,
                    [section]: newItems,
                };
            });

            // Only send update to server if the text is not empty
            if (item.text.trim() !== '') {
                databaseManagers.text.upsert(item);
                // After successful update, refetch data to ensure consistency
                await fetchData();
            }
        } catch (error: any) {
            setError('Error updating data');
            // Revert local state on error
            await fetchData();
        }
    }, [fetchData]);

    const handleAddNewItem = useCallback(async (field: keyof AggregateTextData) => {
        const key = field === 'successes' ? 'success' : field === 'beBetters' ? 'beBetter' : 'think';
        const newItem: TextNotesData = {
            period: periodString,
            key: key,
            text: '',
            synced: 0
        };
    
        try {
            // Add new item to database
            const savedItem = await databaseManagers.text.upsert(newItem);
    
            // Update local state with the saved item
            setTextData(prev => ({
                ...prev,
                [field]: [...prev[field], savedItem],
            }));
    
            // Set the new item to be in editing state
            setEditingStates(prev => ({
                ...prev,
                [`${field}-${textData[field].length}`]: true
            }));
        } catch (error: any) {
            setError(`Error adding new item: ${error.message}`);
        }
    }, [periodString, textData]);

    const toggleEditing = useCallback((section: keyof AggregateTextData, index: number) => {
        setEditingStates(prev => ({
            ...prev,
            [`${section}-${index}`]: !prev[`${section}-${index}`]
        }));
    }, []);
    
    const handleDeleteItem = useCallback(async (uuid: string, section: keyof AggregateTextData) => {
        try {
            await databaseManagers.text.removeByUuid(uuid);
            setTextData(prevData => {
                const sectionData = prevData[section];
                if (Array.isArray(sectionData)) {
                    return {
                        ...prevData,
                        [section]: sectionData.filter((item: TextNotesData) => item.uuid !== uuid)
                    };
                }
                return prevData;
            });
        } catch (error: any) {
            setError(`Error deleting item: ${error.message}`);
        }
    }, []);

    return {
        textData,
        error,
        handleInputChange,
        handleAddNewItem,
        handleDeleteItem,
        refetchData: fetchData,
        editingStates,
        toggleEditing
    };
};