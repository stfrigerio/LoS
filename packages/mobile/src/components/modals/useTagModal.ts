import { useState, useEffect } from 'react';

import { databaseManagers } from '@los/mobile/src/database/tables';

import { SelectionData } from '@los/mobile/src/components/Home/components/TimerComponent';
import { TagData } from '@los/shared/src/types/TagsAndDescriptions';

export const useTagModal = (isOpen: boolean, sourceTable: string, setSelectionData: (updateFunc: (prevData: SelectionData) => SelectionData) => void) => {
    const [newTagName, setNewTagName] = useState('');
    const [tags, setTags] = useState<TagData[]>([]);

    const fetchTags = async () => {
        try {
            let defaultTags: TagData[] = [];

            if (sourceTable === "TimeTable") {
                defaultTags = await databaseManagers.tags.getTagsByType('timeTag');
            } else if (sourceTable === "MoneyTable") {
                defaultTags = await databaseManagers.tags.getTagsByType('moneyTag');
            } else if (sourceTable === "MoodTable") {
                defaultTags = await databaseManagers.tags.getTagsByType('moodTag');
            }

            // Ensure defaultTags is an array and all items are valid
            const validTags = (Array.isArray(defaultTags) ? defaultTags : [])
                .filter(tag => tag && typeof tag === 'object');

            const mergedTags = Array.from(new Set(validTags.map(tag => JSON.stringify(tag))))
                .map(tagString => {
                    try {
                        return JSON.parse(tagString) as TagData;
                    } catch (e) {
                        console.error('Error parsing tag:', e);
                        return null;
                    }
                })
                .filter((tag): tag is TagData => tag !== null);

            setTags(mergedTags);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
            setTags([]); // Ensure we always set a valid array
        }
    };
    
    useEffect(() => {
        if (isOpen) {
            fetchTags();
        }
    }, [isOpen]);

    const closeTagModal = () => {
        setSelectionData(prevData => ({ ...prevData, isTagModalOpen: false }));
    };

    const handleTagSelect = (tag: TagData) => {
        if (tag) {
            setSelectionData(prevData => ({ 
                ...prevData, 
                selectedTag: tag, 
                isTagModalOpen: false,
                isDescriptionModalOpen: true
            }));
        } else {
            setSelectionData(prevData => ({ 
                ...prevData, 
                isTagModalOpen: false
            }));
        }
    };

    return {
        newTagName,
        setNewTagName,
        tags,
        closeTagModal,
        handleTagSelect,
        fetchTags
    };
};