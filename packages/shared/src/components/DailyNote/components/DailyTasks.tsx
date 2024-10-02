import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash, faRotateRight } from '@fortawesome/free-solid-svg-icons';

import { handlePostponeTask } from '../../Tasks/helpers/postponeTask';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

import { TaskData } from '../../../types/Task';

let useTasksData: any;
if (Platform.OS === 'web') {
    useTasksData = require('@los/desktop/src/components/Tasks/hooks/useTasksData').useTasksData;
} else {
    const { useTasksData: mobileUseTasksData } = require('@los/mobile/src/components/Tasks/hooks/useTasksData');
    useTasksData = mobileUseTasksData;
}

interface DailyTasksProps {
    tasks: TaskData[];
    onToggleTaskCompletion: (uuid: string) => Promise<TaskData>;
    fetchDailyTasks: (date: Date) => Promise<TaskData[]>;
    currentDate: Date;
}

const DailyTasks: React.FC<DailyTasksProps> = ({ tasks, onToggleTaskCompletion, fetchDailyTasks, currentDate }) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors, designs);
    const [localTasks, setLocalTasks] = useState<TaskData[]>(tasks);

    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    const { deleteTask, updateTask } = useTasksData();

    const handleTaskPress = async (task: TaskData) => {
        try {
            setLocalTasks(prevTasks =>
                prevTasks.map(t =>
                    t.uuid === task.uuid ? { ...t, completed: !t.completed } : t
                )
            );
            await onToggleTaskCompletion(task.uuid!);
        } catch (error) {
            console.error('Error toggling task completion:', error);
            setLocalTasks(prevTasks =>
                prevTasks.map(t =>
                    t.uuid === task.uuid ? { ...t, completed: task.completed } : t
                )
            );
        }
    };

    const formatDateTimeDisplay = (isoString: string) => {
        const date = new Date(isoString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    const handleHandlePostponeTask = (task: TaskData) => {
        handlePostponeTask({ item: task, onUpdateTask: updateTask });
        fetchDailyTasks(currentDate);
    };

    if (!tasks || tasks.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎯 Tasks of Today</Text>
            <ScrollView>
                {localTasks.map((task, index) => (
                    <View key={task.uuid} style={styles.taskContainer}>
                        <Pressable onPress={() => handleTaskPress(task)} style={styles.contentContainer}>
                            <View style={[styles.circle, task.completed ? styles.completedCircle : null]} />
                            <View style={styles.dueHourContainer}>
                                <Text style={[task.completed ? styles.completedTaskText : designs.text.text, { fontSize: 12 }]}>
                                    {task.due
                                        ? formatDateTimeDisplay(task.due).split(' ')[1].split(':').slice(0, 2).join(':')
                                        : 'No due'
                                    }
                                </Text>
                            </View>
                            <View style={styles.separator} />
                            <View style={styles.textContainer}>
                                <Text style={[task.completed ? styles.completedTaskText : designs.text.text, { fontSize: 12 }]} numberOfLines={1} ellipsizeMode="tail">
                                    {task.text}
                                </Text>
                            </View>
                        </Pressable>
                        {!task.completed ? (
                                <Pressable onPress={() => handleHandlePostponeTask(task)} style={[styles.deleteIcon]}>
                                    <FontAwesomeIcon icon={faRotateRight} color={'gray'} size={15} />
                                </Pressable>
                            ) : (
                                <View style={[styles.deleteIcon, { marginRight: 15 }]} />
                            )
                        }
                        <Pressable onPress={() => deleteTask(task.uuid!)} style={styles.deleteIcon}>
                            <FontAwesomeIcon icon={faTrash} color={'gray'} size={15} />
                        </Pressable> 
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const getStyles = (theme: any, designs: any) => StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    title: {
        ...designs.text.title,
        marginTop: 10,
        marginBottom: 30,
        color: 'gray',
    },
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginBottom: 10,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        borderRadius: 5,
        paddingHorizontal: 30,
    },
    circle: {
        height: 12,
        width: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.borderColor,
    },
    completedCircle: {
        backgroundColor: theme.greenOpacity,
    },
    dueHourContainer: {
        width: '20%',
        alignItems: 'center',
        marginLeft: 5,
    },
    separator: {
        width: 1,
        height: 40,
        backgroundColor: theme.borderColor,
        marginHorizontal: 6,
    },
    textContainer: {
        flex: 1,
    },
    deleteIcon: {
        padding: 10,
    },
    completedTaskText: {
        color: 'gray',
        textDecorationLine: 'line-through',
    },
});

export default DailyTasks;