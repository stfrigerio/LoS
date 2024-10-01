import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, GestureResponderEvent } from 'react-native';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, runOnJS, interpolate } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import AlertModal from '@los/shared/src/components/modals/AlertModal';
import CustomCalendar from './DraggableCalendar';

import { databaseManagers } from '@los/mobile/src/database/tables';
import { DrawerStateManager } from '@los/mobile/src/components/Contexts/DrawerState';

import { ExtendedTaskData } from '@los/shared/src/types/Task';

interface DayLayout {
    date: string;
    layout: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

interface CanvasScreenProps {
    refreshTrigger: number;
    addTask: (task: any) => Promise<void>;
    updateTask: (task: any) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    refreshTasks: () => Promise<void>;
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
    const [tasks, setTasks] = useState<ExtendedTaskData[]>([]);
    const calendarRef = useRef<View>(null);
    const calendarContainerRef = useRef<View>(null);
    const dayLayoutsRef = useRef<DayLayout[]>([]);
    const isDragging = useSharedValue(0);
    const [calendarKey, setCalendarKey] = useState(0);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (DrawerStateManager) {
            DrawerStateManager.disableAllSwipeInteractions();
        }
    
        // Cleanup function to re-enable swipe interactions when component unmounts
        return () => {
            if (DrawerStateManager) {
                DrawerStateManager.enableAllSwipeInteractions();
            }
        };
    }, []); 

    useEffect(() => {
        fetchTasksWithoutDueDates();
    }, [refreshTrigger]);

    const fetchTasksWithoutDueDates = async () => {
        try {
            const allTasks = await databaseManagers.tasks.list();
            const filteredTasks = allTasks.filter((task: ExtendedTaskData) => 
                !task.due && task.type !== 'checklist'
            );
            setTasks(filteredTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleDeleteTask = (taskId: string) => {
        setTaskToDelete(taskId);
        setDeleteModalVisible(true);
    };

    const confirmDeleteTask = async () => {
        if (taskToDelete) {
            await deleteTask(taskToDelete);
            await refreshTasks();
            setTasks(prevTasks => prevTasks.filter(t => t.uuid !== taskToDelete));
        }
        setDeleteModalVisible(false);
        setTaskToDelete(null);
    };
    
    const handleDragEnd = useCallback(async (taskUuid: string, x: number, y: number) => {
        calendarContainerRef.current?.measure(async (fx, fy, width, height, px, py) => {
            const calendarX = px;
            const calendarY = py;
        
            const adjustedX = x - calendarX;
            const adjustedY = y - calendarY;
        
            const rowHeight = height / 7;
            const offsetAdjustedY = adjustedY - rowHeight;

            const droppedDay = dayLayoutsRef.current.find(day => {
                const isDropped = 
                    adjustedX >= day.layout.x && 
                    adjustedX < day.layout.x + day.layout.width &&
                    offsetAdjustedY >= day.layout.y && 
                    offsetAdjustedY < day.layout.y + day.layout.height;
                
                return isDropped;
            });
        
            if (droppedDay) {
                const task = tasks.find(t => t.uuid === taskUuid);
                if (task) {
                    const newTask = {
                        ...task,
                        due: new Date(droppedDay.date).toISOString(),
                    };

                    await updateTask(newTask);
                    await refreshTasks();
                    setCalendarKey(prev => prev + 1); // Force a re-render of the calendar
                    
                    // Remove the task from the local state
                    setTasks(prevTasks => prevTasks.filter(t => t.uuid !== taskUuid));
                } else {
                    console.log('Task not found:', taskUuid);
                }
            } else {
                console.log('Task not dropped on a valid day');
            }
        });
    }, [tasks, updateTask, refreshTasks]);

    // if we have only one column, we need fake tasks to maintain the layout of two columns when dragging
    const tasksWithFakes = useMemo(() => {
        const fakeTask = (id: number): ExtendedTaskData => ({ 
            uuid: `fake-${id}`, 
            text: '', 
            type: 'task', 
            completed: false 
        });
        
        if (tasks.length < 4) {
            return [
                ...tasks, 
                ...Array(4 - tasks.length).fill(null).map((_, index) => fakeTask(index))
            ];
        }
        return tasks;
    }, [tasks]);

    const DraggableTask = ({ task }: { task: ExtendedTaskData }) => {
        if (task.uuid!.startsWith('fake-')) return null;

        const translateX = useSharedValue(0);
        const translateY = useSharedValue(0);
        const scale = useSharedValue(1);

        const handleDeletePress = (event: GestureResponderEvent) => {
            event.stopPropagation();
            handleDeleteTask(task.uuid!);
        };

        const panGesture = useAnimatedGestureHandler({
            onStart: (_, ctx: any) => {
                ctx.startX = translateX.value;
                ctx.startY = translateY.value;
                scale.value = 1.1; // Slightly enlarge the task when dragging starts
                isDragging.value = 1;
            },
            onActive: (event, ctx: any) => {
                translateX.value = ctx.startX + event.translationX;
                translateY.value = ctx.startY + event.translationY;
            },
            onEnd: (event) => {
                runOnJS(handleDragEnd)(task.uuid!, event.absoluteX, event.absoluteY);
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                scale.value = withSpring(1);
                isDragging.value = 0;
            },
        });
    
        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
            ],
        }));
    
        return (
            <View style={styles.taskWrapper}>
                <PanGestureHandler onGestureEvent={panGesture}>
                    <Animated.View style={[styles.taskItem, animatedStyle]}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.taskText}>{task.text}</Text>
                    </Animated.View>
                </PanGestureHandler>
                <Pressable onPress={handleDeletePress} style={styles.deleteIcon}>
                    <FontAwesomeIcon icon={faTrash} color={themeColors.textColor} size={14} />
                </Pressable>
            </View>
        );
    };

    const handleDayLayoutsUpdate = useCallback((layouts: DayLayout[]) => {
        dayLayoutsRef.current = layouts;
    }, []);

    const TaskColumn = ({ tasks }: { tasks: ExtendedTaskData[] }) => (
        <View style={styles.taskColumn}>
            {tasks.map((task) => (
                <DraggableTask key={task.uuid} task={task} />
            ))}
        </View>
    );

    // Split tasks into pairs
    const taskPairs = tasksWithFakes.reduce<ExtendedTaskData[][]>((result, item, index) => {
        if (index % 3 === 0) {
            result.push([item]);
        } else {
            result[result.length - 1].push(item);
        }
        return result;
    }, []);
    
    const animatedScrollViewStyle = useAnimatedStyle(() => {
        return {
            zIndex: interpolate(isDragging.value, [0, 1], [0, 1000]),
        };
    });

    const handleCalendarRefresh = useCallback(() => {
        refreshTasks();
    }, []);

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
                            <TaskColumn key={index} tasks={pair} />
                        ))}
                    </Animated.ScrollView>
                    <View style={styles.calendarContainer} ref={calendarContainerRef}>
                        <CustomCalendar 
                            key={calendarKey}
                            ref={calendarRef}
                            onLayoutUpdate={handleDayLayoutsUpdate}
                            onRefresh={handleCalendarRefresh}
                            height={300}
                        />
                    </View>
                </View>
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
            // borderWidth: 1,
            // borderColor: 'blue',
            position: 'relative',
        },
        tasksScrollContainer: {
            flex: 1,
            // borderWidth: 1,
            // borderColor: 'red',
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
            // borderWidth: 1,
            // borderColor: 'yellow',
            backgroundColor: themeColors.backgroundColor,
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