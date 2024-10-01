import { useState, useEffect } from 'react';
import axios from 'axios';

import { SelectionData } from '@los/mobile/src/components/Home/components/TimerComponent';
import { TagData } from '@los/shared/src/types/TagsAndDescriptions';
import { BASE_URL } from '@los/shared/src/utilities/constants';

export const useDescriptionModal = (
    isOpen: boolean,
    selectedTag: TagData,
    setSelectionData: (updateFunc: (prevData: SelectionData) => SelectionData) => void,
    sourceTable: string
) => {
    const [newDescriptionName, setNewDescriptionName] = useState('');
    const [descriptions, setDescriptions] = useState<TagData[]>([]);

    const fetchDescriptions = async (tag: TagData) => {
        if (!tag || !tag.text) {
            console.log('No tag selected or tag text is empty');
            setDescriptions([]);
            return;
        }
        
        try {
            const response = await axios.get(`${BASE_URL}/tags/getDescriptionsByTag/${tag.text}`);
            let fetchedDescriptions: TagData[] = response.data;

            if (sourceTable === "TimeTable") {
                fetchedDescriptions = fetchedDescriptions.filter(description => description.type === "timeDescription");
            } else if (sourceTable === "MoneyTable") {
                fetchedDescriptions = fetchedDescriptions.filter(description => description.type === "moneyDescription");
            } else if (sourceTable === "MoodTable") {
                fetchedDescriptions = fetchedDescriptions.filter(description => description.type === "moodDescription");
            }

            const mergedDescriptions = Array.from(new Set(fetchedDescriptions.map(description => JSON.stringify(description))))
                .map(descriptionString => JSON.parse(descriptionString));

            setDescriptions(mergedDescriptions);
        } catch (error) {
            console.error('Failed to fetch descriptions:', error);
            setDescriptions([]);
        }
    };

    useEffect(() => {
        if (isOpen && selectedTag) {
            fetchDescriptions(selectedTag);
        }
    }, [isOpen, selectedTag]);

    const handleDescriptionSelect = (description: TagData) => {
        setSelectionData(prevData => ({
            ...prevData,
            selectedDescription: description,
            isDescriptionModalOpen: false
        }));
    };

    const closeDescriptionModal = () => {
        setSelectionData(prevData => ({ ...prevData, isDescriptionModalOpen: false }));
    };

    return {
        newDescriptionName,
        setNewDescriptionName,
        descriptions,
        handleDescriptionSelect,
        closeDescriptionModal
    };
};