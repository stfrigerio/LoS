import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle, faCircle, faTrash, faRotateRight } from '@fortawesome/free-solid-svg-icons';

import TaskModal from '../../modals/TaskModal';
import AlertModal from '@los/shared/src/components/modals/AlertModal';

import { handlePostponeTask } from '../helpers/postponeTask';
import { useThemeStyles } from '../../../styles/useThemeStyles';
import { TaskData } from '../../../types/Task';
import { PillarData } from '../../../types/Pillar';

interface TaskEntryProps {
    item: TaskData;
    pillar: PillarData | undefined;
    onUpdateTask: (task: TaskData) => void;
    deleteTask: (uuid: string) => void;
    refreshTasks: () => void;
}

const TaskEntry: React.FC<TaskEntryProps> = ({ 
    item, 
    pillar,
    onUpdateTask, 
    deleteTask,
    refreshTasks
}) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);

    const handleDelete = () => {
        setIsDeleteAlertVisible(true);
    };

    const handleEdit = () => {
        setIsEditModalVisible(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalVisible(false);
        refreshTasks();
    };

    const handleSaveTask = (updatedTask: TaskData) => {
        onUpdateTask(updatedTask);
        setIsEditModalVisible(false);
    };

    const handleToggleCompletion = () => {
        onUpdateTask({ ...item, completed: !item.completed });
    };
    
    return (
        <View style={styles.container}>
            {item.repeat === 'true' ?
                null
                :
                item.completed ?
                    <Pressable onPress={handleToggleCompletion} style={styles.completionToggle}>
                        <FontAwesomeIcon icon={faCheckCircle} color={themeColors.greenOpacity} size={20} /> 
                    </Pressable>
                    : 
                    <Pressable onPress={handleToggleCompletion} style={styles.completionToggle}>
                        <FontAwesomeIcon icon={faCircle} color={'gray'} size={20} />
                    </Pressable>
            }

            <Pressable onPress={handleEdit} style={styles.titleContainer}>
                <Text style={[styles.title, item.repeat === 'true' ? styles.title : item.completed && styles.completedText]} numberOfLines={2} ellipsizeMode="tail">{item.text}</Text>
            </Pressable>
            {pillar && (
                <View style={styles.pillarContainer}>
                    <Text style={styles.pillarText}>{pillar.emoji ? pillar.emoji : pillar.name}</Text>
                </View>
            )}
            {item.repeat === 'true' ?
                <Pressable onPress={handleEdit} style={styles.dueDateContainer}>
                    <Text style={[designs.text.text, {fontSize: 12}]}>{item.frequency}</Text>
                </Pressable>
                :
                <Pressable onPress={handleEdit} style={styles.dueDateContainer}>
                    <Text style={[styles.dueDate, item.completed && styles.completedText]} numberOfLines={2}>{new Date(item.due!).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                </Pressable>
            }
            <View style={styles.actions}>
                {item.repeat === 'true' ? 
                    <View style={styles.fakeIcon}/>
                    :
                    !item.completed ?
                        <Pressable onPress={() => handlePostponeTask({ item, onUpdateTask })} style={styles.actionButton}>
                            <FontAwesomeIcon icon={faRotateRight} color={'gray'} size={20} />
                        </Pressable>
                        :
                        <View style={styles.fakeIcon}/>
                }
                <Pressable onPress={handleDelete} style={styles.actionButton}>
                    <FontAwesomeIcon icon={faTrash} color={'gray'} size={20} />
                </Pressable>
            </View>
            {isEditModalVisible && (
                <TaskModal
                    isOpen={isEditModalVisible}
                    onClose={handleCloseEditModal}
                    onAddItem={handleSaveTask}
                    task={item}
                    onUpdateItem={handleSaveTask}
                />  
            )}
            {isDeleteAlertVisible && (
                <AlertModal
                    isVisible={isDeleteAlertVisible}
                    title="Delete Task"
                    message="Are you sure you want to delete this task?"
                    onCancel={() => setIsDeleteAlertVisible(false)}
                    onConfirm={() => {
                        deleteTask(item.uuid!);
                        setIsDeleteAlertVisible(false);
                    }}
                />
            )}
        </View>
    );
};

const getStyles = (themeColors: any, designs: any) => StyleSheet.create({
    container: {
        backgroundColor: themeColors.backgroundSecondary,
        borderRadius: 8,
        marginBottom: 10,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    titleContainer: {
        // flex: 1,
        width: '40%',
        marginRight: 5,
    },
    title: {
        ...designs.text.text,
        fontWeight: 'bold',
        fontSize: 13,
    },
    dueDate: {
        ...designs.text.text,
        fontSize: 12,
        marginRight: 10
        // borderWidth: 1,
        // borderColor: 'blue',
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
    completionToggle: {
        width: '10%',
        alignItems: 'center',
        // borderWidth: 1,
        // borderColor: 'gray',
        marginRight: 8,
        padding: 5,
        zIndex: 100,
    },
    dueDateContainer: {
        flex: 1,
        alignItems: 'center',
    },
    pillarContainer: {
        width: '10%',
        alignItems: 'center',
    },
    pillarText: {
        ...designs.text.text,
        fontSize: 12,
    },
    completedText: {
        color: 'gray',
        textDecorationLine: 'line-through',
    },
});

export default TaskEntry;