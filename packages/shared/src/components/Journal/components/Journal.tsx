// Libraries
import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet, Alert, Platform, BackHandler, Dimensions, TextInput, Keyboard } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit, faCheck, faMapMarkerAlt, faTrash } from '@fortawesome/free-solid-svg-icons';

import EnhancedTextInput from '@los/shared/src/components/@/EnhancedTextInput';
import CrossPlatformMarkdown from '@los/shared/src/components/@/CrossPlatformMarkdown';
import Navbar from '@los/shared/src/sharedComponents/NavBar';

import { useHomepage } from '../../Home/helpers/useHomepage';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { useNavbarDrawer } from '@los/shared/src/components/Contexts/NavbarContext';

import { PersonData } from '@los/shared/src/types/People';
import { ContactData } from '@los/shared/src/types/Contact';
import { UniversalModal } from '../../../sharedComponents/UniversalModal';

let useJournal
let useEnhancedTextInput
if (Platform.OS === 'web') {
    useJournal = require('@los/desktop/src/components/Journal/hooks/useJournal').useJournal;
    useEnhancedTextInput = require('@los/desktop/src/components/@/hooks/useEnhancedTextInput').useEnhancedTextInput;
} else {
    useJournal = require('@los/mobile/src/components/Journal/hooks/useJournal').useJournal;
    useEnhancedTextInput = require('@los/mobile/src/components/@/hooks/useEnhancedTextInput').useEnhancedTextInput;
}

const Journal: React.FC<{ date: string; uuid: string, onClose?: () => void }> = ({ date, uuid, onClose }) => {
    const { journalEntry, loadJournalEntry, saveJournalEntry, deleteJournalEntry, place } = useJournal(date, uuid);
    const [localJournalEntry, setLocalJournalEntry] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [mentionedPeople, setMentionedPeople] = useState<PersonData[]>([]);
    const [placeModalVisible, setPlaceModalVisible] = useState(false);
    const [newPlace, setNewPlace] = useState(place || '');
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const { setKeyboardVisible } = useNavbarDrawer();
    const { upsertContact } = useEnhancedTextInput();
    const { openHomepage } = useHomepage();

    const { themeColors, designs, markdownStyles } = useThemeStyles();
    const styles = getStyles(themeColors);

    const handleSave = useCallback(async () => {
        if (localJournalEntry !== journalEntry) {
            try {
                await saveJournalEntry(localJournalEntry);

                for (const person of mentionedPeople) {
                    const newContact: ContactData = {
                        personId: Number(person.id),
                        peopleName: person.name,
                        peopleLastname: person.lastName,
                        source: 'journal',
                        dateOfContact: new Date().toISOString().split('T')[0],
                    };

                    try {
                        const result = await upsertContact(newContact);
                        if (result) {
                            console.log('Contact saved successfully');
                        } else {
                            console.error('Failed to save contact');
                        }
                    } catch (error) {
                        console.error('Error saving contact:', error);
                    }
                }

                setMentionedPeople([]);
                // Update the journalEntry state after saving
                await loadJournalEntry();
                // Ensure localJournalEntry is updated with the latest saved entry
                setLocalJournalEntry(localJournalEntry);
            } catch (error) {
                console.error('Error saving journal entry:', error);
                Alert.alert('Error', 'Failed to save journal entry. Please try again.');
            }
        }
    }, [localJournalEntry, journalEntry, saveJournalEntry, loadJournalEntry]);

    //? Custom back action for Android to prevent closing the Journal when editing
    //todo leaving this out here in the open creates a non breaking error on desktop
    const handleBackPress = useCallback(() => {
        if (isEditing) {
            setIsEditing(false);
            return true; // Prevent default back behavior
        } else {
            handleClose();
            return true; // Prevent default back behavior
        }
    }, [isEditing, handleSave, onClose]);

    useEffect(() => {
        loadJournalEntry();

        // Add back button handler for Android
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        // Cleanup function
        return () => backHandler.remove();
    }, [loadJournalEntry, handleBackPress]);

    useEffect(() => {
        if (journalEntry !== localJournalEntry) {
            setLocalJournalEntry(journalEntry);
        }
    }, [journalEntry]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleStopEditing = async () => {
        setIsEditing(false);
    };

    const handleClose = async () => {
        await handleSave();
        onClose && onClose();
    };

    const handleMentionAdded = (person: PersonData) => {
        setMentionedPeople(prev => [...prev, person]);
    };

    const handleDelete = async () => {
        await deleteJournalEntry();
        onClose && onClose();
    };

    const handleSetPlace = () => {
        saveJournalEntry(localJournalEntry, newPlace);
        setPlaceModalVisible(false);
    };

    const formatDateTime = (date: string | number | Date) => {
        const d = new Date(date);
        const formattedDate = d.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
        // const formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${formattedDate}`;
    };

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
            setIsKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
            setIsKeyboardVisible(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, [setKeyboardVisible]);

    return (
        <View style={styles.container}>
            <Text style={[designs.text.title, styles.title]}>{formatDateTime(date)}</Text>
            <Text style={[styles.place]}>{place}</Text>
            {isEditing ? (
                <EnhancedTextInput
                    multiline
                    editable={true}
                    value={localJournalEntry}
                    onChangeText={setLocalJournalEntry}
                    style={styles.textInput}
                    onMentionAdded={handleMentionAdded}
                    showToolbar={true}
                />
            ) : (
                <ScrollView style={{ marginHorizontal: 10 }}>
                    <CrossPlatformMarkdown style={markdownStyles}>
                        {localJournalEntry}
                    </CrossPlatformMarkdown>
                </ScrollView>
            )}
            {!isKeyboardVisible && (
                <View style={styles.iconContainer}>
                    <Pressable onPress={handleDelete}>
                    <FontAwesomeIcon 
                        icon={faTrash} 
                        size={24} 
                        color={'gray'} />
                </Pressable>
                <Pressable onPress={() => setPlaceModalVisible(true)} style={{ marginHorizontal: 40 }}>
                    <FontAwesomeIcon 
                        icon={faMapMarkerAlt} 
                        size={24} 
                        color={'gray'} />
                </Pressable>
                <Pressable onPress={isEditing ? handleStopEditing : handleEdit}>
                    <FontAwesomeIcon 
                        icon={isEditing ? faCheck : faEdit} 
                        size={24} 
                        color={isEditing ? themeColors.hoverColor : 'gray'} 
                        style={{ marginRight: 10 }}
                    />
                    </Pressable>
                </View>
            )}
            <Navbar
                items={[]}
                activeIndex={-1}
                title="Journal Entries"
                onBackPress={Platform.OS === 'web' ? openHomepage : undefined}
                quickButtonFunction={undefined}
                screen="journal"

            />
            {placeModalVisible &&   
                <UniversalModal isVisible={placeModalVisible} onClose={() => setPlaceModalVisible(false)}>
                    <TextInput
                        style={[
                            designs.text.input,
                            { marginTop: 40 }
                        ]}
                        placeholder="Enter place"
                        placeholderTextColor="gray"
                        value={newPlace}
                        onChangeText={setNewPlace}
                    />
                    <Pressable onPress={handleSetPlace} style={designs.button.marzoSecondary}>
                        <Text style={designs.button.buttonText}>Save</Text>
                    </Pressable>
                </UniversalModal>
            }
        </View>
    );
};

const getStyles = (theme: any) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 10,
            backgroundColor: theme.backgroundColor,
        },
        textInput: {
            flex: 1,
            padding: 10,
            marginBottom: 10,
            fontSize: 16,
            fontFamily: 'serif',
            color: theme.textColor,
            borderColor: theme.borderColor,
            borderRadius: 5,
            textAlignVertical: 'top',
        },
        iconContainer: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            padding: 10,
            paddingBottom: 15,
            marginTop: 30,
            zIndex: 10000
        },
        readOnlyInput: {
            backgroundColor: theme.backgroundColor,
        },
        title: {
            fontFamily: 'serif',
            fontSize: 28,
            marginTop: 70,
            color: theme.textColorBold
        },
        place: {
            fontFamily: 'serif',
            fontStyle: 'italic',
            color: theme.textColorItalic,
            alignSelf: 'center',
            marginTop: 0,
            marginBottom: 20,
            fontSize: 22,
        },
        backIcon: {
            position: 'absolute',
            top: 10,
            left: 20, 
            // marginLeft: 30,
        },
    });
};
export default Journal;
