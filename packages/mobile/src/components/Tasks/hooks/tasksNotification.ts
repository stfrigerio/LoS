import * as Notifications from 'expo-notifications';
import { databaseManagers } from '../../../database/tables';
import { TaskData } from '@los/shared/src/types/Task';

export async function scheduleTaskNotification(task: TaskData) {
    if (!task.due || !task.text || !task.uuid) {
        return;
    }

    const notificationDate = new Date(task.due);
    notificationDate.setHours(notificationDate.getHours() - 1); // 1 hour before the task

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Task Reminder",
            body: `Your task "${task.text}" is due in 1 hour`,
            data: { taskUuid: task.uuid, screen: 'TaskDetails' },
        },
        trigger: notificationDate,
    });
}

export async function checkTasksDueToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await databaseManagers.tasks.listByDateRange(
        today.toISOString(),
        tomorrow.toISOString()
    );

    return tasks;
}

// integrity check for notifications and tasks
export async function syncNotificationsWithTasks(tasks: TaskData[]) {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Found ${scheduledNotifications.length} scheduled notifications`);

    const notificationMap = new Map<string, Notifications.NotificationRequest>();

    // Create a map of notifications, keeping only one per taskUuid
    for (const notification of scheduledNotifications) {
        const taskUuid = notification.content.data?.taskUuid;
        if (taskUuid) {
            if (!notificationMap.has(taskUuid)) {
                notificationMap.set(taskUuid, notification);
            } else {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            }
        } 
    }

    console.log(`After deduplication, ${notificationMap.size} tasks notifications remain`);

    for (const task of tasks) {
        if (!task.uuid || !task.due) {
            continue;
        }

        if (task.completed) {
            continue;
        }

        const existingNotification = notificationMap.get(task.uuid);
        const correctNotificationDate = new Date(task.due);
        correctNotificationDate.setHours(correctNotificationDate.getHours() - 1);

        if (existingNotification) {
            let notificationDate: Date | null = null;
            try {
                const trigger = existingNotification.trigger as any;
                
                if (trigger && typeof trigger.value === 'number') {
                    notificationDate = new Date(trigger.value); // The value is already in milliseconds
                } else {
                    console.log(`Invalid trigger or value for task ${task.text}. Trigger:`, trigger);
                }
            } catch (error) {
                console.log(`Error processing notification for task ${task.text}:`, error);
            }

            if (notificationDate && !isNaN(notificationDate.getTime())) {
                
                if (Math.abs(notificationDate.getTime() - correctNotificationDate.getTime()) > 60000) { // 1 minute tolerance
                    console.log(`Notification time mismatch. Expected: ${correctNotificationDate}, Actual: ${notificationDate}`);
                    console.log(`Cancelling and rescheduling notification for task ${task.uuid}`);
                    await Notifications.cancelScheduledNotificationAsync(existingNotification.identifier);
                    await scheduleTaskNotification(task);
                }
            } else {
                console.log(`Invalid notification date for task ${task.text}. Rescheduling.`);
                console.log(`Existing notification details:`, JSON.stringify(existingNotification, null, 2));
                await Notifications.cancelScheduledNotificationAsync(existingNotification.identifier);
                await scheduleTaskNotification(task);
            }
        } else {
            console.log(`No existing notification found for task ${task.text}. Scheduling new notification.`);
            await scheduleTaskNotification(task);
        }

        notificationMap.delete(task.uuid);
    }

    // Cancel any remaining notifications that don't correspond to current tasks
    for (const [taskUuid, notification] of notificationMap) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
}

export async function setNotificationsForDueTasks(tasks: TaskData[]) {
    for (const task of tasks) {
        await scheduleTaskNotification(task);
    }
}

export async function cancelTaskNotification(taskUuid: string) {
    try {
        // console.log(`Attempting to cancel notification for task ${taskUuid}`);
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        // console.log('All scheduled notifications:', JSON.stringify(scheduledNotifications, null, 2));

        const notificationToCancel = scheduledNotifications.find(
            notification => notification.content.data?.taskId === taskUuid
        );

        if (notificationToCancel) {
            // console.log(`Found notification to cancel:`, JSON.stringify(notificationToCancel, null, 2));
            await Notifications.cancelScheduledNotificationAsync(notificationToCancel.identifier);
            // console.log(`Notification for task ${taskUuid} cancelled successfully.`);
        } else {
            console.log(`No notification found for task ${taskUuid}.`);
        }

        // Double-check if the notification was actually cancelled
        const remainingNotifications = await Notifications.getAllScheduledNotificationsAsync();
        // console.log('Remaining notifications after cancellation:', JSON.stringify(remainingNotifications, null, 2));
    } catch (error) {
        console.error(`Error cancelling notification for task ${taskUuid}:`, error);
    }
}

export async function rescheduleTaskNotification(task: TaskData) {
    await cancelTaskNotification(task.uuid!);
    await scheduleTaskNotification(task);
}