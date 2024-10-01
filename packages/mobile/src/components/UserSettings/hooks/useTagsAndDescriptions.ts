import { useState, useEffect, useCallback } from 'react';
import { databaseManagers } from '@los/mobile/src/database/tables';

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
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async (): Promise<TagData[]> => {
    try {
      const types = ['moneyTag', 'moneyDescription', 'timeTag', 'timeDescription', 'moodTag', 'moodDescription'];
      const fetchedItems = await Promise.all(types.map(type => databaseManagers.tags.getTagsByType(type)));
      const flattenedItems = fetchedItems.flat();
      setItems(flattenedItems);
      return flattenedItems;
    } catch (error) {
      console.error('Failed to fetch items:', error);
      return [];
    }
  };

  const handleDeleteItem = async (id: number, deleteAssociated: boolean = false) => {
    try {
      const itemToDelete = items.find(item => item.id === id);
      if (!itemToDelete) {
        console.error('Item not found');
        return;
      }
  
      // console.log('itemToDelete', itemToDelete);
      await databaseManagers.tags.remove(id);
  
      if (deleteAssociated && itemToDelete.type.endsWith('Tag')) {
        const associatedDescriptions = items.filter(item => 
          item.type === itemToDelete.type.replace('Tag', 'Description') && 
          item.linkedTag === itemToDelete.text
        );

        // console.log('associatedDescriptions', associatedDescriptions);
        
        for (const desc of associatedDescriptions) {
          await databaseManagers.tags.remove(desc.id!);
        }
      }
  
      await fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleAddOrUpdateItem = async (newItem: {
    uuid?: string;
    text: string;
    type: string;
    emoji: string;
    linkedTag?: string;
    color?: string;
  }): Promise<TagData[]> => {
    try {
      const newTag = {
        uuid: newItem.uuid,
        text: newItem.text,
        type: newItem.type,
        emoji: newItem.emoji,
        linkedTag: ['moneyDescription', 'timeDescription', 'moodDescription'].includes(newItem.type) ? newItem.linkedTag : undefined,
        color: newItem.color ? newItem.color : undefined
      }

      await databaseManagers.tags.upsert(newTag as TagData);
      return await fetchItems();
    } catch (error) {
      console.error('Failed to add or update item:', error);
      return [];
    }
  };

  const getTagsForSelection = useCallback((type: 'money' | 'time' | 'mood'): TagData[] => {
    const tagType = `${type}Tag`;
    return items.filter(item => item.type === tagType);
  }, [items]);

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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