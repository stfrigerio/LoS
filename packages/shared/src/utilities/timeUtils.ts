import { startOfWeek, addDays, eachHourOfInterval, startOfDay, endOfDay, Day, format, parseISO } from 'date-fns';

export const customTimeParser = (timeString: string): string => {
    if (timeString.includes('.')) {
        let [hour, minute] = timeString.split('.');
        if (minute.length === 1) {
            minute = minute + '0';
        }
        timeString = hour.padStart(2, '0') + ':' + minute;
    } else {
        timeString = timeString.padStart(2, '0') + ':00';
    }
    return timeString;
};

export const getDatesOfWeek = (date: Date): Date[] => {
    let currentDay = new Date(date);
    let dayOfWeek = currentDay.getDay();
    let distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    let monday = new Date(currentDay);
    monday.setDate(currentDay.getDate() + distanceToMonday);

    let week: Date[] = [];
    for (let i = 0; i < 7; i++) {
        week.push(new Date(monday));
        monday.setDate(monday.getDate() + 1);
    }

    return week;
};

export function formatSecondsToHMS(currentSeconds: number): string {
    const durationHours = Math.floor(currentSeconds / 3600);
    const durationMinutes = Math.floor((currentSeconds % 3600) / 60);
    const durationSeconds = currentSeconds % 60;
    return `${durationHours.toString().padStart(2, '0')}:${durationMinutes.toString().padStart(2, '0')}:${durationSeconds.toString().padStart(2, '0')}`;
}

export const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const secondsToTimeFormat = (seconds: number | null | undefined): string | null => {
    if (seconds === null || seconds === undefined) return null;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hours, minutes, secs]
        .map(v => v < 10 ? '0' + v : v)
        .join(':');
};

export const getNextWeekdayDate = (currentDate: Date, weekday: string, nextWeek = false): Date => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayIndex = daysOfWeek.indexOf(weekday);
    let date = new Date(currentDate);

    let daysToAdd = (7 + dayIndex - date.getDay()) % 7;
    
    if (nextWeek) {
        daysToAdd += 7;
    }

    date.setDate(date.getDate() + daysToAdd);
    return date;
};

export function getPreviousWeekDateRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const end = new Date(now);
    end.setDate(now.getDate() - dayOfWeek);

    const start = new Date(end);
    start.setDate(end.getDate() - 6);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    return {
        startDate: formatDate(start),
        endDate: formatDate(end)
    };
}

export function getPreviousMonthDateRange(): { startDate: string; endDate: string; monthYearString: string } {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    const monthYearString = format(startOfMonth, 'yyyy-MM');

    return {
        startDate: format(startOfMonth, 'yyyy-MM-dd'),
        endDate: format(endOfMonth, 'yyyy-MM-dd'),
        monthYearString
    };
}

export const formatTime = (timeString: string): string => {
    const time = new Date(timeString);
    const hours = time.getHours();
    const minutes = time.getMinutes();

    const formattedHours = hours < 10 ? '0' + hours : hours.toString();
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes.toString();

    return `${formattedHours}:${formattedMinutes}`;
};

export function formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);

    if (hours === 0) {
        return remainingMinutes === 0 ? '< 1m' : `${remainingMinutes}m`;
    } else {
        return `${hours}h ${remainingMinutes}m`;
    }
}

export const getDaysOfWeek = (startOfWeekDate: Date): Date[] => {
    return Array.from({ length: 7 }).map((_, index) => addDays(startOfWeekDate, index));
};

export const getHoursOfDay = (date: Date): Date[] => {
    return eachHourOfInterval({ start: startOfDay(date), end: endOfDay(date) });
};

export const getWeekNumber = (d: Date): number => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
};

export function timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

export function minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function convertDurationToSeconds(duration: string): number {
    const [hours, minutes, seconds] = duration.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

export function getUTCOffset(date: Date): string {
    const offset = -date.getTimezoneOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const minutes = Math.abs(offset % 60);
    return `${offset >= 0 ? '+' : '-'}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function parseTimeToDecimal(t: string): number {
    const [hours, minutes] = t.split(':').map(d => +d);
    let decimal = hours + minutes / 60;
    if (decimal < 18) decimal += 24; // Shift times after midnight
    return decimal;
}
