import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, View, Text, StyleSheet, Platform } from 'react-native';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faChevronLeft, faChevronRight, faCalendarDay, faCalendarWeek } from '@fortawesome/free-solid-svg-icons';
import { parseISO, startOfDay,subDays, addDays } from 'date-fns';

import AlertModal from '@los/shared/src/components/modals/AlertModal';
import { UniversalModal } from '@los/shared/src/sharedComponents/UniversalModal';
import TaskModal from '../../modals/TaskModal';
import TaskView from './TaskView';

import { handlePostponeTask } from '../../Tasks/helpers/postponeTask';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { useHomepage } from '@los/shared/src/components/Home/helpers/useHomepage';

import { TaskData } from '@los/shared/src/types/Task';
import { ExtendedTaskData } from '@los/shared/src/types/Task';

let useTaskData
if (Platform.OS === 'web') {
    useTaskData = require('@los/desktop/src/components/Tasks/hooks/useTasksData').useTasksData
} else {
    useTaskData = require('@los/mobile/src/components/Tasks/hooks/useTasksData').useTasksData
}

interface TaskModalProps {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    initialDate: string;
    fetchDayItems: (date: string) => Promise<{
        checklistItems: ExtendedTaskData[];
        birthdayDetails: { isBirthday: boolean; name: string; age: number | null };
    }>;
    toggleItemCompletion: (id: number, completed: boolean) => Promise<void>;
    updateChecklistItems: () => Promise<void>;
}

const ViewTaskModal: React.FC<TaskModalProps> = ({
    showModal,
    setShowModal,
    initialDate,
    fetchDayItems,
    toggleItemCompletion,
    updateChecklistItems,
}) => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [showTaskModal, setShowTaskModal] = useState(false);

    const [currentDate, setCurrentDate] = useState(() => startOfDay(parseISO(initialDate)));
    const [checklistItems, setChecklistItems] = useState<ExtendedTaskData[]>([]);
    const [birthdayDetails, setBirthdayDetails] = useState({ isBirthday: false, name: "", age: null as number | null });
    const [selectedTask, setSelectedTask] = useState<ExtendedTaskData | null>(null);

    const { addTask, updateTask, deleteTask } = useTaskData();
    const { openNote } = useHomepage();

    const loadDayItems = useCallback(async (date: Date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const { checklistItems, birthdayDetails } = await fetchDayItems(formattedDate);
        setChecklistItems(checklistItems);
        setBirthdayDetails(birthdayDetails);
    }, [fetchDayItems]);
    
    useEffect(() => {
        loadDayItems(currentDate);
    }, [currentDate, loadDayItems]);

    const handleDeleteTask = (taskId: string) => {
        setTaskToDelete(taskId);
        setDeleteModalVisible(true);
    };

    const confirmDeleteTask = async () => {
        if (taskToDelete) {
            await deleteTask(taskToDelete);
            if (updateChecklistItems) {
                await updateChecklistItems();
            }
        }
        setDeleteModalVisible(false);
        setTaskToDelete(null);
    };

    const handleAddTask = async (item: TaskData) => {
        await addTask(item);
        if (updateChecklistItems) {
            await updateChecklistItems();
        }
        setShowTaskModal(false);
    };

    const handleUpdateTask = async (item: TaskData) => {
        await updateTask(item);
        if (updateChecklistItems) {
            await updateChecklistItems();
        }
        setShowTaskModal(false);
    };

    const navigateDay = useCallback((direction: 'prev' | 'next') => {
        const newDate = direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1);
        setCurrentDate(newDate);
    }, [currentDate]);

    useEffect(() => {
        if (updateChecklistItems) {
            updateChecklistItems();
        }
    }, [currentDate]);

    const formattedMonth = format(currentDate, 'MMMM');
    const formattedDate = format(currentDate, 'do, eeee');

    const handleLongPress = (item: ExtendedTaskData) => {
        setSelectedTask(item);
        setShowTaskModal(true);
    };

    const handlePostpone = async (task: ExtendedTaskData) => {
        handlePostponeTask({ item: task, onUpdateTask: updateTask });
        if (updateChecklistItems) {
            await updateChecklistItems();
        }
    };

    const handleGoToDay = () => {
        openNote('day', format(currentDate, 'yyyy-MM-dd'));
        setShowModal(false);
    };

    const handleGoToWeek = () => {
        openNote('week', currentDate.toISOString());
        setShowModal(false);
    };

    return (
        <>
            <UniversalModal
                isVisible={showModal}
                onClose={() => setShowModal(false)}
                modalViewStyle="taller"
            >
                <Text style={styles.modalTitle}>{formattedMonth}</Text>
                <View style={styles.dateNavigation}>
                    <Pressable onPress={() => navigateDay('prev')} style={styles.navButton}>
                        <FontAwesomeIcon icon={faChevronLeft} color={'gray'} size={18} />
                    </Pressable>
                    <Text style={styles.modalTitle}>{formattedDate}</Text>
                    <Pressable onPress={() => navigateDay('next')} style={styles.navButton}>
                        <FontAwesomeIcon icon={faChevronRight} color={'gray'} size={18} />
                    </Pressable>
                </View>
                {birthdayDetails.isBirthday && (
                    <>
                        <Text style={[styles.birthdayText, { alignSelf: 'center', marginBottom: 20 }]}>
                            {birthdayDetails.name} turns {birthdayDetails.age} today!
                        </Text>
                    </>
                )}
                    <View style={[styles.divider, { marginBottom: 0 }]} />
                        {checklistItems
                            .filter(item => !item.isBirthday)
                            .sort((a, b) => new Date(a.due || '').getTime() - new Date(b.due || '').getTime())
                            .map((item, index) => (
                                <TaskView
                                    key={index}
                                    item={item}
                                    toggleItemCompletion={toggleItemCompletion}
                                    onDelete={handleDeleteTask}
                                    isLast={index === checklistItems.length - 1}
                                    onLongPress={() => handleLongPress(item)}
                                    onPostpone={() => handlePostpone(item)}
                                />
                            ))
                        }
                    <View style={styles.divider}></View>

                <View style={styles.footerNavigation}>
                    <Pressable onPress={handleGoToDay} style={styles.footerButton}>
                        <FontAwesomeIcon icon={faCalendarDay} color={'gray'} size={20} />
                        <Text style={[designs.text.text, styles.footerButtonText]}>Go to Day</Text>
                    </Pressable>
                    <Pressable onPress={() => setShowTaskModal(true)} style={styles.footerButton}>
                        <FontAwesomeIcon icon={faPlus} color={'gray'} size={20} />
                        <Text style={[designs.text.text, styles.footerButtonText]}>Add Task</Text>
                    </Pressable>
                    <Pressable onPress={handleGoToWeek} style={styles.footerButton}>
                        <FontAwesomeIcon icon={faCalendarWeek} color={'gray'} size={20} />
                        <Text style={[designs.text.text, styles.footerButtonText]}>Go to Week</Text>
                    </Pressable>
                </View>
            </UniversalModal>
            {deleteModalVisible && (
                <AlertModal
                    isVisible={deleteModalVisible}
                    title="Delete Task"
                    message="Are you sure you want to delete this task?"
                    onConfirm={confirmDeleteTask}
                    onCancel={() => setDeleteModalVisible(false)}
                />
            )}
            {showTaskModal && (
                <TaskModal
                    isOpen={showTaskModal}
                    onClose={() => {
                        setShowTaskModal(false);
                        setSelectedTask(null);
                    }}
                    onUpdateItem={handleUpdateTask}
                    onAddItem={handleAddTask}
                    task={selectedTask || {
                        text: '',
                        due: new Date(currentDate).toISOString(),
                        completed: false,
                    }}
                />
            )}
        </>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    modalTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        color: theme.hoverColor,
        fontFamily: 'serif'
    },
    modalMonthTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        color: theme.hoverColor,
        fontFamily: 'serif'
    },
    birthdayText: {
        fontStyle: 'italic',
        color: theme.textColor,
        fontSize: 16,
        marginBottom: 10
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: theme.borderColor,
        marginBottom: 10
    },
    dateNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    navButton: {
        padding: 10,
    },
    footerNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
    },
    footerButton: {
        alignItems: 'center',
        padding: 10,
    },
    footerButtonText: {
        marginTop: 5,
        fontSize: 12,
        color: 'gray'
    },
});

export default ViewTaskModal;
