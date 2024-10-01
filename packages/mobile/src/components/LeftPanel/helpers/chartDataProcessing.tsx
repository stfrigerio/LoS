import { TimeData } from "@los/shared/src/types/Time";

export const processTimerSpanningMidnight = (data: TimeData[]): TimeData[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Filter out all entries from yesterday except the one spanning midnight
    const processedData = data.filter(timer => {
        const startTime = new Date(timer.startTime!);
        const endTime = new Date(timer.endTime!);
        return startTime >= today || (startTime < today && endTime > today);
    });
    
    const midnightTimer = processedData.find(timer => {
        const startTime = new Date(timer.startTime!);
        const endTime = new Date(timer.endTime!);
        return startTime < today && endTime > today;
    });

    if (midnightTimer) {
        const endTime = new Date(midnightTimer.endTime!);
        const durationAfterMidnight = endTime.getTime() - today.getTime();

        // Update the timer to start at midnight
        midnightTimer.startTime = today.toISOString();
        midnightTimer.duration = formatDuration(durationAfterMidnight);
    }

    return processedData;
};

// Helper function to format duration
const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};