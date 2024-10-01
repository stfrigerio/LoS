export interface DailyTextData {
    date: string;
    success: string;
    beBetter: string;
    morningComment: string;
}

export interface TextListProps {
    textData: TextNotesData[]
}

export interface AggregateTextData {
    date: string;
    successes: TextNotesData[];
    beBetters: TextNotesData[];
    thinks: TextNotesData[];
}

export interface TextNotesData {
    id?: number;
    uuid?: string;
    period: string;
    key?: string;  // for the daily note summaries
    text: string;
    synced?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DesktopTextNotesData {
    id?: number;
    date: string;
    successes: string[];
    beBetters: string[];
    thinks: string[];
}