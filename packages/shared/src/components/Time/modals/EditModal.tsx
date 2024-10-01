import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import TagModal from '@los/shared/src/components/modals/TagModal';
import DescriptionModal from '@los/shared/src/components/modals/DescriptionModal';
import TagDescriptionSelector from '@los/shared/src/sharedComponents/TagDescriptionSelector';
import createTimePicker from '@los/shared/src/sharedComponents/DateTimePicker';

import { TimeData } from '../../../types/Time';
import { useThemeStyles } from '../../../styles/useThemeStyles';
import { TagData } from '../../../types/TagsAndDescriptions';
import { SelectionData } from '@los/mobile/src/components/Home/components/TimerComponent';

interface EditTimeEntryModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (updatedEntry: TimeData) => void;
    timeEntry: TimeData;
}

const EditTimeEntryModal: React.FC<EditTimeEntryModalProps> = ({
    isVisible,
    onClose,
    onSave,
    timeEntry,
}) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);

    console.log('timeEntry', timeEntry);

    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<TagData | undefined>(undefined);
    const [selectedDescription, setSelectedDescription] = useState<TagData | undefined>(undefined);
    const { showPicker, picker } = createTimePicker();

    // if (!timeEntry.startTime || !timeEntry.endTime) {
    //     return null;
    // }

    const [editedEntry, setEditedEntry] = useState<TimeData>({ ...timeEntry });

    useEffect(() => {
        setEditedEntry({ ...timeEntry });
    }, [timeEntry]);

    const handleSave = () => {
        onSave(editedEntry);
        onClose();
    };

    useEffect(() => {
        if (isVisible) {
            setEditedEntry({ ...timeEntry });
        }
    }, [isVisible, timeEntry]);

    const handleClose = () => {
        setEditedEntry({ ...timeEntry });
        setIsTagModalOpen(false);
        setIsDescriptionModalOpen(false);
        // Reset other state variables if needed
        onClose();
    };

    const updateTagInSelectionData = () => {
        return (updateFunc: (prevData: SelectionData) => SelectionData) => {
            const updatedData = updateFunc({} as SelectionData);
            const newSelectedTag = updatedData.selectedTag;
            if (newSelectedTag) {
                setSelectedTag(newSelectedTag);
                console.log('newSelectedTag', newSelectedTag);
                setEditedEntry(prev => ({ 
                    ...prev, 
                    tag: newSelectedTag.text
                }));
                setIsTagModalOpen(false);
                setIsDescriptionModalOpen(true);
            } else {
                setSelectedTag(undefined);
                setEditedEntry(prev => ({ 
                    ...prev, 
                    tag: ''
                }));
                setIsTagModalOpen(false);
            }
        };
    };     
    
    const updateDescriptionInSelectionData = () => {
        return (updateFunc: (prevData: SelectionData) => SelectionData) => {
            const updatedData = updateFunc({} as SelectionData);
            const newSelectedDescription = updatedData.selectedDescription;
            if (newSelectedDescription) {
                setSelectedDescription(newSelectedDescription);
                setEditedEntry(prev => ({
                    ...prev,
                    description: newSelectedDescription.text
                }));
            } else {
                setSelectedDescription(undefined);
                setEditedEntry(prev => ({
                    ...prev,
                    description: ''
                }));
            }
            setIsDescriptionModalOpen(false);
        };
    };   

    const updateDateTime = (date: Date, isStart: boolean, isDate: boolean) => {
        const updatedEntry = { ...editedEntry };
        if (!updatedEntry.startTime || !updatedEntry.endTime) {
            return;
        }
        
        const currentDate = isStart ? new Date(updatedEntry.startTime) : new Date(updatedEntry.endTime);
    
        if (isDate) {
            currentDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        } else {
            currentDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
        }
    
        if (isStart) {
            updatedEntry.startTime = currentDate.toISOString();
        } else {
            updatedEntry.endTime = currentDate.toISOString();
        }
    
        // Recalculate duration
        const start = new Date(updatedEntry.startTime);
        const end = new Date(updatedEntry.endTime);
        const durationMs = end.getTime() - start.getTime();
        const durationSeconds = Math.floor(durationMs / 1000);
        
        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.floor((durationSeconds % 3600) / 60);
        const seconds = durationSeconds % 60;
    
        updatedEntry.duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        updatedEntry.date = updatedEntry.startTime!.split('T')[0];
    
        setEditedEntry(updatedEntry);
    };

    const showDateTimePicker = (isStart: boolean, isDate: boolean) => {
        const currentDate = isStart ? new Date(editedEntry.startTime!) : new Date(editedEntry.endTime!);
        
        showPicker({
            mode: isDate ? 'date' : 'time',
            value: currentDate,
            is24Hour: true,
        }, (selectedDate) => {
            if (selectedDate) {
                updateDateTime(selectedDate, isStart, isDate);
            }
        });
    };

    return (
        <>
            <Modal
                animationType="fade"
                transparent={true}
                visible={isVisible}
                onRequestClose={onClose}
            >
                <View style={styles.centeredView}>
                    <View style={[designs.modal.modalView]}>
                        <Pressable style={styles.closeButton} onPress={handleClose}>
                            <FontAwesomeIcon icon={faTimes} size={24} color={'gray'} />
                        </Pressable>
                        <Text style={designs.text.title}>Edit Time Entry</Text>

                        <TagDescriptionSelector
                            tag={editedEntry.tag}
                            description={editedEntry.description}
                            onPress={() => setIsTagModalOpen(true)}
                        />

                        <View style={[styles.inputContainer, { marginBottom: 10 }]}>
                            <Text style={styles.label}>Start Time:</Text>
                            <View style={styles.dateTimeContainer}>
                                <Pressable style={styles.dateTimeButton} onPress={() => showDateTimePicker(true, true)}>
                                    <Text style={styles.dateTimeText}>{new Date(editedEntry.startTime!).toLocaleDateString()}</Text>
                                </Pressable>
                                <Pressable style={styles.dateTimeButton} onPress={() => showDateTimePicker(true, false)}>
                                    <Text style={styles.dateTimeText}>{new Date(editedEntry.startTime!).toLocaleTimeString()}</Text>
                                </Pressable>
                            </View>
                        </View>

                        <View style={[styles.inputContainer, { marginBottom: 10 }]}>
                            <Text style={styles.label}>End Time:</Text>
                            <View style={styles.dateTimeContainer}>
                                <Pressable style={styles.dateTimeButton} onPress={() => showDateTimePicker(false, true)}>
                                    <Text style={styles.dateTimeText}>{new Date(editedEntry.endTime!).toLocaleDateString()}</Text>
                                </Pressable>
                                <Pressable style={styles.dateTimeButton} onPress={() => showDateTimePicker(false, false)}>
                                    <Text style={styles.dateTimeText}>{new Date(editedEntry.endTime!).toLocaleTimeString()}</Text>
                                </Pressable>
                            </View>
                        </View>

                        <View style={[styles.durationContainer]}>
                            <Text style={styles.label}>Duration:</Text>
                            <Text style={styles.durationText}>{editedEntry.duration}</Text>
                        </View>

                        <Pressable style={[designs.button.marzoSecondary, { width: '100%' }]} onPress={handleSave}>
                            <Text style={designs.button.buttonText}>Save</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <TagModal
                isOpen={isTagModalOpen}
                setSelectionData={updateTagInSelectionData()}
                sourceTable="TimeTable"
            />

            <DescriptionModal
                isOpen={isDescriptionModalOpen}
                selectedTag={selectedTag}
                setSelectionData={updateDescriptionInSelectionData()}
                sourceTable="TimeTable"
            />
            {picker}
        </>
    );
};

const getStyles = (themeColors: any, designs: any) => StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    closeButton: {
        position: 'absolute',
        padding: 10,
        right: 10,
        top: 10,
    },
    modalTitle: {
        ...designs.text.title,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 0
    },
    label: {
        ...designs.text.text,
        color: 'gray',
        marginBottom: 5,
        marginLeft: 10,
    },
    dateTimeText: {
        ...designs.text.text,
    },
    durationText: {
        ...designs.text.text,
        padding: 10,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateTimeButton: {
        flex: 1,
        padding: 10,
        borderColor: themeColors.borderColor,
        borderWidth: 1,
        borderRadius: 5,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    }
});

export default EditTimeEntryModal;