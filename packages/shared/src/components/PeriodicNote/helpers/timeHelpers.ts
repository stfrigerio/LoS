import { TimeData } from '@los/shared/src/types/Time';

// Define the structure of the summary
interface TimeSummary {
    totalTime: string; // e.g., "240h 45m"
    totalTimeChange: number; // Percentage change
    timeTrackedPerDay: string; // e.g., "34h 15m"
    timeTrackedPerDayChange: number; // Percentage change
    mostCommonTag: string;
    longestSingleEntry: string;
    numberOfTimers: number;
    numberOfTimersChange: number; // Percentage change
}

export const calculateTimeSummary = (
    currentTimeData: TimeData[],
    previousTimeData: TimeData[]
): TimeSummary => {
    // Helper function to parse "HH:mm:ss" into total seconds
    const parseDuration = (duration: string): number => {
        const [hours, minutes, seconds] = duration.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    // Helper function to format seconds into "XXXh XXm"
    const formatDuration = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hrs}h ${mins}m`;
    };

    // Helper function to get the number of unique days in the data
    const getUniqueDays = (timeData: TimeData[]): number => {
        const uniqueDates = new Set(
            timeData.map(entry => {
                // Assuming TimeData has a 'date' field in a parsable format
                const date = new Date(entry.date);
                return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            })
        );
        return uniqueDates.size;
    };

    // Helper function to calculate summary metrics from TimeData
    const calculateSummaryMetrics = (timeData: TimeData[]) => {
        let totalTimeSeconds = 0;
        const tagCounts: { [key: string]: number } = {};
        const tagDurations: { [key: string]: number } = {};

        timeData.forEach(entry => {
            const durationSeconds = parseDuration(entry.duration || '00:00:00');
            totalTimeSeconds += durationSeconds;

            if (entry.tag) {
                // Count occurrences of each tag
                tagCounts[entry.tag] = (tagCounts[entry.tag] || 0) + 1;
                // Sum durations per tag
                tagDurations[entry.tag] = (tagDurations[entry.tag] || 0) + durationSeconds;
            }
        });

        const uniqueDays = getUniqueDays(timeData);
        const timeTrackedPerDaySeconds = uniqueDays > 0 ? totalTimeSeconds / uniqueDays : 0;

        return {
            totalTimeSeconds,
            tagCounts,
            tagDurations,
            timeTrackedPerDaySeconds,
            numberOfTimers: timeData.length,
        };
    };

    // Calculate summaries for current and previous data
    const currentSummary = calculateSummaryMetrics(currentTimeData);
    const previousSummary = calculateSummaryMetrics(previousTimeData);

    // Helper function to calculate percentage change
    const calculatePercentageChange = (current: number, previous: number): number => {
        if (previous === 0) {
            return current > 0 ? 100 : 0;
        }
        return ((current - previous) / previous) * 100;
    };

    // Calculate percentage changes
    const totalTimeChange = calculatePercentageChange(currentSummary.totalTimeSeconds, previousSummary.totalTimeSeconds);
    const timeTrackedPerDayChange = calculatePercentageChange(currentSummary.timeTrackedPerDaySeconds, previousSummary.timeTrackedPerDaySeconds);
    const numberOfTimersChange = calculatePercentageChange(currentSummary.numberOfTimers, previousSummary.numberOfTimers);

    // Helper function to determine the most common tag
    const getMostCommonTag = (tagCounts: { [key: string]: number }): string => {
        const entries = Object.entries(tagCounts);
        if (entries.length === 0) return 'N/A';
        return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    };

    // Helper function to determine the tag with the most time consumed
    const getTagWithLongestSingleEntry = (tagLongestDuration: { [key: string]: number }): string => {
        const entries = Object.entries(tagLongestDuration);
        if (entries.length === 0) return 'N/A';
        return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    };

    // Determine the most common and most time-consuming tags
    const mostCommonTag = getMostCommonTag(currentSummary.tagCounts);
    const longestSingleEntry = getTagWithLongestSingleEntry(currentSummary.tagDurations);

    return {
        totalTime: formatDuration(currentSummary.totalTimeSeconds),
        totalTimeChange: parseFloat(totalTimeChange.toFixed(2)),
        timeTrackedPerDay: formatDuration(currentSummary.timeTrackedPerDaySeconds),
        timeTrackedPerDayChange: parseFloat(timeTrackedPerDayChange.toFixed(2)),
        mostCommonTag,
        longestSingleEntry,
        numberOfTimers: currentSummary.numberOfTimers,
        numberOfTimersChange: parseFloat(numberOfTimersChange.toFixed(2)),
    };
};
