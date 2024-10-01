import { useCallback } from 'react';
import { Platform } from 'react-native';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subWeeks, startOfDay, endOfDay } from 'date-fns';
import { toZonedTime, format } from 'date-fns-tz';

let useNavigateFunc: () => (route: string, params?: any) => void;
let useHomepageSettings
if (Platform.OS === 'web') {
  const { useNavigate } = require('react-router-dom');
  useNavigateFunc = () => {
    const navigate = useNavigate();
    return useCallback((route: string, params?: any) => {
      navigate(route, { state: params });
    }, [navigate]);
  };
  useHomepageSettings = null
} else {
  const { useNavigation } = require('@react-navigation/native');
  useNavigateFunc = () => {
    const navigation = useNavigation();
    return useCallback((route: string, params?: any) => {
      navigation.navigate(route as never, params as never);
    }, [navigation]);
  };
  useHomepageSettings = require('@los/mobile/src/components/UserSettings/hooks/useSettings').useSettings;
}

export const useCustomNavigation = useNavigateFunc;

export type NotePeriod = 'day' | 'week' | 'lastWeek' | 'month' | 'quarter' | 'year' | 'allYears';

export interface HomepageSettings {
  HideNextTask?: { value: string };
  HideDots?: { value: string };
  HidePeople?: { value: string };
  HideTasks?: { value: string };
  HideJournal?: { value: string };
  HideMoods?: { value: string };
  HideLibrary?: { value: string };
  HideMoney?: { value: string };
  HideNextObjective?: { value: string };
  HideCarLocation?: { value: string };
}

export const useHomepage = () => {
  const navigate = useCustomNavigation();

  const openNote = useCallback((period: NotePeriod, date: string) => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parsedDate = new Date(date);

    if (period === 'day') {
      const parsedDate = new Date(date);
      const formattedDate = format(parsedDate, 'yyyy-MM-dd', { timeZone });
      navigate('dailyNote', { date: formattedDate });
      return;
    }

    let start: Date, end: Date;

    switch (period) {
      case 'week':
        start = startOfWeek(parsedDate, { weekStartsOn: 1 });
        end = endOfWeek(parsedDate, { weekStartsOn: 1 });
        break;
      case 'lastWeek':
        const lastWeek = subWeeks(parsedDate, 1);
        start = startOfWeek(lastWeek, { weekStartsOn: 1 });
        end = endOfWeek(lastWeek, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(parsedDate);
        end = endOfMonth(parsedDate);
        break;
      case 'quarter':
        start = startOfQuarter(parsedDate);
        end = endOfQuarter(parsedDate);
        break;
      case 'year':
        start = startOfYear(parsedDate);
        end = endOfYear(parsedDate);
        break;
      case 'allYears':
        start = new Date('2023-01-01T00:00:00Z');
        end = new Date();
        break;
    }

    // Convert dates back to the local time zone
    start = toZonedTime(start, timeZone);
    end = toZonedTime(end, timeZone);

    // Format dates to ISO string in local time zone
    const startDate = format(start, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", { timeZone });
    const endDate = format(end, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", { timeZone });

    if (Platform.OS === 'web') {
      navigate('/periodicNote', {
        startDate: startDate,
        endDate: endDate,
      });
    } else {
      navigate('periodicNote', {
        startDate: startDate,
        endDate: endDate,
      });
    }
  }, [navigate]);

  const openToday = useCallback(() => {
    navigate('dailyNote');
  }, [navigate]);

  const openSettings = useCallback(() => {
    navigate('settings');
  }, [navigate]);

  const openLibrary = useCallback(() => {
    navigate('library');
  }, [navigate])

  const openJournalHub = useCallback(() => {
    navigate('journalHub');
  }, [navigate])

  const openPeople = useCallback(() => {
    navigate('people');
  }, [navigate])

  const openTasks = useCallback(() => {
    navigate('tasks');
  }, [navigate])

  const openMoods = useCallback(() => {
    navigate('moods');
  }, [navigate])

  const openMoney = useCallback(() => {
    navigate('money');
  }, [navigate])

  const openHomepage = useCallback(() => {
    navigate('/');
  }, [navigate])

  const openCurrentWeek = useCallback(() => {
    const today = new Date();
    openNote('week', today.toString());
  }, [openNote]);

  const openCurrentMonth = useCallback(() => {
    const today = new Date();
    openNote('month', today.toString());
  }, [openNote]);

  const openMusic = useCallback(() => {
    navigate('music');
  }, [navigate])

  let homepageSettings: HomepageSettings = {};

  if (typeof useHomepageSettings === 'function') {
    const { settings } = useHomepageSettings();
    homepageSettings = {
      HideNextTask: settings.HideNextTask,
      HideDots: settings.HideDots,
      HidePeople: settings.HidePeople,
      HideTasks: settings.HideTasks,
      HideJournal: settings.HideJournal,
      HideMoods: settings.HideMoods,
      HideLibrary: settings.HideLibrary,
      HideMoney: settings.HideMoney,
      HideNextObjective: settings.HideNextObjective,
      HideCarLocation: settings.HideCarLocation,
    };
  }

  return { 
    openNote, 
    openSettings, 
    openToday, 
    openLibrary, 
    openJournalHub,
    openPeople,
    openTasks,
    openMoods,
    openMoney,
    openHomepage,
    openCurrentWeek,
    openCurrentMonth,
    openMusic,
    homepageSettings,
  };
};