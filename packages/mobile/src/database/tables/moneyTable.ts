import { BaseTableManager, TableStructure } from '../baseTable';
import { databaseManager } from '../databaseManager';

import { MoneyData } from '@los/shared/src/types/Money';

const moneyTableStructure: TableStructure = {
    name: 'Money',
    columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        uuid: 'TEXT NOT NULL UNIQUE',
        date: 'TEXT',
        amount: 'REAL',
        type: 'TEXT', // income, expense, recursive...
        account: 'TEXT', 
        tag: 'TEXT',
        description: 'TEXT',
        due: 'TEXT',
        synced: 'INTEGER DEFAULT 0',
        createdAt: 'TEXT NOT NULL',
        updatedAt: 'TEXT NOT NULL',
    },
    primaryKey: 'id',
    conflictResolutionKey: [
        'uuid'
    ]
};

class MoneyTableManager extends BaseTableManager<MoneyData> {
    constructor() {
        super(moneyTableStructure);
    }

    async getMoney(filter: { date?: string, type?: string, tag?: string, dateRange?: string[] }): Promise<MoneyData[]> {
        const db = await databaseManager.getDatabase();
        let query = `SELECT * FROM ${this.tableStructure.name}`;
        const queryParams = [];
        const conditions = [];

        if (filter.date) {
            conditions.push('date = ?');
            queryParams.push(filter.date);
        }
        if (filter.type) {
            conditions.push('type = ?');
            queryParams.push(filter.type);
        }
        if (filter.tag) {
            conditions.push('tag = ?');
            queryParams.push(filter.tag);
        }
        if (filter.dateRange) {
            conditions.push(`date IN (${filter.dateRange.map(() => '?').join(', ')})`);
            queryParams.push(...filter.dateRange);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY date DESC';

        const result = await databaseManager.executeSqlAsync(db, query, queryParams);
        return result.rows._array as MoneyData[];
    }

    async fetchTags(): Promise<string[]> {
        const db = await databaseManager.getDatabase();
        const query = `SELECT DISTINCT tag FROM ${this.tableStructure.name} ORDER BY tag;`;
        const result = await databaseManager.executeSqlAsync(db, query);
        return result.rows._array.map(row => row.tag);
    }

    async fetchDescriptions(tag: string): Promise<string[]> {
        const db = await databaseManager.getDatabase();
        const query = `SELECT DISTINCT description FROM ${this.tableStructure.name} WHERE tag = ? ORDER BY description;`;
        const result = await databaseManager.executeSqlAsync(db, query, [tag]);
        return result.rows._array.map(row => row.description);
    }

    async listAccounts(): Promise<{ account: string }[]> {
        const db = await databaseManager.getDatabase();
        const query = `SELECT DISTINCT account FROM ${this.tableStructure.name} WHERE account IS NOT NULL AND account != '' ORDER BY account;`;
        const result = await databaseManager.executeSqlAsync(db, query);
        return result.rows._array as { account: string }[];
    }
}

export const moneyTableManager = new MoneyTableManager();