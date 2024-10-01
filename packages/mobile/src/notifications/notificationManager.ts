import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { databaseManagers } from '../database/tables';

export const updateNotificationState = async (): Promise<void> => {
    const setting = await databaseManagers.userSettings.getByKey('NotificationEnabled');
    const notificationsEnabled = setting?.value === 'true';

    if (notificationsEnabled) {
        // Enable notifications
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });

        // Reschedule notifications if they're not already scheduled
        if (!(await checkMorningRoutineReminderScheduled())) {
            await scheduleMorningRoutineReminder();
        }
        if (!(await checkMoodReminderScheduled('MoodReminder15'))) {
            await scheduleMoodReminder15();
        }
        if (!(await checkMoodReminderScheduled('MoodReminder19'))) {
            await scheduleMoodReminder19();
        }
    } else {
        // Disable notifications
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: false,
                shouldPlaySound: false,
                shouldSetBadge: false,
            }),
        });

        // Cancel all scheduled notifications
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
};

// This function requests permission and registers the device for push notifications.
export const registerForPushNotificationsAsync = async (): Promise<string | undefined> => {
    let token: string | undefined;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;

    // Extra setup for Android notifications
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return token;
};

// Schedules a notification for the next 11 AM to remind the user about their morning routine.
export const scheduleMorningRoutineReminder = async (): Promise<void> => {
    // Calculate the next 11 AM from now
    let trigger = new Date();
    trigger.setHours(11, 0, 0, 0); // Set to 11:00 AM today

    if (trigger < new Date()) {
        trigger.setDate(trigger.getDate() + 1); // If it's already past 11:00 AM, set for tomorrow
    }

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
        content: {
        title: "Morning Routine Reminder",
        body: "Rise and shine 🌞, or just rise… 🧟",
        data: { screen: 'DailyNote' }, // Custom data to determine action on notification interaction
        },
        trigger,
    });
};

export const scheduleMoodReminder15 = async (): Promise<void> => {
    const now = new Date();
    
    // Setting the notification for 15:00 today or the next day
    const todayAtThree = new Date(now);
    todayAtThree.setHours(15, 0, 0, 0);
    if (todayAtThree <= now) { // If it's already past 15:00, set for tomorrow
        todayAtThree.setDate(todayAtThree.getDate() + 1);
    }


    // Schedule notification for 15:00
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Mood Reminder",
            body: "Time for a Mood entry? ✨",
            data: { type: 'MoodReminder15' }
        },
        trigger: todayAtThree,
    });


};

export const scheduleMoodReminder19 = async (): Promise<void> => {
    const now = new Date();

    // Setting the notification for 19:00 today or the next day
    const todayAtSeven = new Date(now);
    todayAtSeven.setHours(19, 0, 0, 0);
    if (todayAtSeven <= now) { // If it's already past 19:00, set for tomorrow
        todayAtSeven.setDate(todayAtSeven.getDate() + 1);
    }


    // Schedule notification for 19:00
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Mood Reminder",
            body: "Time for a Mood entry? 🎆",
            data: { type: 'MoodReminder19' }
        },
        trigger: todayAtSeven,
    });
}

export const checkMorningRoutineReminderScheduled = async () => {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications.some(notification => notification.content.data.screen === 'DailyNote');
};

export const checkMoodReminderScheduled = async (reminderType: any) => {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications.some(notification => notification.content.data?.type === reminderType);
};

export const setGlobalNotificationHandler = async (): Promise<void> => {
    await updateNotificationState();
};

// Sets up a listener for notification responses. You might also call this in your app's entry point.
export const setupNotificationResponseListener = (handleNotificationResponse: (response: Notifications.NotificationResponse) => void): void => {
    Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
};