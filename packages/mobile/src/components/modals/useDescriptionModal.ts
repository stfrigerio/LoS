import { useState, useEffect } from 'react';

import { databaseManagers } from '../../database/tables';

import { SelectionData } from '@los/mobile/src/components/Home/components/TimerComponent';
import { TagData } from '@los/shared/src/types/TagsAndDescriptions';

export const useDescriptionModal = (
    isOpen: boolean,
    selectedTag: TagData,
    setSelectionData: (updateFunc: (prevData: SelectionData) => SelectionData) => void,
    sourceTable: string
) => {
    const [newDescriptionName, setNewDescriptionName] = useState('');
    const [descriptions, setDescriptions] = useState<string[]>([]);

    const fetchDescriptions = async (tag: TagData) => {
        if (!tag || !tag.text) {
            console.log('No tag selected or tag text is empty');
            setDescriptions([]);
            return;
        }
        
        try {
            let fetchedDescriptions: TagData[] = []
            let defaultDescriptions: TagData[] = []

            defaultDescriptions = await databaseManagers.tags.getDescriptionsByTag(tag.text);

            if (sourceTable === "TimeTable") {
                defaultDescriptions = defaultDescriptions.filter(description => description.type === "timeDescription");
            } else if (sourceTable === "MoneyTable") {
                defaultDescriptions = defaultDescriptions.filter(description => description.type === "moneyDescription");
            } else if (sourceTable === "MoodTable") {
                defaultDescriptions = defaultDescriptions.filter(description => description.type === "moodDescription");
            }

            const mergedDescriptions = Array.from(new Set([...defaultDescriptions, ...fetchedDescriptions].map(description => JSON.stringify(description))))
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
        closeDescriptionModal,
        fetchDescriptions
    };
};