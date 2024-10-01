import { BooleanHabitsData } from "./BooleanHabits";
import { QuantifiableHabitsData } from "./QuantifiableHabits";

export interface DailyNoteData {
    id?: number;
    uuid?: string;
    date?: string;
    booleanHabits?: BooleanHabitsData[],
    quantifiableHabits?: QuantifiableHabitsData[],
    morningComment?: string;
    energy?: number;
    wakeHour?: string; 
    success?: string; 
    beBetter?: string; 
    dayRating?: number; 
    sleepTime?: string; 
    createdAt: string;
    updatedAt: string;
    synced?: number;
}  

// this is the one i have in the database file for sqlite
export interface NoteData {
    id?: number,
    uuid?: string;
    date: string;
    morningComment?: string;
    energy?: number;
    wakeHour?: string;
    success?: string;
    beBetter?: string;
    dayRating?: number;
    sleepTime?: string;
    createdAt: string;
    updatedAt: string;
    synced?: number;
} 
