import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { BASE_URL } from '@los/shared/src/utilities/constants';

import { TaskData } from '@los/shared/src/types/Task';
import { PillarData } from '@los/shared/src/types/Pillar';
import { ObjectiveData } from '@los/shared/src/types/Objective';

export const useTasksData = () => {
    const [tasks, setTasks] = useState<TaskData[]>([]);
    const [pillars, setPillars] = useState<PillarData[]>([]);
    const [objectives, setObjectives] = useState<ObjectiveData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get<TaskData[]>(`${BASE_URL}/tasks/list`);
            setTasks(response.data);
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
            const response = await axios.get<PillarData[]>(`${BASE_URL}/pillars/list`);
            setPillars(response.data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while fetching pillars'));
        }
    }, []);

    const fetchObjectives = useCallback(async () => {
        try {
            const response = await axios.get<ObjectiveData[]>(`${BASE_URL}/objectives/uncompleted`);
            setObjectives(response.data);
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
            const response = await axios.post<TaskData>(`${BASE_URL}/tasks/upsert`, newTask);
            setTasks(prevTasks => [...prevTasks, response.data]);
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while adding a task'));
            throw err;
        }
    }, []);

    const updateTask = useCallback(async (updatedTask: TaskData) => {
        try {
            const response = await axios.post<TaskData>(`${BASE_URL}/tasks/upsert`, updatedTask);
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === updatedTask.id ? response.data : task
                )
            );
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while updating a task'));
            throw err;
        }
    }, []);

    const deleteTask = useCallback(async (uuid: string) => {
        try {
            await axios.delete(`${BASE_URL}/tasks/remove/${uuid}`);
            setTasks(prevTasks => prevTasks.filter(task => task.uuid !== uuid));
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while deleting a task'));
            throw err;
        }
    }, []);

    const getTasksByDateRange = useCallback(async (startDate: string, endDate: string) => {
        try {
            const response = await axios.get<TaskData[]>(`${BASE_URL}/tasks/range`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while fetching tasks by date range'));
            throw err;
        }
    }, []);

    const getNextTask = useCallback(async () => {
        try {
            const response = await axios.get<TaskData>(`${BASE_URL}/tasks/next`);
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while fetching the next task'));
            throw err;
        }
    }, []);

    const getTasksDueOnDate = useCallback(async (date: Date) => {
        try {
            const response = await axios.get<TaskData[]>(`${BASE_URL}/tasks/due`, {
                params: { date: date.toISOString() }
            });
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while fetching tasks due on date'));
            throw err;
        }
    }, []);

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
        uncompletedObjectives: objectives
    };
};