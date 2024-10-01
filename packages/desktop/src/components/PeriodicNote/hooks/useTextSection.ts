import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { format, getISOWeek } from 'date-fns';

import { BASE_URL } from '@los/shared/src/utilities/constants';

import { AggregateTextData, TextNotesData, DailyTextData} from '@los/shared/src/types/TextNotes';

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
    const [dailyTextData, setDailyTextData] = useState<DailyTextData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editingStates, setEditingStates] = useState<Record<string, boolean>>({});

    const generatePeriodDateString = useCallback(() => {
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
    
    const dateString = generatePeriodDateString()

    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/text/read`, {
                params: { period: dateString }
            });
            if (response.data && response.data.length > 0) {
                const aggregatedData: AggregateTextData = {
                    date: dateString,
                    successes: [],
                    beBetters: [],
                    thinks: []
                };
                response.data.forEach((item: TextNotesData) => {
                    if (item.key === 'success') aggregatedData.successes.push(item);
                    if (item.key === 'beBetter') aggregatedData.beBetters.push(item);
                    if (item.key === 'think') aggregatedData.thinks.push(item);
                });
                setTextData(aggregatedData);
            } else {
                setTextData({ date: dateString, successes: [], beBetters: [], thinks: [] });
            }
            const dailyResponse = await axios.get(`${BASE_URL}/dailyNotes/listByRange`, {
                params: {
                    startDate: format(startDate, 'yyyy-MM-dd'),
                    endDate: format(endDate, 'yyyy-MM-dd')
                }
            });
            if (dailyResponse.data && dailyResponse.data.data) {
                const formattedDailyData = dailyResponse.data.data.map((note: any) => ({
                    date: format(new Date(note.date), 'yyyy-MM-dd'),
                    success: note.success,
                    beBetter: note.beBetter,
                    morningComment: note.morningComment
                }));
                setDailyTextData(formattedDailyData);
            }
        } catch (error: any) {
            setError(`Error fetching data: ${error.message}`);
            setTextData({ date: dateString, successes: [], beBetters: [], thinks: [] });
        }
    }, [dateString, startDate, endDate]);

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
                await axios.post(`${BASE_URL}/text/upsert`, item);
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
            period: dateString,
            key: key,
            text: '',
            synced: 0
        };
    
        try {
            // Add new item to server
            const response = await axios.post(`${BASE_URL}/text/upsert`, newItem);
            const savedItem = response.data;
    
            // Update local state with the saved item
            setTextData(prev => ({
                ...prev,
                [field]: [...prev[field], savedItem],
            }));
    
            // Set the new item to be in editing state
            setEditingStates((prev: Record<string, boolean>) => ({
                ...prev,
                [`${field}-${textData[field].length}`]: true
            }));
        } catch (error: any) {
            setError(`Error adding new item: ${error.message}`);
        }
    }, [dateString, textData]);

    const toggleEditing = useCallback((section: keyof AggregateTextData, index: number) => {
        setEditingStates(prev => ({
            ...prev,
            [`${section}-${index}`]: !prev[`${section}-${index}`]
        }));
    }, []);

    const handleDeleteItem = useCallback(async (uuid: string, section: keyof AggregateTextData) => {
        try {
            await axios.delete(`${BASE_URL}/text/remove`, { 
                data: { uuid } // Send UUID in the request body
            });
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
        dailyTextData,
        error,
        handleInputChange,
        handleAddNewItem,
        handleDeleteItem,
        refetchData: fetchData,
        editingStates,
        toggleEditing
    };
};