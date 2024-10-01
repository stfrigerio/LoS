import React, { useState, useMemo } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';

import { SelectionData } from '@los/mobile/src/components/Home/components/TimerComponent';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import AddTagDescriptionModal from '../UserSettings/components/modals/AddTagDescriptionModal';

import { UseTagsAndDescriptionsType } from '../UserSettings/components/types/DefaultTagsAndDescriptions';
import { TagData } from '../../types/TagsAndDescriptions';
let useTagModal: any;
let useTagsAndDescriptions: UseTagsAndDescriptionsType;
if (Platform.OS === 'web') {
  useTagModal = require('@los/desktop/src/components/modals/useTagModal').useTagModal;
  useTagsAndDescriptions = require('@los/desktop/src/components/UserSettings/hooks/useTagsAndDescriptions').useTagsAndDescriptions;
} else {
  useTagModal = require('@los/mobile/src/components/modals/useTagModal').useTagModal;
  useTagsAndDescriptions = require('@los/mobile/src/components/UserSettings/hooks/useTagsAndDescriptions').useTagsAndDescriptions;
}

interface TagModalProps {
  isOpen: boolean;
  setSelectionData: (updateFunc: (prevData: SelectionData) => SelectionData) => void;
  sourceTable: string;
}

const TagModal: React.FC<TagModalProps> = ({ isOpen, setSelectionData, sourceTable }) => {
  const { theme, themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    tags,
    closeTagModal,
    handleTagSelect,
    fetchTags
  } = useTagModal(isOpen, sourceTable, setSelectionData);

  const { handleAddOrUpdateItem } = useTagsAndDescriptions();

  const handleAddOrEditItem = async (itemData: TagData) => {
    await handleAddOrUpdateItem(itemData);
    fetchTags();
    setIsAddModalOpen(false);
  };

  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) => a.text.localeCompare(b.text));
  }, [tags]);

  return (
    <>
      <Modal 
        visible={isOpen} 
        onRequestClose={() => closeTagModal(setSelectionData)} 
        transparent={true}
        animationType="fade"
      >
        <View style={designs.modal.modalContainer}>
          <View style={designs.modal.tagsDescriptionModalView}>
            <Text style={designs.text.title}>Select Tag</Text>
            {tags && tags.length > 0 ? (
              <FlatList
                data={sortedTags}
                renderItem={({ item, index }) => {
                  const isLastItem = index === tags.length - 1; 
                  return (
                    <Pressable
                      style={[
                        styles.tagItem,
                        isLastItem ? styles.lastItem : null,
                        { backgroundColor: themeColors.backgroundColor },
                      ]}
                      onPress={() => handleTagSelect(item, setSelectionData)}
                    >
                      <View style={styles.tagContent}>
                        <Text style={designs.text.text}>{item.emoji}</Text>
                        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                        <Text style={designs.text.text}>{item.text}</Text>
                      </View>
                    </Pressable>
                  );
                }}
                keyExtractor={(item, index) => `tag-${item.id || index}`}
              />
            ) : (
              <Text style={[designs.text.text, { textAlign: 'center', color: 'gray' }]}>No tags available</Text>
            )}
            <Pressable
              style={[designs.button.marzoSecondary, styles.addButton]}
              onPress={() => setIsAddModalOpen(true)}
            >
              <Text style={designs.button.buttonText}>Add New Tag</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      { isAddModalOpen && 
        <AddTagDescriptionModal
          isVisible={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddOrEditItem}
          getTagsForSelection={() => []} // You might need to implement this
          currentSection={sourceTable === 'MoodTable' ? 'mood' : sourceTable === 'TimeTable' ? 'time' : sourceTable === 'MoneyTable' ? 'money' : sourceTable}
          getLinkedDescriptions={() => []} // You might need to implement this
        />
      }
    </>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  tagItem: {
    paddingHorizontal: 50,
    padding: 15,
    marginVertical: 2,
    borderBottomWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 5,
  },
  lastItem: {
    borderBottomWidth: 0
  },
  addButton: {
    marginTop: 20,
    width: '100%',
  },
  tagContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
});

export default TagModal;