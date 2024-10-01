import { useState, useEffect, useRef, useCallback } from 'react';
import { format, differenceInSeconds } from 'date-fns';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { databaseManagers } from '../../../database/tables';
import { TimeData } from '@los/shared/src/types/Time';

export const useTimer = () => {
  const [timerRunning, setTimerRunning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const getCurrentTimerSecondsRef = useRef<() => number>(() => 0);
  const [tag, setTag] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const notificationIdRef = useRef<string | null>(null); // Ref to store the notification ID

  const startTimer = async (tag: string, description: string) => {
    setTimerRunning(true);
    setInitialSeconds(0);
    setTag(tag);
    setDescription(description);

    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const startTime = new Date().toISOString();

    databaseManagers.time.upsert({
      date: currentDate,
      tag: tag,
      description: description,
      startTime: startTime,
      endTime: null,
      duration: null,
    } as TimeData).then(() => {
      console.log('Time record added successfully');
    }).catch(console.error);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Timer Running`,
        body: `${tag} - ${description}`,
        autoDismiss: false,
        sticky: true, // This makes the notification ongoing
      },
      trigger: null,
    });
    
    notificationIdRef.current = notificationId; // Store the notification ID in-memory (for immediate access)
    await storeNotificationId(notificationId); // Also store the notification ID in AsyncStorage
  };

  const stopTimer = async () => {
    const activeTimer = await databaseManagers.time.getActiveTimer();
    if (!activeTimer || typeof activeTimer.id === 'undefined' || typeof activeTimer.startTime === 'undefined') {
      Alert.alert('Active timer data is missing');
      return;
    }
  
    const formatDuration = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const endTime = new Date().toISOString();
    const durationInSeconds = differenceInSeconds(new Date(endTime), new Date(activeTimer.startTime));
    const formattedDuration = formatDuration(durationInSeconds)

    const updatedTimer = {
      ...activeTimer,
      endTime: endTime,
      duration: formattedDuration,
    };
      
    // console.log('about to update timer with: ', updatedTimer);
    await databaseManagers.time.upsert(updatedTimer)
  
    setTimerRunning(false);
    setInitialSeconds(0);
    setTag(undefined);
    setDescription(undefined);

    if (notificationIdRef.current) {
      await Notifications.dismissNotificationAsync(notificationIdRef.current);
      notificationIdRef.current = null;
      await clearNotificationId(); // Clear the ID from AsyncStorage
    }
  };

  const fetchActiveTimer = useCallback(async () => {
    try {
      const activeTimerData = await databaseManagers.time.getActiveTimer();
      if (activeTimerData && activeTimerData.startTime) {
        const now = new Date();
        const startTime = new Date(activeTimerData.startTime);
        const elapsedSeconds = differenceInSeconds(now, startTime);
        setInitialSeconds(elapsedSeconds);
        setTimerRunning(true);
        setTag(activeTimerData.tag);
        setDescription(activeTimerData.description);
      } else {
        setTimerRunning(false);
        setInitialSeconds(0);
        setTag(undefined);
        setDescription(undefined);
      }
    } catch (error) {
      console.error('Error fetching active timer:', error);
    }
  }, []);

  const storeNotificationId = async (notificationId: string) => {
    try {
      await AsyncStorage.setItem('notificationId', notificationId);
    } catch (e: any) {
      Alert.alert('Failed to save notification ID', e.toString());
    }
  };

  const clearNotificationId = async () => {
    try {
      await AsyncStorage.removeItem('notificationId');
    } catch (e: any) {
      Alert.alert('Failed to clear notification ID', e.toString());
    }
  };
  
  const checkAndClearStuckNotification = async () => {
    try {
      const notificationId = await AsyncStorage.getItem('notificationId');
      if (notificationId !== null) {
        await Notifications.dismissNotificationAsync(notificationId);
        await clearNotificationId();
      }
    } catch (e: any) {
      Alert.alert('Error handling stuck notification', e.toString());
    }
  };

  useEffect(() => {
    fetchActiveTimer();
  }, [fetchActiveTimer]);

  return { timerRunning, initialSeconds, startTimer, stopTimer, getCurrentTimerSecondsRef, tag, description, fetchActiveTimer, checkAndClearStuckNotification };
};
