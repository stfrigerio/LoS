export interface MoodNoteData {
    id?: number;
    uuid?: string;
    date: string;
    rating: number;
    comment?: string;
    tag?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    synced: number;  // 0 for not synced, 1 for synced
}