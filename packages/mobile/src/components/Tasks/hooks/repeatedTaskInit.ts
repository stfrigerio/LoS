import { calculateNextOccurrence } from "./frequencyCalculator";
import { databaseManagers } from "../../../database/tables";
import { setHours, setMinutes, setSeconds, setMilliseconds, startOfDay, endOfDay } from 'date-fns';

const checkAndAddRepeatingTasks = async (updateChecklist: () => void) => {
    try {
        const repeatingTasks = await databaseManagers.tasks.getRepeatingTasks();
        // console.log('Number of repeating tasks:', repeatingTasks.length);
        let tasksAdded = false;

        for (const task of repeatingTasks) {
            const repeatedTasks = await databaseManagers.tasks.getRepeatedTaskByText(task.text);
            let nextOccurrence: Date;

            const now = new Date();
            if (repeatedTasks.length === 0) {
                const defaultDue = setMilliseconds(setSeconds(setMinutes(setHours(now, 14), 30), 0), 0);
                const due = task.due ? new Date(task.due) : defaultDue;
                nextOccurrence = calculateNextOccurrence(due, task.frequency!);
            } else {
                const sortedRepeatedTasks = repeatedTasks.sort((a, b) => new Date(b.due!).getTime() - new Date(a.due!).getTime());
                const mostRecentTask = sortedRepeatedTasks[0];
                const mostRecentDue = new Date(mostRecentTask.due!);
                nextOccurrence = calculateNextOccurrence(mostRecentDue, task.frequency!);
            }

            // Ensure the next occurrence is always in the future
            while (nextOccurrence <= now) {
                nextOccurrence = calculateNextOccurrence(nextOccurrence, task.frequency!);
            }

            const startOfNextOccurrence = startOfDay(nextOccurrence);
            const endOfNextOccurrence = endOfDay(nextOccurrence);
            const existingTasksOnNextOccurrence = await databaseManagers.tasks.listByDateRange(
                startOfNextOccurrence.toISOString(),
                endOfNextOccurrence.toISOString()
            );

            const taskAlreadyExists = existingTasksOnNextOccurrence.some(
                t => t.text.trim() === task.text.trim() && t.type === 'repeatedTask'
            );

            if (!taskAlreadyExists) {
                const newTask = {
                    ...task,
                    due: nextOccurrence.toISOString(),
                    repeat: false,
                    frequency: null,
                    id: undefined,
                    uuid: undefined,
                    type: 'repeatedTask',
                    completed: false // Ensure the new task is not completed
                };
                await databaseManagers.tasks.upsert(newTask);
                console.log('New repeated task added for', nextOccurrence.toISOString());
                tasksAdded = true;
            }
        }

        if (tasksAdded) {
            updateChecklist();
        }

        console.log('Finished checking and adding repeating tasks');
    } catch (err) {
        console.error(err);
    }
}

export default checkAndAddRepeatingTasks;