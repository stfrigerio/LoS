import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Color from 'color';

import TagModal from './TagModal';
import EnhancedTextInput from '@los/shared/src/components/@/EnhancedTextInput'
import { UniversalModal } from '@los/shared/src/sharedComponents/UniversalModal';
import createTimePicker from '@los/shared/src/sharedComponents/DateTimePicker';
import { FormInput } from './components/FormComponents';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

import { MoodNoteData } from '@los/shared/src/types/Mood';
import { PersonData } from '@los/shared/src/types/People';
import { SelectionData } from '@los/mobile/src/components/Home/components/TimerComponent';
import { TagData } from '../../types/TagsAndDescriptions';

let useMoodNoteModal: any;
if (Platform.OS === 'web') {
    useMoodNoteModal = require('@los/desktop/src/components/modals/useMoodModal').useMoodNoteModal;
} else {
    useMoodNoteModal = require('@los/mobile/src/components/modals/useMoodModal').useMoodNoteModal;
}

interface MoodNoteModalProps {
  isOpen: boolean;
  closeMoodModal: () => void;
  initialMoodNote?: MoodNoteData;
  refreshMoods?: () => void;
  tagColors?: Record<string, string>;
  isEdit?: boolean;
}

const MoodNoteModal: React.FC<MoodNoteModalProps> = ({ isOpen, closeMoodModal, initialMoodNote, refreshMoods, isEdit, tagColors }) => {
  const { theme, themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);
  const { showPicker } = createTimePicker();

  const [showCommentScreen, setShowCommentScreen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [moodTags, setMoodTags] = useState<TagData[]>(
    initialMoodNote?.tag ? initialMoodNote.tag.split(',').map(tag => ({
      text: tag,
      type: 'moodTag',
      emoji: '',
      linkedTag: null,
      color: tagColors?.[tag] || '', // Use the passed tagColors
    })) : []
  );
  const [mentionedPeople, setMentionedPeople] = useState<PersonData[]>([]);

  const [moodNote, setMoodNote] = useState<MoodNoteData>(initialMoodNote || {
    date: new Date().toISOString(), // Initialize with current date in ISO format
    rating: 0,
    tag: '',
    description: '',
    comment: '',
    synced: 0,
    createdAt: '',
    updatedAt: '',
  });

  const [dateInput, setDateInput] = useState<string>(moodNote.date || new Date().toISOString());

  const {
    handleSave,
  } = useMoodNoteModal(closeMoodModal);

  const handleChange = (name: string, value: string) => {
    setMoodNote({
    ...moodNote,
    [name]: value,
    });
  };

  const handleMentionAdded = (person: PersonData) => {
      setMentionedPeople(prev => [...prev, person]);
  };

  const updateTagInSelectionData = () => {
    return (updateFunc: (prevData: SelectionData) => SelectionData) => {
      const updatedData = updateFunc({} as SelectionData);
      
      const selectedTag = updatedData.selectedTag;
      
      if (selectedTag && !moodTags.some(tag => tag.text === selectedTag.text)) {
        setMoodTags(prevTags => [...prevTags, selectedTag]);
      }

      setIsTagModalOpen(false);
    };
  };

  const removeMoodTag = (tagToRemove: TagData) => {
    setMoodTags(prevTags => prevTags.filter(tag => tag.text !== tagToRemove.text));
  };

  const handleCommentChange = (text: string) => {
    handleChange('comment', text);
  };

  const handleSaveMoodNote = () => {
    const updatedMoodNote = {
      ...moodNote,
      tag: moodTags.map(tag => tag.text).join(',')
    };
    handleSave(updatedMoodNote, mentionedPeople).catch((error: any) => alert(error.message));
    setMentionedPeople([]);
    closeMoodModal();
    if (refreshMoods) {
      refreshMoods();
    }
  };

  const handleRatingChange = (value: string | number) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    setMoodNote(prev => ({
      ...prev,
      rating: Math.min(Math.max(numericValue, 0), 10) // Ensure rating is between 0 and 10
    }));
  };

  useEffect(() => {
    setMoodNote(prev => ({ 
      ...prev, 
      tag: moodTags.map(tag => tag.text).join(',') 
    }));
  }, [moodTags]);

  useEffect(() => {
    if (initialMoodNote) {
      setMoodNote(initialMoodNote);
    }
  }, [initialMoodNote]);

  function formatDateTimeDisplay(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
  
  const showDatePicker = () => {
    showPicker({
      mode: 'datetime',
      value: new Date(dateInput),
      is24Hour: true,
    }, (selectedDate) => {
      if (selectedDate) {
        const newDateInput = selectedDate.toISOString();
        setDateInput(newDateInput);
        setMoodNote(prevMoodNote => ({
          ...prevMoodNote,
          date: newDateInput
        }));
      }
    });
  };

  const getContrastColor = (bgColor: string) => {
    const color = Color(bgColor);
    return color.isLight() ? '#000000' : '#FFFFFF';
  };

  return (
    <UniversalModal
      isVisible={isOpen}
      onClose={closeMoodModal}
      modalViewStyle="taller"
      hideCloseButton={showCommentScreen}
    >
      <Text style={[designs.text.title, { marginBottom: 30 }]}>        
      {showCommentScreen ? 'Add Detailed Comment' : '💭 Mood Entry'}</Text>
      {showCommentScreen ? (
        <>
          <View style={{ width: '100%', height: 200 }}>
            <EnhancedTextInput
              style={[designs.text.input, styles.inputText, { minHeight: 120 }]}
              containerStyle={{ width: '100%' }}
              onChangeText={handleCommentChange}
              value={moodNote.comment}
              placeholder="Type your detailed comment here..."
              placeholderTextColor='#808080'
              onMentionAdded={handleMentionAdded}
            />
            <Pressable onPress={() => setShowCommentScreen(false)} style={[designs.button.marzoPrimary, { width: '90%' }]}>
              <Text style={designs.button.buttonText}>✅ Done</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          {isEdit && (
            <Pressable onPress={showDatePicker} style={designs.text.input}>
              <Text style={designs.text.text}>
                {formatDateTimeDisplay(dateInput)}
              </Text>
            </Pressable>
          )}
          <View style={{ width: '100%' }}>
            <FormInput
              label="Rate your mood (0-10)"
              value={moodNote.rating.toString()}
              onChangeText={handleRatingChange}
              isNumeric={true}
              placeholder="Enter a number between 0 and 10"
            />
          </View>
          <View style={{ width: '100%', marginBottom: 15 }}>
            <Pressable 
              style={[{ padding: 10, flexDirection: 'row', justifyContent: 'center'}]}
              onPress={() => setIsTagModalOpen(true)}
            >
              <Text style={designs.text.text}>Add Tags +</Text>
            </Pressable>
            <View style={[styles.tagContainer]}>
              {moodTags.map((tag, index) => (
                  <Pressable 
                    key={`${tag.text}-${index}`}
                    style={[styles.tag, { backgroundColor: tag.color ? `${tag.color}99` : undefined }]}
                    onPress={() => removeMoodTag(tag)}
                  >
                    <Text style={[
                      styles.tagText, 
                      { color: tag.color ? getContrastColor(tag.color) : theme.textColor }
                    ]}>
                      {tag.text}
                    </Text>
                    <Text style={[
                      styles.removeTag, 
                      { color: tag.color ? getContrastColor(tag.color) : theme.textColor }
                    ]}>
                      ×
                    </Text>
                  </Pressable>
              ))}
            </View>
          </View>
          <Pressable onPress={() => setShowCommentScreen(true)} style={[designs.button.marzoPrimary, { width: '90%', alignSelf: 'center'}]}>
            <Text style={designs.button.buttonText}>Add Comment</Text>
          </Pressable>
          <Pressable onPress={handleSaveMoodNote} style={[designs.button.marzoSecondary, { width: '90%', alignSelf: 'center'}]}>
            <Text style={designs.button.buttonText}>Save</Text>
          </Pressable>
        </>
      )}
      {isTagModalOpen && (
        <TagModal
          isOpen={isTagModalOpen}
          setSelectionData={updateTagInSelectionData()}
          sourceTable="MoodTable"
        />
      )}
    </UniversalModal>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  inputText: {
    fontFamily: 'serif',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: theme.borderColor,
    padding: 10,
    borderRadius: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 2,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  removeTag: {
    fontSize: 16,
    fontWeight: 'bold',
    opacity: 0.6,
  },
});

export default MoodNoteModal;