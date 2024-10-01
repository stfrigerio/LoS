import { BaseTableManager, TableStructure } from '../baseTable';
import { databaseManager } from '../databaseManager';

export interface DeletionLogData {
    id: number;
    tableName: string;
    recordUuid: string;
    deletedAt: string;
    synced: number;
}

const deletionLogTableStructure: TableStructure = {
    name: 'DeletionLog',
    columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        tableName: 'TEXT NOT NULL',
        recordUuid: 'TEXT NOT NULL',
        deletedAt: 'TEXT NOT NULL',
        synced: 'INTEGER DEFAULT 0',
    },
    primaryKey: 'id',
    conflictResolutionKey: [
        'tableName',
        'recordUuid'
    ]
};

class DeletionLogTableManager extends BaseTableManager<DeletionLogData> {
    constructor() {
        super(deletionLogTableStructure);
    }

    async getUnsyncedDeletions(): Promise<DeletionLogData[]> {
        const db = await databaseManager.getDatabase();
        const query = `SELECT * FROM ${this.tableStructure.name} WHERE synced = 0 ORDER BY deletedAt ASC;`;
        const result = await databaseManager.executeSqlAsync(db, query);
        return result.rows._array as DeletionLogData[];
    }

    async markAsSynced(id: number): Promise<void> {
        const db = await databaseManager.getDatabase();
        const query = `UPDATE ${this.tableStructure.name} SET synced = 1 WHERE id = ?;`;
        await databaseManager.executeSqlAsync(db, query, [id]);
    }

    async deleteOldSyncedLogs(olderThan: Date): Promise<void> {
        const db = await databaseManager.getDatabase();
        const query = `DELETE FROM ${this.tableStructure.name} WHERE synced = 1 AND deletedAt < ?;`;
        await databaseManager.executeSqlAsync(db, query, [olderThan.toISOString()]);
    }
}

export const deletionLogTableManager = new DeletionLogTableManager();