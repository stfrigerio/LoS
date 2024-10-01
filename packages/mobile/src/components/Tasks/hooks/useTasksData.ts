import { useState, useEffect, useCallback } from 'react';

import { databaseManagers } from '../../../database/tables';
import { useChecklist } from '../../Contexts/checklistContext';
import { scheduleTaskNotification, cancelTaskNotification, rescheduleTaskNotification } from '../hooks/tasksNotification';

import { TaskData } from '@los/shared/src/types/Task';
import { PillarData } from '@los/shared/src/types/Pillar';
import { ObjectiveData } from '@los/shared/src/types/Objective';

export type UseTaskDataType = {
    tasks: TaskData[];
    isLoading: boolean;
    error: Error | null;
    addTask: (newTask: Omit<TaskData, 'id' | 'uuid'>) => Promise<TaskData>;
    updateTask: (updatedTask: TaskData) => Promise<TaskData>;
    deleteTask: (uuid: string) => Promise<void>;
    getTasksByDateRange: (startDate: string, endDate: string) => Promise<TaskData[]>;
    getNextTask: () => Promise<{ item: TaskData | null; timeLeft: string | null }>;
    getTasksDueOnDate: (date: Date) => Promise<TaskData[]>;
    refreshTasks: () => Promise<void>;
    pillars: PillarData[];
    uncompletedObjectives: ObjectiveData[];
    toggleTaskCompletion: (taskUuid: string) => Promise<TaskData>;
};

export const useTasksData = (): UseTaskDataType => {
    const [tasks, setTasks] = useState<TaskData[]>([]);
    const [pillars, setPillars] = useState<PillarData[]>([]);
    const [objectives, setObjectives] = useState<ObjectiveData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { updateChecklist } = useChecklist();

    const fetchTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            const fetchedTasks = await databaseManagers.tasks.list();
            setTasks(fetchedTasks);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while fetching tasks'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const fetchPillars = useCallback(async () => {
        try {
            const fetchedPillars = await databaseManagers.pillars.list();
            setPillars(fetchedPillars);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while fetching pillars'));
        }
    }, []);

    const fetchObjectives = useCallback(async () => {
        try {
            const fetchedObjectives = await databaseManagers.objectives.getUncompletedObjectives();
            setObjectives(fetchedObjectives);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while fetching objectives'));
        }
    }, []);

    useEffect(() => {
        fetchPillars();
        fetchObjectives();
    }, [fetchPillars, fetchObjectives]);

    const addTask = useCallback(async (newTask: Omit<TaskData, 'id' | 'uuid'>) => {
        try {
            const addedTask = await databaseManagers.tasks.upsert(newTask as TaskData);
            await fetchTasks();
            return addedTask;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while adding a task'));
            throw err;
        }
    }, [fetchTasks]);

    const updateTask = useCallback(async (updatedTask: TaskData) => {
        try {
            const updated = await databaseManagers.tasks.upsert(updatedTask);
            if (updated.due) {
                await rescheduleTaskNotification(updated);
            } else {
                await cancelTaskNotification(updated.uuid!);
            }
            await fetchTasks();
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while updating a task'));
            throw err;
        }
    }, [fetchTasks]);

    const deleteTask = useCallback(async (uuid: string) => {
        try {
            await cancelTaskNotification(uuid);
            await databaseManagers.tasks.removeByUuid(uuid);
            await fetchTasks();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while deleting a task'));
            throw err;
        }
    }, [fetchTasks]);

    const getTasksByDateRange = useCallback(async (startDate: string, endDate: string) => {
        try {
            return await databaseManagers.tasks.listByDateRange(startDate, endDate);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while fetching tasks by date range'));
            throw err;
        }
    }, []);

    const getNextTask = useCallback(async () => {
        try {
            return await databaseManagers.tasks.getNextTask();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while fetching the next task'));
            throw err;
        }
    }, []);

    const getTasksDueOnDate = useCallback(async (date: Date) => {
        try {
            return await databaseManagers.tasks.getTasksDueOnDate(date);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while fetching tasks due on date'));
            throw err;
        }
    }, []);

    const toggleTaskCompletion = useCallback(async (taskUuid: string) => {
        try {
            const task = await databaseManagers.tasks.getByUuid(taskUuid);
            if (!task) {
                throw new Error('Task not found');
            }

            const updatedTask = { ...task, completed: !task.completed };

            if (updatedTask.completed) {
                // Task is being marked as completed
                await cancelTaskNotification(taskUuid);
                console.log(`Notification cancelled for completed task ${taskUuid}`);
            } else if (!updatedTask.completed && updatedTask.due) {
                // Task is being marked as incomplete and has a due date
                const dueDate = new Date(updatedTask.due);
                if (dueDate > new Date()) {
                    // Due date is in the future
                    await scheduleTaskNotification(updatedTask);
                    console.log(`Notification rescheduled for incomplete task ${taskUuid}`);
                }
            }

            const updated = await databaseManagers.tasks.upsert(updatedTask);
            await fetchTasks();
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while toggling task completion'));
            throw err;
        }
    }, [fetchTasks]);

    return {
        tasks,
        isLoading,
        error,
        addTask,
        updateTask,
        deleteTask,
        getTasksByDateRange,
        getNextTask,
        getTasksDueOnDate,
        refreshTasks: fetchTasks,
        pillars,
        uncompletedObjectives: objectives,
        toggleTaskCompletion,
    };
};