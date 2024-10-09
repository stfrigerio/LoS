// Libraries
import React, { useState, useEffect } from 'react';
import { Platform, View, Text, Pressable, StyleSheet, Dimensions, Keyboard } from 'react-native';
import { omit } from 'lodash'; 
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSave, faEdit } from '@fortawesome/free-solid-svg-icons';

import DeleteButton from '@los/shared/src/sharedComponents/DeleteButton';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import EnhancedTextInput from '../../@/EnhancedTextInput';
import AlertModal from '../../modals/AlertModal';

import { AggregateTextData, TextNotesData } from '@los/shared/src/types/TextNotes';
import { PersonData } from '@los/shared/src/types/People';
import { ContactData } from '@los/shared/src/types/Contact';
import { useNavbarDrawer } from '@los/shared/src/components/Contexts/NavbarContext';

let useEnhancedTextInput
let useTextSection
if (Platform.OS === 'web') {
    useEnhancedTextInput = require('@los/desktop/src/components/@/hooks/useEnhancedTextInput').useEnhancedTextInput;
    useTextSection = require('@los/desktop/src/components/PeriodicNote/hooks/useTextSection').useTextSection;
} else {
    useEnhancedTextInput = require('@los/mobile/src/components/@/hooks/useEnhancedTextInput').useEnhancedTextInput;
    useTextSection = require('@los/mobile/src/components/PeriodicNote/hooks/useTextSection').useTextSection;
}

const generateUUID = () => {
    if (Platform.OS === 'web') {
        return uuidv4();
    } else {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

export interface TextSectionProps {
    periodType: string;
    startDate: string;
    endDate: string;
}

const TextInputs: React.FC<TextSectionProps> = ({ periodType, startDate, endDate }) => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);
    const { setKeyboardVisible } = useNavbarDrawer();

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, [setKeyboardVisible]);

    const { 
        textData, 
        handleInputChange, 
        handleAddNewItem, 
        handleDeleteItem, 
        refetchData, 
        editingStates,
        toggleEditing 
    } = useTextSection({ periodType, startDate, endDate });

    const [localTextData, setLocalTextData] = useState<AggregateTextData>(textData);
    const [mentionedPeople, setMentionedPeople] = useState<PersonData[]>([]);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ section: typeof sections[number], index: number } | null>(null);

    const { upsertContact } = useEnhancedTextInput();

    useEffect(() => {
        setLocalTextData(textData);
    }, [textData]);

    const sections: Array<keyof Pick<AggregateTextData, 'successes' | 'beBetters' | 'thinks'>> = ['successes', 'beBetters', 'thinks'];
    const sectionLabels: Record<typeof sections[number], string> = {
        successes: '🏆 Success',
        beBetters: '🦾 Be Better',
        thinks: '🧠 Think'
    };

    const handleLocalInputChange = (text: string, section: typeof sections[number], index: number) => {
        setLocalTextData(prev => ({
            ...prev,
            [section]: prev[section].map((item, i) => i === index ? { ...item, text } : item)
        }));
    };

    const handleSave = async (section: typeof sections[number], index: number) => {
        const item = localTextData[section][index];
        const key = section === 'successes' ? 'success' : section === 'beBetters' ? 'beBetter' : 'think';
        const completeItem: TextNotesData = {
            ...omit(item, ['createdAt', 'updatedAt', 'tempId']),
            text: item.text || '',
            period: localTextData.date,
            key: key,
        };

        for (const person of mentionedPeople) {
            const newContact: ContactData = {
                personId: Number(person.id),
                peopleName: person.name,
                peopleLastname: person.lastName,
                source: 'periodicNote',
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

        handleInputChange(completeItem);
        refetchData(); // Re-fetch data after saving
        toggleEditing(section, index);
    };

    const handleDelete = (section: typeof sections[number], index: number) => {
        setItemToDelete({ section, index });
        setDeleteModalVisible(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            const { section, index } = itemToDelete;
            const item = localTextData[section][index];
            if (item.uuid) {
                handleDeleteItem(item.uuid, section);
            } else {
                console.warn(`Deleting unsaved item in ${section}:`, item);
            }
            setLocalTextData(prev => ({
                ...prev,
                [section]: prev[section].filter((_, i) => i !== index)
            }));
        }
        setDeleteModalVisible(false);
        setItemToDelete(null);
    };

    const cancelDelete = () => {
        setDeleteModalVisible(false);
        setItemToDelete(null);
    };

    const handleAddNewItemWithTempId = (section: typeof sections[number]) => {
        const newItem = {
            text: '',
            tempId: generateUUID(), // Generate a temporary unique ID
        };
        setLocalTextData(prev => ({
            ...prev,
            [section]: [...prev[section], newItem]
        }));
        handleAddNewItem(section);
    };

    const handleMentionAdded = (person: PersonData) => {
        setMentionedPeople(prev => [...prev, person]);
    };

    return (
        <View style={styles.textSummaries}>
            {sections.map((section) => (
            <View style={styles.formSection} key={section}>
                <Text style={styles.sectionLabel}>{sectionLabels[section]}</Text>
                {localTextData[section].map((item: any, index: number) => {
                    const isEditing = editingStates[`${section}-${index}`];
                    return (
                        <View style={styles.inputContainer} key={item.uuid || item.tempId || `${section}-${index}`}>
                            <View style={styles.inputWrapper}>
                                <EnhancedTextInput
                                    style={[designs.text.input, isEditing ? styles.editingInput : styles.readOnlyInput]}
                                    value={item.text}
                                    onChangeText={(text) => handleLocalInputChange(text, section, index)}
                                    editable={isEditing}
                                    onMentionAdded={handleMentionAdded}
                                    onFocus={() => setKeyboardVisible(true)}
                                    onBlur={() => setKeyboardVisible(false)}
                                />
                            </View>
                            <View style={styles.iconContainer}>
                                <Pressable onPress={() => isEditing ? handleSave(section, index) : toggleEditing(section, index)}>
                                    <FontAwesomeIcon 
                                        icon={isEditing ? faSave : faEdit} 
                                        color={isEditing ? themeColors.hoverColor : 'gray'} 
                                        size={20} 
                                        style={styles.icon}
                                    />
                                </Pressable>
                                <DeleteButton onDelete={() => handleDelete(section, index)} />
                            </View>
                        </View>
                    );
                })}
                <Pressable style={styles.addButton} onPress={() => handleAddNewItemWithTempId(section)}>
                    <Text style={styles.addButtonText}>Add +</Text>
                </Pressable>
            </View>
            ))}
            {deleteModalVisible && (
                <AlertModal
                    isVisible={deleteModalVisible}
                    title="Confirm Delete"
                    message="Are you sure you want to delete this item?"
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </View>
    );
}

const getStyles = (theme: any) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        textSummaries: {
            display: 'flex',
            flexDirection: isSmall ? 'column' : 'row',
            flexWrap: 'wrap',
            gap: isDesktop ? 20 : 10,
            borderRadius: 10,
            borderColor: theme.borderColor,
            padding: isDesktop ? 20 : 10,
            margin: isDesktop ? 20 : 15,
            justifyContent: 'space-between',
        },
        sectionLabel: {
            marginBottom: 15,
            fontSize: isDesktop ? 20 : 18,
            color: theme.hoverColor,
            fontWeight: 'bold',
            textAlign: 'left',
        },
        addButton: {
            padding: 12,
            paddingHorizontal: 20,
            marginTop: 15,
            borderRadius: 5,
            alignSelf: 'flex-start',
        },
        addButtonText: {
            color: 'gray',
            fontWeight: 'bold',
        },
        formSection: {
            flex: isSmall ? 0 : 1,
            width: isSmall ? '100%' : isDesktop ? '30%' : '45%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            marginBottom: isDesktop ? 0 : 20,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
        },
        inputWrapper: {
            flex: 1,
        },
        editingInput: {
            backgroundColor: theme.backgroundColor,
            minHeight: 50,
            borderRadius: 5,
            padding: 10,
        },
        readOnlyInput: {
            backgroundColor: 'transparent',
            minHeight: 50,
            borderRadius: 5,
            padding: 10,
        },
        icon: {
            marginHorizontal: 10,
        },
        iconContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 10,
        },
    });
}

export default TextInputs