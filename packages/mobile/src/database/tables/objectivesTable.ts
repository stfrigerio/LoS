import { BaseTableManager, TableStructure } from '../baseTable';
import { databaseManager } from '../databaseManager';

import { ObjectiveData } from '@los/shared/src/types/Objective';

const objectivesTableStructure: TableStructure = {
    name: 'Objectives',
    columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        uuid: 'TEXT NOT NULL UNIQUE',
        period: 'TEXT',
        objective: 'TEXT NOT NULL',
        pillarUuid: 'TEXT',
        completed: 'INTEGER DEFAULT 0',
        note: 'TEXT',
        synced: 'INTEGER DEFAULT 0',
        createdAt: 'TEXT NOT NULL',
        updatedAt: 'TEXT NOT NULL',
    },
    primaryKey: 'id',
    conflictResolutionKey: [
        'uuid'
    ]
};

class ObjectivesTableManager extends BaseTableManager<ObjectiveData> {
    constructor() {
        super(objectivesTableStructure);
    }

    async getObjectives(filter: { period?: string, pillarId?: number }): Promise<ObjectiveData[]> {
        const db = await databaseManager.getDatabase();
        let query = `SELECT * FROM ${this.tableStructure.name}`;
        const queryParams = [];
        const conditions = [];

        if (filter.period) {
            conditions.push('period = ?');
            queryParams.push(filter.period);
        }
        if (filter.pillarId) {
            conditions.push('pillarId = ?');
            queryParams.push(filter.pillarId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY createdAt DESC';

        const result = await databaseManager.executeSqlAsync(db, query, queryParams);
        return result.rows._array as ObjectiveData[];
    }

    async fetchPeriods(): Promise<string[]> {
        const db = await databaseManager.getDatabase();
        const query = `SELECT DISTINCT period FROM ${this.tableStructure.name} ORDER BY period;`;
        const result = await databaseManager.executeSqlAsync(db, query);
        return result.rows._array.map(row => row.period);
    }

    async getObjectivesByPillar(pillarId: number): Promise<ObjectiveData[]> {
        const db = await databaseManager.getDatabase();
        const query = `SELECT * FROM ${this.tableStructure.name} WHERE pillarId = ? ORDER BY createdAt DESC;`;
        const result = await databaseManager.executeSqlAsync(db, query, [pillarId]);
        return result.rows._array as ObjectiveData[];
    }

    async getUncompletedObjectives(): Promise<ObjectiveData[]> {
        const db = await databaseManager.getDatabase();
        const query = `SELECT * FROM ${this.tableStructure.name} WHERE completed = 0 ORDER BY createdAt DESC;`;
        const result = await databaseManager.executeSqlAsync(db, query);
        return result.rows._array as ObjectiveData[];
    }
}

export const objectivesTableManager = new ObjectivesTableManager();