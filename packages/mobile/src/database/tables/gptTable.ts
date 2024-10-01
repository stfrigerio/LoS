import { BaseTableManager, TableStructure } from '../baseTable';
import { databaseManager } from '../databaseManager';

interface GPTData {
    id?: number;
    uuid: string;
    date: string;
    type: string;
    summary: string;
    createdAt: string;
    updatedAt: string;
}

const gptTableStructure: TableStructure = {
    name: 'GPT',
    columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        uuid: 'TEXT NOT NULL UNIQUE',
        date: 'TEXT NOT NULL',
        type: 'TEXT NOT NULL',
        summary: 'TEXT NOT NULL',
        createdAt: 'TEXT NOT NULL',
        updatedAt: 'TEXT NOT NULL',
    },
    primaryKey: 'id',
    conflictResolutionKey: [
        'uuid'
    ]
};

class GPTTableManager extends BaseTableManager<GPTData> {
    constructor() {
        super(gptTableStructure);
    }

    async getGPTByType(type: string): Promise<GPTData[]> {
        const db = await databaseManager.getDatabase();
        const query = `SELECT * FROM ${this.tableStructure.name} WHERE type = ?;`;
        const result = await databaseManager.executeSqlAsync(db, query, [type]);
        return result.rows._array as GPTData[];
    }
}

export const gptTableManager = new GPTTableManager();