import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import * as Notifications from 'expo-notifications';
import { databaseManagers } from '../../../database/tables';

// Functions
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

const NotificationManager: React.FC = () => {
    const [scheduledNotifications, setScheduledNotifications] = useState<Notifications.NotificationRequest[]>([]);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [settingId, setSettingId] = useState<string | null>(null);
    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    useEffect(() => {
        fetchNotificationSetting();
        fetchScheduledNotifications();
    }, []);

    const fetchNotificationSetting = async () => {
        const setting = await databaseManagers.userSettings.getByKey('NotificationEnabled');
        if (setting) {
            setNotificationsEnabled(setting.value === 'true');
            setSettingId(setting.uuid!);
        } else {
            const newSetting = {
                uuid: undefined,
                settingKey: 'NotificationEnabled',
                value: 'true',
                type: 'appSettings',
            }

            const setting = await databaseManagers.userSettings.upsert(newSetting);
            setSettingId(setting.uuid!);
        }
    };

    const fetchScheduledNotifications = async () => {
        const notifications = await Notifications.getAllScheduledNotificationsAsync();
        setScheduledNotifications(notifications);
    };

    const clearAllNotifications = async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
        setScheduledNotifications([]);  // Clear the local state
    };

    const toggleNotifications = async (value: boolean) => {
        setNotificationsEnabled(value);
        if (settingId) {
            const newSetting = {
                uuid: settingId,
                settingKey: 'NotificationEnabled',
                value: value.toString(),
                type: 'appSettings',
            };
    
            await databaseManagers.userSettings.upsert(newSetting);
        }
    };
    
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Scheduled Notifications</Text>
            <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>Enable Notifications</Text>
                <Switch
                    value={notificationsEnabled}
                    onValueChange={toggleNotifications}
                    trackColor={{ false: themeColors.backgroundSecondary, true: themeColors.backgroundSecondary }}
                    thumbColor={notificationsEnabled ? themeColors.hoverColor : themeColors.backgroundColor}
                />
            </View>
            <Pressable style={designs.button.marzoPrimary} onPress={clearAllNotifications}>
                <Text style={designs.button.buttonText}>Clear All</Text>
            </Pressable>
            {scheduledNotifications.map((notificationRequest, index) => (
            <View key={index} style={styles.notification}>
                <Text style={styles.notificationTitle}>{notificationRequest.content.title}</Text>
                <Text style={styles.text}>Body: {notificationRequest.content.body}</Text>
                <Text style={styles.text}>ID: {notificationRequest.identifier}</Text>
                {notificationRequest.content.data && (
                    <Text style={styles.text}>Data: {JSON.stringify(notificationRequest.content.data)}</Text>
                )}
                {notificationRequest.trigger && (
                    <Text style={styles.text}>Trigger: {typeof notificationRequest.trigger === 'object' ? JSON.stringify(notificationRequest.trigger) : notificationRequest.trigger}</Text>
                )}
            </View>
            ))}
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: theme.textColor
    },
    notification: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: 'transparent',
        borderRadius: 5,
        borderWidth: 1,
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.textColor,
        marginBottom: 10
    },
    text: {
        color: theme.textColor,
        marginBottom: 5
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    toggleText: {
        fontSize: 18,
        color: theme.textColor,
    },
});

export default NotificationManager;
