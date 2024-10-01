import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '@los/shared/src/utilities/constants';

import { TagData } from '@los/shared/src/types/TagsAndDescriptions';

export const useTagsAndDescriptions = () => {
  const [items, setItems] = useState<TagData[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    Money: true,
    Time: true,
    MoneyTags: true,
    MoneyDescriptions: true,
    TimeTags: true,
    TimeDescriptions: true,
    MoodTags: true,
    MoodDescriptions: true,
  });

  const fetchItems = async () => {
    try {
      const response = await axios.get<TagData[]>(`${BASE_URL}/tags/list`);
      const fetchedItems = response.data;
      setItems(fetchedItems.flat());
      return fetchedItems.flat();
    } catch (error) {
      console.error('Failed to fetch items:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDeleteItem = async (uuid: string) => {
    try {
      await axios.delete(`${BASE_URL}/tags/remove/${uuid}`);
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleAddOrUpdateItem = async (newItem: {
    uuid: string,
    text: string;
    type: string;
    emoji: string;
    linkedTag?: string;
  }): Promise<TagData[]> => {
    try {
      await axios.post(`${BASE_URL}/tags/upsert`, {
        uuid: newItem.uuid,
        text: newItem.text,
        type: newItem.type,
        emoji: newItem.emoji,
        linkedTag: ['moneyDescription', 'timeDescription', 'moodDescription'].includes(newItem.type) ? newItem.linkedTag : undefined
      });
      return await fetchItems();
    } catch (error) {
      console.error('Failed to add or update item:', error);
      return [];
    }
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getTagsForSelection = useCallback((isMoneySelected: boolean): TagData[] => {
    const tagType = isMoneySelected ? 'moneyTag' : 'timeTag';
    return items.filter(item => item.type === tagType);
  }, [items]);

  return {
    items,
    collapsedSections,
    handleDeleteItem,
    handleAddOrUpdateItem,
    toggleSection,
    fetchItems,
    getTagsForSelection
  };
};