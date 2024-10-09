// Libraries
import React, { useEffect, useCallback } from 'react';
import 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { format } from 'date-fns';
import { Audio } from 'expo-av';

// Components
import LeftPanel from '@los/mobile/src/components/LeftPanel/LeftPanel'
import RightPanel from '@los/mobile/src/components/RightPanel/RightPanel';

// Contexts
import { ChecklistProvider, useChecklist } from './src/components/Contexts/checklistContext';
import { DrawerStateProvider, useDrawerState, DrawerStateManager } from './src/components/Contexts/DrawerState'
import { NavbarDrawerProvider } from '@los/shared/src/components/Contexts/NavbarContext';
import { MusicPlayerProvider } from './src/components/Music/contexts/MusicPlayerContext';

// Functions'
import { useTheme, ThemeProvider } from '../shared/src/styles/ThemeContext';
import { lightNavigationTheme, darkNavigationTheme } from '../shared/src/styles/theme';
import { InitializeDatabasesWrapper } from './src/database/databaseInitializer';
import checkAndAddRepeatingTasks from '@los/mobile/src/components/Tasks/hooks/repeatedTaskInit';
import { checkTasksDueToday, setNotificationsForDueTasks, syncNotificationsWithTasks } from '@los/mobile/src/components/Tasks/hooks/tasksNotification';
import globalErrorHandler from './src/components/errorHandler';

import { 
  setGlobalNotificationHandler, 
  registerForPushNotificationsAsync, 
  checkMorningRoutineReminderScheduled, 
  scheduleMorningRoutineReminder,
  scheduleMoodReminder15,
  scheduleMoodReminder19,
  checkMoodReminderScheduled
} from './src/notifications/notificationManager';

// Define the parameter list for your stack navigator
export type RootStackParamList = {
  home: undefined;
  dailyNote: { date: string };
  periodicNote: {
    startDate: string;
    endDate: string;
  };
  database: undefined;
  settings: undefined;
  journal: undefined;
  library: undefined;
  journalHub: undefined;
  people: undefined;
  tasks: undefined;
  moods: undefined;
  money: undefined;
  time: undefined;
  music: undefined;
};

// Declare the Stack with the correct type
const Stack = createStackNavigator<RootStackParamList>();

const MainStackNavigator: React.FC = () => (
  // we code split the components, meaning we are not importing all the components at once, but rather on demand
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="home"
      getComponent={() => require('@los/shared/src/components/Home/Homepage').default}
    />
    <Stack.Screen
      name="dailyNote"
      getComponent={() => require('@los/shared/src/components/DailyNote/DailyNote').default}
      initialParams={{ date: format(new Date(), 'yyyy-MM-dd') }}
    />
    <Stack.Screen
      name="periodicNote"
      getComponent={() => require('@los/shared/src/components/PeriodicNote/PeriodicNote').default}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="settings"
      getComponent={() => require('@los/shared/src/components/UserSettings/UserSettings').default}
    />
    <Stack.Screen
      name="journalHub"
      getComponent={() => require('@los/shared/src/components/Journal/JournalHub').default}
    />
    <Stack.Screen
      name="library"
      getComponent={() => require('@los/shared/src/components/Library/LibraryHub').default}
    />
    <Stack.Screen
      name="people"
      getComponent={() => require('@los/shared/src/components/People/People').default}
    />
    <Stack.Screen
      name="tasks"
      getComponent={() => require('@los/shared/src/components/Tasks/Tasks').default}
    />
    <Stack.Screen
      name="moods"
      getComponent={() => require('@los/shared/src/components/Mood/Mood').default}
    />
    <Stack.Screen
      name="money"
      getComponent={() => require('@los/shared/src/components/Money/Money').default}
    />
    <Stack.Screen
      name="time"
      getComponent={() => require('@los/shared/src/components/Time/Time').default}
    />
    <Stack.Screen
      name="music"
      getComponent={() => require('@los/mobile/src/components/Music/MusicPlayer').default}
    />
  </Stack.Navigator>
);

const LeftDrawer = createDrawerNavigator();
const RightDrawer = createDrawerNavigator();

const LeftDrawerNavigator: React.FC = () => {
  const { isLeftDrawerSwipeEnabled } = useDrawerState();

  return (
    <LeftDrawer.Navigator
      drawerContent={(props) => <LeftPanel {...props} isDrawerOpen={props.navigation.getState().index === 1} />}
      screenOptions={{
        drawerType: 'front',
        swipeEnabled: isLeftDrawerSwipeEnabled,
        swipeEdgeWidth: 100,
        drawerStyle: {
          width: 300,
          backgroundColor: 'transparent',
        },
        headerShown: false,
        drawerPosition: 'left'
      }}
    >
      <LeftDrawer.Screen name="Main" component={MainStackNavigator} />
    </LeftDrawer.Navigator>
  );
};

const RightDrawerNavigator: React.FC = () => {
  const { isRightDrawerSwipeEnabled } = useDrawerState();
  
  return (
    <RightDrawer.Navigator
      drawerContent={(props) => <RightPanel {...props} />}
      screenOptions={{
        drawerType: 'front',
        swipeEnabled: isRightDrawerSwipeEnabled,
        swipeEdgeWidth: 100,
        drawerStyle: {
          width: 300,
        },
        headerShown: false,
        drawerPosition: 'right'
      }}
    >
      <RightDrawer.Screen name="LeftDrawer" component={LeftDrawerNavigator} />
    </RightDrawer.Navigator>
  );
};

function MainApp() {
  const { toggleTheme, theme } = useTheme();
  const appTheme = theme === 'dark' ? darkNavigationTheme : lightNavigationTheme;
  const barStyle = theme === 'dark' ? 'light-content' : 'dark-content';
  const { updateChecklist } = useChecklist();

  useEffect(() => {
    DrawerStateManager.enableAllSwipeInteractions();
  }, []);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
  }, []);

  useEffect(() => {
    setGlobalNotificationHandler();
    registerForPushNotificationsAsync().then(token => console.log(token));
    
    checkMorningRoutineReminderScheduled().then(isScheduled => {
      if (!isScheduled) {
          scheduleMorningRoutineReminder();
      }
    });

    checkMoodReminderScheduled('MoodReminder15').then(isScheduled => {
      if (!isScheduled) {
          scheduleMoodReminder15();  // Adjust to schedule only the 15:00 reminder
      }
    });

    checkMoodReminderScheduled('MoodReminder19').then(isScheduled => {
      if (!isScheduled) {
          scheduleMoodReminder19();  // Adjust to schedule only the 19:00 reminder
      }
    });
  }, []);

  const runCheckAndAddRepeatingTasks = useCallback(async () => {
    try {
      await checkAndAddRepeatingTasks(updateChecklist);
    } catch (error) {
      console.error('Error in checkAndAddRepeatingTasks:', error);
    }
  }, []);

  const checkAndSetTaskNotifications = useCallback(async () => {
    try {
      const tasksDueToday = await checkTasksDueToday();
      await setNotificationsForDueTasks(tasksDueToday);
      await syncNotificationsWithTasks(tasksDueToday);
    } catch (error) {
      console.error('Error in checkAndSetTaskNotifications:', error);
    }
  }, []);

  useEffect(() => {
    runCheckAndAddRepeatingTasks();
    // a small delay to ensure the tasks are set
    setTimeout(checkAndSetTaskNotifications, 1000);
  }, [runCheckAndAddRepeatingTasks, checkAndSetTaskNotifications]);

  Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    interruptionModeAndroid: 1,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  ErrorUtils.setGlobalHandler(globalErrorHandler);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer theme={appTheme}>
          <StatusBar barStyle={barStyle} translucent backgroundColor="rgba(0, 0, 0, 0.1)" />
          <RightDrawerNavigator />
        </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DrawerStateProvider>
        <NavbarDrawerProvider>
          <ChecklistProvider>
            <MusicPlayerProvider>
              <InitializeDatabasesWrapper />
              <MainApp />
            </MusicPlayerProvider>
          </ChecklistProvider>
        </NavbarDrawerProvider>
      </DrawerStateProvider>
    </ThemeProvider>
  );
}