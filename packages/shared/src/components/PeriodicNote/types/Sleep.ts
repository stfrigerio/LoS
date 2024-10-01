export interface UseSleepDataProps {
    fetchedSleepData: SleepData[] | undefined;
}

export interface SleepData {
    date: string;
    sleep_time: string;
    wake_hour: string;
}

export interface SleepAverages {
    average_sleep_time: string;
    average_wake_time: string;
}

export interface UseSleepDataReturn {
    sleepAverages: SleepAverages;
    processedSleepData: SleepData[] | null;
    isLoading: boolean;
    sleepError: string | null;
}
