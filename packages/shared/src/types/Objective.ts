export interface ObjectiveData {
    id?: number;
    uuid?: string;
    period: string;
    objective: string;
    pillarUuid?: string;
    completed: boolean;
    note?: string;
    synced?: number;
    createdAt: string;
    updatedAt: string;
}