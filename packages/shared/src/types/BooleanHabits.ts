export interface BooleanHabitsData {
    id?: number;
    uuid?: string;
    date: string;
    habitKey: string;
    value: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface BooleanHabitsNoteData {
    [key: string]: number;
}

export interface BooleanHabitSetting {
    uuid?: string;
    key: string;
    value: boolean;
}