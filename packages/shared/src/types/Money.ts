export interface MoneyData {
    id?: number;
    uuid?: string;
    date: string;
    amount: number;
    type: string;
    tag: string;
    description: string;
    account?: string;
    due?: string;
    synced: number;
    createdAt?: string;
    updatedAt?: string;
}