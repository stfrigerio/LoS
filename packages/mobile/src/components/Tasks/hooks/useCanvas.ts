// useCanvas.ts
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { databaseManagers } from '@los/mobile/src/database/tables';
import { ExtendedTaskData } from '@los/shared/src/types/Task';
import { DayLayout } from '../components/TaskCanvas';

export const useTaskManagement = (
    refreshTrigger: number,
    updateTask: (task: ExtendedTaskData) => Promise<void>,
    deleteTask: (taskId: string) => Promise<void>,
    refreshTasks: () => Promise<void>
) => {
    const [tasks, setTasks] = useState<ExtendedTaskData[]>([]);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const dayLayoutsRef = useRef<DayLayout[]>([]);

    useEffect(() => {
        fetchTasksWithoutDueDates();
    }, [refreshTrigger]);

    const fetchTasksWithoutDueDates = async () => {
        try {
            const allTasks = await databaseManagers.tasks.list();
            const filteredTasks = allTasks.filter((task: ExtendedTaskData) => 
                !task.due && !task.type?.startsWith('checklist')
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
        console.log(`Drop coordinates: x=${x}, y=${y}`); // Debugging log
        const buffer = 15; // Increased buffer to 15 pixels
        const droppedDay = dayLayoutsRef.current.find(day => {
            return (
                x >= (day.layout.x - buffer) && 
                x <= (day.layout.x + day.layout.width + buffer) &&
                y >= (day.layout.y - buffer) && 
                y <= (day.layout.y + day.layout.height + buffer)
            );
        });

        if (droppedDay) {
            console.log(`Dropped on day: ${droppedDay.date}`); // Debugging log
            const task = tasks.find(t => t.uuid === taskUuid);
            if (task) {
                const newTask = {
                    ...task,
                    due: new Date(droppedDay.date).toISOString(),
                };

                await updateTask(newTask);
                await refreshTasks();
                
                // Remove the task from the local state
                setTasks(prevTasks => prevTasks.filter(t => t.uuid !== taskUuid));
            } else {
                console.log('Task not found:', taskUuid);
            }
        } else {
            console.log('Task not dropped on a valid day');
            alert("You haven't dropped it on a day."); // Provide user feedback
        }
    }, [tasks, updateTask, refreshTasks]);

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

    const updateDayLayouts = (layouts: DayLayout[]) => {
        dayLayoutsRef.current = layouts;
        // console.log('Updated day layouts:', layouts); // Debugging log
    };

    return {
        tasks,
        tasksWithFakes,
        handleDeleteTask,
        confirmDeleteTask,
        handleDragEnd,
        deleteModalVisible,
        setDeleteModalVisible,
        updateDayLayouts,
        dayLayoutsRef
    };
};
