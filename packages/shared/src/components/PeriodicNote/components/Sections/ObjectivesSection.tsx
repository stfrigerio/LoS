import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle, faCircle, faRotateRight, faTrash } from '@fortawesome/free-solid-svg-icons';

import AlertModal from '@los/shared/src/components/modals/AlertModal';
import { AddObjectivesModal } from '@los/shared/src/components/modals/ObjectivesModal';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

import { UseObjectivesReturn, ExtendedObjectiveData } from '../../types/ObjectivesSection';
import { ObjectiveData } from '@los/shared/src/types/Objective';

let useObjectives: UseObjectivesReturn
if (Platform.OS === 'web') {
    useObjectives = require('@los/desktop/src/components/PeriodicNote/hooks/useObjectives').useObjectives
} else {
    useObjectives = require('@los/mobile/src/components/PeriodicNote/hooks/useObjectives').useObjectives
}

interface ObjectivesSectionProps {       
    currentDate: string;
    isModalVisible: boolean;
    setIsModalVisible: (value: boolean) => void;
}

export const ObjectivesSection: React.FC<ObjectivesSectionProps> = ({ currentDate, isModalVisible, setIsModalVisible }) => {
    const { 
        objectives, 
        addObjective, 
        toggleObjectiveCompletion, 
        pillars, 
        deleteObjective, 
        refreshObjectives 
        //@ts-ignore //!
    } = useObjectives(currentDate);
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<ExtendedObjectiveData | null>(null);
    const [selectedObjective, setSelectedObjective] = useState<ExtendedObjectiveData | null>(null);

    const closeModal = () => setIsModalVisible(false);

    const handleAddObjective = (newObjective: ObjectiveData) => {
        addObjective(newObjective);
        closeModal();
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteObjective(itemToDelete.uuid!);
            setDeleteModalVisible(false);
        }
    };

    const cancelDelete = () => {
        setDeleteModalVisible(false);
    };

    const handleDelete = (objective: ExtendedObjectiveData) => {
        setItemToDelete(objective);
        setDeleteModalVisible(true);
    };

    const handleEditObjective = (objective: ExtendedObjectiveData) => {
        setSelectedObjective(objective);
        setIsModalVisible(true);
    };

    const handleUpdateObjective = (updatedObjective: ObjectiveData) => {
        addObjective(updatedObjective);
        setIsModalVisible(false);
        setSelectedObjective(null);
        refreshObjectives();
    };

    const getTitle = () => {
        const dateRegex = /^(\d{4})(?:-(?:(\d{2})|W(\d{1,2})|Q(\d)))?$/;
        const match = currentDate.match(dateRegex);
    
        if (match) {
            const [, year, month, week, quarter] = match;
            if (week) return '🎯 Weekly Objectives';
            if (month) return '🎯 Monthly Objectives';
            if (quarter) return '🎯 Quarterly Objectives';
            if (year) return '🎯 Yearly Objectives';
        }
    
        return 'Objectives';
    }

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.title}>{getTitle()}</Text>
                {objectives.map((objective: ExtendedObjectiveData) => (
                    <Pressable
                        key={objective.uuid}
                        style={styles.objectiveItem}
                        onPress={() => handleEditObjective(objective)}
                    >
                        <View key={objective.uuid} style={styles.objectiveItem}>
                            <Text style={styles.pillarEmoji}>{objective.pillarEmoji}</Text>
                            <Text style={[
                                styles.objectiveText,
                                objective.completed && styles.completedObjectiveText
                            ]}>
                                {objective.objective}
                            </Text>
                            <Pressable 
                                onPress={() => toggleObjectiveCompletion(objective.uuid!)} 
                                style={styles.completionToggle}
                            >
                                <FontAwesomeIcon 
                                    icon={objective.completed ? faCheckCircle : faCircle} 
                                    color={objective.completed ? themeColors.hoverColor : 'gray'} 
                                    size={20} 
                                /> 
                            </Pressable>
                            <View style={styles.actions}>
                                <Pressable 
                                    onPress={() => handleDelete(objective)} 
                                    style={styles.actionButton}
                                >
                                    <FontAwesomeIcon icon={faTrash} color={'gray'} size={20} />
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
                ))}
                <Pressable
                    onPress={() => setIsModalVisible(true)}
                    style={styles.addButton}
                >
                    <Text style={styles.addButtonText}>Add Objective</Text>
                </Pressable>
            </View>
            {deleteModalVisible && (
                <AlertModal
                    isVisible={deleteModalVisible}
                    title="Confirm Delete"
                    message="Are you sure you want to delete this item?"
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
            {isModalVisible && (
                <AddObjectivesModal
                    isVisible={isModalVisible}
                    pillars={pillars}
                    onClose={() => {
                        setIsModalVisible(false);
                        setSelectedObjective(null);
                    }}
                    onAdd={selectedObjective ? handleUpdateObjective : handleAddObjective}
                    objective={selectedObjective!}
                    currentDate={currentDate}
                />
            )}
        </>
    );
};

const getStyles = (themeColors: any) => StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: 'gray',
        alignSelf: 'center'
    },
    objectiveItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        padding: 12,
        backgroundColor: themeColors.backgroundSecondary,
        borderRadius: 8,
    },
    pillarEmoji: {
        fontSize: 18,
        marginRight: 12,
    },
    objectiveText: {
        flex: 1,
        fontSize: 16,
        color: themeColors.textColor,
    },
    completedObjectiveText: {
        // textDecorationLine: 'line-through',
        color: themeColors.greenOpacity,
    },
    completionToggle: {
        width: '10%',
        alignItems: 'center',
        // borderWidth: 1,
        // borderColor: 'gray',
        marginRight: '20%',
        padding: 5,
        zIndex: 100,
    },
    completionStatus: {
        fontSize: 18,
        marginLeft: 8,
    },
    actions: {
        // borderWidth: 1,
        // borderColor: 'green',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        marginLeft: 5,
    },
    fakeIcon: {
        width: 20,
        height: 20,
    },
    addButton: {
        padding: 15,
        borderWidth: 1,
        borderColor: themeColors.borderColor,
        borderRadius: 10,
        alignSelf: 'center',
        marginTop: 10,
    },
    addButtonText: {
        color: themeColors.textColor,
    },
});