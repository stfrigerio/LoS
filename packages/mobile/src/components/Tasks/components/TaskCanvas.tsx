// TaskCanvas.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import Animated, { useAnimatedStyle, useSharedValue, interpolate } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AlertModal from '@los/shared/src/components/modals/AlertModal';
import CustomCalendar from './DraggableCalendar';
import { DraggableTask } from './DraggableTask';
import { TaskColumn } from './TaskColumn';
import DebugOverlay from './DebugOverlay'; // Ensure correct import
import { DrawerStateManager } from '@los/mobile/src/components/Contexts/DrawerState';
import { useTaskManagement } from '../hooks/useCanvas';

import { ExtendedTaskData } from '@los/shared/src/types/Task';

interface CanvasScreenProps {
    refreshTrigger: number;
    addTask: (task: ExtendedTaskData) => Promise<void>;
    updateTask: (task: ExtendedTaskData) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    refreshTasks: () => Promise<void>;
}

export interface DayLayout {
    date: string;
    layout: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

const TaskCanvas: React.FC<CanvasScreenProps> = ({ 
    refreshTrigger, 
    addTask, 
    updateTask, 
    deleteTask, 
    refreshTasks 
}) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);
    const {
        tasks,
        tasksWithFakes,
        handleDeleteTask,
        confirmDeleteTask,
        handleDragEnd,
        deleteModalVisible,
        setDeleteModalVisible,
        updateDayLayouts,
        dayLayoutsRef
    } = useTaskManagement(refreshTrigger, updateTask, deleteTask, refreshTasks);

    const isDragging = useSharedValue(0);

    const animatedScrollViewStyle = useAnimatedStyle(() => ({
        zIndex: interpolate(isDragging.value, [0, 1], [0, 1000]),
    }));

    // Split tasks into groups of 3
    const taskPairs = tasksWithFakes.reduce<ExtendedTaskData[][]>((result, item, index) => {
        if (index % 3 === 0) result.push([item]);
        else result[result.length - 1].push(item);
        return result;
    }, []);

    const handleDayLayoutsUpdate = (layouts: DayLayout[]) => {
        updateDayLayouts(layouts);
    };

    const handleDragStart = () => {
        isDragging.value = 1;
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.canvasContainer}>
                <View style={styles.contentContainer}>
                    <View style={styles.taskContainer} />
                    <Animated.ScrollView 
                        style={[styles.tasksScrollContainer, animatedScrollViewStyle]} 
                        contentContainerStyle={styles.tasksContentContainer} 
                        horizontal={true}
                    >
                        {taskPairs.map((pair, index) => (
                            <TaskColumn key={index} tasks={pair}>
                                {(task) => (
                                    <DraggableTask
                                        key={task.uuid}
                                        task={task}
                                        onDeletePress={() => handleDeleteTask(task.uuid!)}
                                        onDragStart={handleDragStart} // New prop
                                        onDragEnd={(x, y) => handleDragEnd(task.uuid!, x, y)}
                                        isDragging={isDragging}
                                        themeColors={themeColors}
                                        styles={styles}
                                    />
                                )}
                            </TaskColumn>
                        ))}
                    </Animated.ScrollView>
                    <View style={styles.calendarContainer}>
                        <CustomCalendar 
                            updateDayLayouts={handleDayLayoutsUpdate}
                        />
                    </View>
                </View>
                <DebugOverlay dayLayouts={dayLayoutsRef.current} />
            </View>
            <AlertModal
                isVisible={deleteModalVisible}
                title="Delete Task"
                message="Are you sure you want to delete this task?"
                onConfirm={confirmDeleteTask}
                onCancel={() => setDeleteModalVisible(false)}
            />
        </GestureHandlerRootView>                 
    );
};

const getStyles = (themeColors: any, designs: any) => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const calendarHeight = screenHeight * 0.5; // Adjust this value as needed

    return StyleSheet.create({
        container: {
            flex: 1,
        },
        canvasContainer: {
            flex: 1,
            padding: 20,
        },
        contentContainer: {
            flex: 1,
            position: 'relative',
        },
        tasksScrollContainer: {
            flex: 1,
        },
        tasksContentContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingBottom: calendarHeight, // Make space for the calendar
        },
        taskContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            borderWidth: 1,
            borderColor: themeColors.borderColor,
            borderRadius: 10,
            flexDirection: 'row',
            height: '36%',
        },
        calendarContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: calendarHeight,
            zIndex: 10, // Ensure it's on top
        },
        taskColumn: {
            width: screenWidth * 0.34, // Adjust this value as needed
            marginHorizontal: 5,
        },
        taskWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 5,
        },
        taskItem: {
            flex: 1,
            backgroundColor: themeColors.backgroundSecondary,
            padding: 10,
            borderRadius: 5,
            height: 40,
            justifyContent: 'center',
        },
        taskText: {
            ...designs.text.body,
            color: themeColors.textColor,
            fontSize: 12,
        },
        deleteIcon: {
            padding: 10,
            marginLeft: 5,
        },
    });
};

export default TaskCanvas;
