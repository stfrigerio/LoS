// Libraries
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ScrollView, View, StyleSheet, Platform, Dimensions } from 'react-native';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import { startOfToday } from 'date-fns';
import { useRoute, RouteProp } from '@react-navigation/native';

import {
  Quote,
  QuantifiableHabits,
  BooleanHabits,
  MorningData,
  EveningData,
  DateHeader,
  DailyTasks
} from './components'

import TimeBox from '../PeriodicNote/components/TimeBox'
import DateNavigation from '../PeriodicNote/components/DateNavigation';
import ImagePickerComponent from './components/ImagePickerComponent';

// Functions
import { RootStackParamList } from '@los/mobile/App';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { navigatePeriod } from '../PeriodicNote/helpers/navigatePeriod';
import { useHomepage } from '../Home/helpers/useHomepage';

// Types
import { UseDailyDataType } from './types/DailyData';
import  { UseTaskDataType } from '@los/mobile/src/components/Tasks/hooks/useTasksData';
import { TaskData } from '../../types/Task';

let ColorfulTimeline: React.ComponentType<any>
let useDailyData: UseDailyDataType;
let useTaskData: () => UseTaskDataType;
let useDailySettings: any
let DrawerStateManager: any;

if (Platform.OS === 'web') {
  ColorfulTimeline = require('@los/desktop/src/components/DailyNote/components/ColorfulTimeline').default;
  useDailyData = require('@los/desktop/src/components/DailyNote/hooks/useDailyData').useDailyData;
  useDailySettings = require('@los/desktop/src/components/DailyNote/hooks/useDailySettings').useDailySettings;
  DrawerStateManager = null;
  useTaskData = require('@los/desktop/src/components/Tasks/hooks/useTasksData').useTasksData;
} else {
  ColorfulTimeline = require('@los/mobile/src/components/DailyNote/components/ColorfulTimeline').default;
  useDailyData = require('@los/mobile/src/components/DailyNote/hooks/useDailyData').useDailyData;
  useDailySettings = require('@los/mobile/src/components/DailyNote/hooks/useDailySettings').useDailySettings;
  DrawerStateManager = require('@los/mobile/src/components/Contexts/DrawerState').DrawerStateManager;
  useTaskData = require('@los/mobile/src/components/Tasks/hooks/useTasksData').useTasksData;
}

type DailyNoteRouteProp = RouteProp<RootStackParamList, 'dailyNote'>;

type DailyNoteProps = {
  route?: DailyNoteRouteProp;
  date?: string;
};

const DailyNote: React.FC<DailyNoteProps> = ({ route, date: propDate }) => {
  if (!route) {
    return null;
  }
  
  const [currentDate, setCurrentDate] = useState(() => {
    const initialDate = route?.params?.date || propDate || new Date().toISOString().split('T')[0];
    return new Date(initialDate);
  });

  const [lastSubmissionTime, setLastSubmissionTime] = useState(Date.now());
  const [tasks, setTasks] = useState<TaskData[]>([]);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localDate = toDate(currentDate, { timeZone });
  const dateStr = formatInTimeZone(localDate, timeZone, 'yyyy-MM-dd');
  const title = format(currentDate, 'EEEE, dd MMMM');

  const { dailyData, onUpdateDaySections } = useDailyData(currentDate, lastSubmissionTime);
  const { toggleTaskCompletion, getTasksDueOnDate: fetchDailyTasks } = useTaskData();
  const [ settings ] = useDailySettings();

  const { themeColors } = useThemeStyles();
  const styles = getStyles(themeColors);

  useEffect(() => {
    const newDate = route?.params?.date || propDate;
    if (newDate) {
      setCurrentDate(new Date(newDate));
    }
  }, [route?.params?.date, propDate]);

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
    const fetchTasks = async () => {
      const dailyTasks = await fetchDailyTasks(currentDate);
      setTasks(dailyTasks);
    };

    fetchTasks();
  }, [currentDate]);

  const handleNavigatePeriod = (direction: 'previous' | 'next' | 'current') => {
    if (direction === 'current') {
      setCurrentDate(startOfToday());
    } else {
      const { newStartDate } = navigatePeriod(direction, 'day', currentDate, currentDate);
      setCurrentDate(newStartDate);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ColorfulTimeline title={dateStr} />
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.noteContainer}>
          <DateHeader formattedDate={title} periodType='day' />
          <View style={styles.navigation}>
            <TimeBox 
              startDate={dateStr!} 
              endDate={dateStr!} 
              currentViewType={'daily'}
            />
            <DateNavigation 
              periodType={'day'} 
              onNavigate={handleNavigatePeriod}
            />
          </View>
          {settings && !settings.hideQuote && (
            <Quote 
              isCollapse={settings.quoteCollapse} 
              isFixed={settings.fixedQuote}
            />
          )}
          <QuantifiableHabits data={dailyData?.quantifiableHabits || []} date={dateStr} />
          <BooleanHabits data={dailyData?.booleanHabits || []} date={dateStr} booleanHabitsName={settings?.booleanHabitsName ?? false} />
          <DailyTasks tasks={tasks || []} onToggleTaskCompletion={toggleTaskCompletion} fetchDailyTasks={fetchDailyTasks} currentDate={currentDate} />
          <MorningData data={dailyData} onUpdate={onUpdateDaySections}/>
          <EveningData data={dailyData} onUpdate={onUpdateDaySections}/>
          <ImagePickerComponent date={dateStr} />
        </View>
      </ScrollView>
    </View>
  );
};

export default DailyNote;


const getStyles = (theme: any) => {
  const { width } = Dimensions.get('window');
  const isSmall = width < 1920;
  const isDesktop = Platform.OS === 'web';

  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      marginTop: isDesktop ? 0 : 37,
      position: 'relative',
    },
    noteContainer: {
      backgroundColor: theme.backgroundColor,
      paddingHorizontal: 20, 
    },
    navigation: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
  });
};
