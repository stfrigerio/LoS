export interface TimeData {
    id?: number;
    uuid?: string;
    date: string;
    tag: string;
    description?: string;
    note?: string;
    duration?: string | null;
    startTime?: string;
    endTime?: string | null;
    synced?: number;
    createdAt?: string;
    updatedAt?: string;
}