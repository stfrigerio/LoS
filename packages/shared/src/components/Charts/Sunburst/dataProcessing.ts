import { HourData } from "./24hSunburstChart";
import { TimeData } from "../../../types/Time";

export function processHourData(timeData: TimeData[]): HourData[] {
    const hourData: HourData[] = Array.from({ length: 24 }, (_, i) => ({ hour: i, tags: [] }));

    timeData.forEach(entry => {
        const startTime = new Date(entry.startTime || entry.date);
        const endTime = entry.endTime ? new Date(entry.endTime) : new Date(startTime.getTime() + 3600000);

        let currentTime = new Date(startTime);

        while (currentTime < endTime) {
            const currentHour = currentTime.getHours();
            const hourEnd = new Date(currentTime);
            hourEnd.setHours(currentHour + 1, 0, 0, 0);

            const segmentEnd = new Date(Math.min(hourEnd.getTime(), endTime.getTime()));
            const duration = (segmentEnd.getTime() - currentTime.getTime()) / 3600000; // Convert to hours

            const existingTag = hourData[currentHour].tags.find(t => t.tag === entry.tag);
            if (existingTag) {
                existingTag.duration += duration;
            } else {
                hourData[currentHour].tags.push({
                    tag: entry.tag,
                    duration: duration
                });
            }

            currentTime = hourEnd;
        }
    });

    return hourData;
}

export interface ProcessedHourData {
    date: string;
    hour: number;
    totalDuration: number;
    tags: Array<{ tag: string; duration: number; description: string }>;
    dominantTag?: string;
    dominantDescription?: string;
}

export function processMultiDayHourData(timeData: TimeData[]): ProcessedHourData[] {
    const hourDataMap = new Map<string, ProcessedHourData>();

    timeData.forEach(entry => {
        const startTime = new Date(entry.startTime || entry.date);
        const endTime = entry.endTime ? new Date(entry.endTime) : new Date(startTime.getTime() + 3600000);

        // console.log(`Processing entry:`, entry);
        // console.log(`Start time: ${startTime.toISOString()}, End time: ${endTime.toISOString()}`);

        let currentTime = new Date(startTime);

        while (currentTime < endTime) {
            const date = currentTime.toLocaleDateString('en-CA'); // Use local date
            const hour = currentTime.getHours();
            const key = `${date}-${hour}`;

            // console.log(`Current time: ${currentTime.toISOString()}, Key: ${key}`);

            const hourEnd = new Date(currentTime);
            hourEnd.setHours(hour + 1, 0, 0, 0);

            const segmentEnd = new Date(Math.min(hourEnd.getTime(), endTime.getTime()));
            const duration = (segmentEnd.getTime() - currentTime.getTime()) / 3600000; // Convert to hours

            // console.log(`Segment end: ${segmentEnd.toISOString()}, Duration: ${duration}`);

            if (!hourDataMap.has(key)) {
                hourDataMap.set(key, { date, hour, totalDuration: 0, tags: [] });
            }

            const hourData = hourDataMap.get(key)!;
            hourData.totalDuration += duration;

            const existingTag = hourData.tags.find(t => t.tag === entry.tag);
            if (existingTag) {
                existingTag.duration += duration;
            } else {
                hourData.tags.push({ tag: entry.tag, duration, description: entry.description || '' });
            }

            currentTime = new Date(segmentEnd);
        }
    });


    // Determine the dominant tag for each hour
    hourDataMap.forEach(hourData => {
        if (hourData.tags.length > 0) {
            const dominantTagEntry = hourData.tags.reduce((a, b) => a.duration > b.duration ? a : b);
            hourData.dominantTag = dominantTagEntry.tag;
            hourData.dominantDescription = dominantTagEntry.description;
        }
    });

    const sortedData = Array.from(hourDataMap.values()).sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        return dateComparison !== 0 ? dateComparison : a.hour - b.hour;
    });

    return sortedData;
}