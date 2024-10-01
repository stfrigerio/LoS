import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMoneyBill, faClock, faSmile, faTag } from '@fortawesome/free-solid-svg-icons';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import DeleteButton from '@los/shared/src/sharedComponents/DeleteButton';
import EditButton from '@los/shared/src/sharedComponents/EditButton';
import Collapsible from '@los/shared/src/sharedComponents/Collapsible';
import AlertModal from '@los/shared/src/components/modals/AlertModal'; // Add this import

import AddTagDescriptionModal from './modals/AddTagDescriptionModal'
import { UseTagsAndDescriptionsType } from './types/DefaultTagsAndDescriptions';
import { TagData } from '@los/shared/src/types/TagsAndDescriptions';
import GluedQuickbutton from '../../../sharedComponents/NavBar/GluedQuickbutton';

let useTagsAndDescriptions: UseTagsAndDescriptionsType;
if (Platform.OS === 'web') {
  useTagsAndDescriptions = require('@los/desktop/src/components/UserSettings/hooks/useTagsAndDescriptions').useTagsAndDescriptions;
} else {
  useTagsAndDescriptions = require('@los/mobile/src/components/UserSettings/hooks/useTagsAndDescriptions').useTagsAndDescriptions;
}

const DefaultTagsAndDescriptions = () => {
  const [items, setItems] = useState<TagData[]>([]);
  const [expandedTags, setExpandedTags] = useState<{ [key: string]: boolean }>({});
  const [editingItem, setEditingItem] = useState<TagData | null>(null);
  const [currentSection, setCurrentSection] = useState('money');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertActions, setAlertActions] = useState<(() => void)[]>([]);
  const [alertModalVisible, setAlertModalVisible] = useState(false);

  const { themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);
  const { fetchItems, handleDeleteItem, handleAddOrUpdateItem, getTagsForSelection } = useTagsAndDescriptions();

  useEffect(() => {
    const loadItems = async () => {
      const fetchedItems = await fetchItems();
      setItems(fetchedItems);
    };
    loadItems();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setIsAddModalVisible(true);
  };

  const openEditModal = (item: TagData) => {
    setEditingItem(item);
    setIsAddModalVisible(true);
  };

  const handleAddOrEditItem = async (itemData: TagData) => {
    const updatedItems = await handleAddOrUpdateItem(itemData);
    setItems(updatedItems);
    setIsAddModalVisible(false);
    setEditingItem(null);
  };
  
  const refreshItems = async () => {
    const updatedItems = await fetchItems();
    setItems(updatedItems);
  };

  const handleItemDelete = (id: number, type: string) => {
    if (type.endsWith('Tag')) {
      setAlertTitle("Delete Tag");
      setAlertMessage("Do you want to delete this tag and all its associated descriptions?");
      setAlertActions([
        async () => {
          await handleDeleteItem(id, false);
          refreshItems();
        },
        async () => {
          await handleDeleteItem(id, true);
          refreshItems();
        }
      ]);
      setAlertModalVisible(true);
    } else {
      setAlertTitle("Delete Description");
      setAlertMessage("Do you want to delete this description?");
      setAlertActions([
        async () => {
          await handleDeleteItem(id, false);
          refreshItems();
        }
      ]);
      setAlertModalVisible(true);
    }
  };


  const toggleTag = (tagText: string) => {
    setExpandedTags(prev => ({
      ...prev,
      [tagText]: !prev[tagText]
    }));
  };

  const handleSectionChange = (newSection: string) => {
    setCurrentSection(newSection);
  };

  const renderSectionSelector = () => (
    <View style={styles.sectionSelectorContainer}>
      {[
        { key: 'money', icon: faMoneyBill },
        { key: 'time', icon: faClock },
        { key: 'mood', icon: faSmile }
      ].map((section) => (
        <Pressable
          key={section.key}
          style={[styles.sectionButton, currentSection === section.key && styles.activeSectionButton]}
          onPress={() => handleSectionChange(section.key)}
        >
          <FontAwesomeIcon 
            icon={section.icon} 
            color={currentSection === section.key ? themeColors.hoverColor : themeColors.textColor} 
            size={24} 
          />
        </Pressable>
      ))}
    </View>
  );

  const renderSection = (title: string, tagType: string) => (
    <>
      <Text style={[designs.text.title, {fontSize: 18, marginBottom: 20, color: 'gray'}]}>{title}</Text>
      {renderItems(tagType)}
    </>
  );

  const getLinkedDescriptions = (tagText: string): TagData[] => {
    return items.filter(item => 
      item.linkedTag === tagText && item.type.endsWith('Description')
    );
  };

  const renderItems = (filterType: string) => {
    if (!items) return null;
    const tags = items.filter(item => item.type === filterType);
    const descriptions = items.filter(item => item.type === `${filterType.replace('Tag', 'Description')}`);
    const sortedTags = tags.sort((a, b) => a.text.localeCompare(b.text));

    return sortedTags.map((tag, index) => (
      <View key={index} style={styles.tagContainer}>
        <View style={styles.tagHeader}>
          <Pressable 
            onPress={() => filterType !== 'moodTag' && toggleTag(tag.text)} 
            style={styles.tagNameContainer}
          >
            <View style={[styles.colorDot, { backgroundColor: tag.color }]} />
            <Text style={[designs.text.text, styles.tagText]}>
              {tag.text} {tag.emoji}
            </Text>
            {filterType !== 'moodTag' && (
              <Text style={[styles.arrow, expandedTags[tag.text] && styles.arrowExpanded]}>▼</Text>
            )}
          </Pressable>
          <EditButton onEdit={() => openEditModal(tag)} />
          <DeleteButton onDelete={() => handleItemDelete(tag.id!, tag.type)} />
        </View>
        {filterType !== 'moodTag' && (
          <Collapsible collapsed={!expandedTags[tag.text]}>
            {descriptions
              .filter(desc => desc.linkedTag === tag.text)
              .map((desc, descIndex, array) => (
                <View 
                  key={descIndex} 
                  style={[
                    styles.descriptionItem, 
                    descIndex === array.length - 1 && styles.lastDescriptionItem
                  ]}
                >
                  <Text style={[designs.text.text, styles.descriptionText]}>{desc.emoji} {desc.text}</Text>
                  <EditButton onEdit={() => openEditModal(desc)} />
                  <DeleteButton onDelete={() => handleItemDelete(desc.id!, desc.type)} />
                </View>
              ))}
          </Collapsible>
        )}
      </View>
    ));
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {renderSectionSelector()}
        <Text style={{ color: 'gray', marginLeft: 10 }}>
          Tags and Descriptions help you quickly categorize timers and expenses.
          Tags are broad categories (e.g., "Work", "Exercise"), while descriptions are specific activities or items (e.g., "Meeting", "Groceries").
          Each description is linked to one tag, but a tag can have multiple descriptions.
        </Text>
        <Text style={{ color: 'gray', marginLeft: 10, marginTop: 10 }}>
          Moods are the exception as they do not have descriptions, and a single mood entry can have many tags.
        </Text>
        <View style={{height: 20}} />
        {currentSection === 'money' && renderSection('Money Tags', 'moneyTag')}
        {currentSection === 'time' && renderSection('Time Tags', 'timeTag')}
        {currentSection === 'mood' && renderSection('Mood Tags', 'moodTag')}
      </ScrollView>
      {alertModalVisible &&
        <AlertModal
          isVisible={alertModalVisible}
          title={alertTitle}
          message={alertMessage}
          onConfirm={() => {
            alertActions[0]();
            setAlertModalVisible(false);
          }}
          onCancel={() => setAlertModalVisible(false)}
        />
      }
      {isAddModalVisible && (
        <AddTagDescriptionModal
          isVisible={isAddModalVisible}
          onClose={() => {
            setIsAddModalVisible(false);
            setEditingItem(null);
          }}
          onAdd={handleAddOrEditItem}
          initialData={editingItem || undefined}
          getTagsForSelection={getTagsForSelection}
          currentSection={currentSection}
          getLinkedDescriptions={getLinkedDescriptions}
        />
      )}
      <GluedQuickbutton screen="defaultTagsAndDescriptions" onPress={openAddModal} />
    </>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: { 
    padding: 20,
  },
  sectionSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sectionButton: {
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  activeSectionButton: {
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 10,
    height: 60,
    marginVertical: 10
  },
  itemText: {
    flex: 1,
  },
  tagContainer: {
    paddingHorizontal: 30,
  },
  tagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  descriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    marginTop: 5,
  },
  lastDescriptionItem: {
    marginBottom: 35, 
  },
  descriptionText: {
    flex: 1,
    color: 'lightgray'
  },
  tagNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagText: {
    color: theme.textColor,
    fontFamily: 'serif',
    marginRight: 5,
    flex: 1,
  },
  arrow: {
    fontSize: 16,
    color: 'gray',
    transform: [{ rotate: '0deg' }],
    marginRight: 15,
    marginBottom: 5
  },
  arrowExpanded: {
    transform: [{ rotate: '180deg' }],
    marginBottom: 0
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 5,
    right: 25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#CD535B',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 9999
},
});

export default DefaultTagsAndDescriptions;
