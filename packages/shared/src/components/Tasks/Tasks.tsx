import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import TaskModal from '@los/shared/src/components/modals/TaskModal'
import MobileNavbar from '@los/shared/src/sharedComponents/NavBar';
import TaskListScreen from './components/TasksList';
import ChecklistScreen from './components/Checklist';

import { useThemeStyles } from '../../styles/useThemeStyles';
import { useHomepage } from '@los/shared/src/components/Home/helpers/useHomepage';

import { TaskData } from '../../types/Task';

let useTasksData: any;
let CanvasScreen: any;
if (Platform.OS === 'web') {
    useTasksData = require('@los/desktop/src/components/Tasks/hooks/useTasksData').useTasksData;
    CanvasScreen = null;
} else {
    const { useTasksData: mobileUseTasksData } = require('@los/mobile/src/components/Tasks/hooks/useTasksData');
    useTasksData = mobileUseTasksData;
    CanvasScreen = require('@los/mobile/src/components/Tasks/components/TaskCanvas').default;
}

const TasksHub: React.FC = () => {
    const { theme, themeColors, designs } = useThemeStyles();
    const { openHomepage } = useHomepage();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeScreen, setActiveScreen] = useState<'tasklist' | 'checklist' | 'canvas'>('tasklist');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [screens, setScreens] = useState(['Task List', 'Checklist']);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    useEffect(() => {
        if (Platform.OS !== 'web') {
            setScreens(['Task List', 'Checklist', 'Canvas']);
        }
    }, []);

    const { 
        tasks, 
        addTask,
        updateTask,
        refreshTasks,
        deleteTask,
        pillars,
    } = useTasksData();

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    const handleUpdateTask = useCallback(async (newTask: TaskData) => {
        await updateTask(newTask);
        refreshTasks();
        setRefreshTrigger(prev => prev + 1);
        closeAddModal();
    }, [updateTask, refreshTasks, closeAddModal]);

    const handleAddTask = useCallback(async (newTask: TaskData) => {
        await addTask(newTask);
        refreshTasks();
        setRefreshTrigger(prev => prev + 1);
        closeAddModal();
    }, [addTask, refreshTasks, closeAddModal]);

    const checklistTasks = useMemo(() => {
        return tasks.filter((task: TaskData) => task.type && task.type.startsWith('checklist'));
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        const tasksWithoutChecklist = tasks.filter((task: TaskData) => task.type !== 'checklist');
        return tasksWithoutChecklist.filter((task: TaskData) => task.due);
    }, [tasks]);

    const renderContent = () => {
        switch (activeScreen) {
            case 'tasklist':
                return (
                    <TaskListScreen
                        tasks={filteredTasks}
                        updateTask={updateTask}
                        deleteTask={deleteTask}
                        refreshTasks={refreshTasks}
                        pillars={pillars}
                    />
                );
            case 'checklist':
                return (
                    <ChecklistScreen 
                        tasks={checklistTasks}
                        addTask={addTask}
                        updateTask={updateTask}
                        deleteTask={deleteTask}
                        refreshTasks={refreshTasks}
                    />
                );
            case 'canvas':
                return Platform.OS !== 'web' ? (
                    <CanvasScreen 
                        refreshTrigger={refreshTrigger}
                        addTask={addTask}
                        updateTask={updateTask}
                        deleteTask={deleteTask}
                        refreshTasks={refreshTasks}
                    />
                ) : null;
            default:
                return null;
        }
    };

    const navItems = useMemo(() => 
        screens.map((screen) => ({
            label: screen,
            onPress: () => setActiveScreen(screen.toLowerCase().replace(' ', '') as 'tasklist' | 'checklist' | 'canvas'),
        })),
        [screens]
    );

    return (
        <View style={styles.container}>
            {renderContent()}
            {isAddModalOpen && (
                <TaskModal
                    isOpen={isAddModalOpen}
                    onClose={closeAddModal}
                    onAddItem={handleAddTask}
                    onUpdateItem={handleUpdateTask}
                />
            )}  
            {isUpdateModalOpen && (
                <TaskModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    onAddItem={handleUpdateTask}
                    onUpdateItem={handleUpdateTask}
                />
            )}
            <MobileNavbar
                items={navItems}
                activeIndex={screens.findIndex(screen => screen.toLowerCase().replace(' ', '') === activeScreen)}
                title={activeScreen.charAt(0).toUpperCase() + activeScreen.slice(1)}
                onBackPress={openHomepage}
                quickButtonFunction={activeScreen === 'checklist' ? undefined : openAddModal}
                screen="tasks"
            />
        </View>
    );
};

const getStyles = (themeColors: any, designs: any) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: themeColors.backgroundColor,
            padding: 20,
            marginTop: isDesktop ? 0 : 37,
        },
        floatingButton: {
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: themeColors.hoverColor,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
        },
    });
};

export default TasksHub;