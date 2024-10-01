import { BaseTableManager, TableStructure } from '../baseTable';
import { databaseManager } from '../databaseManager';

import { PillarData } from '@los/shared/src/types/Pillar';

const pillarsTableStructure: TableStructure = {
    name: 'Pillars',
    columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        uuid: 'TEXT NOT NULL UNIQUE',
        name: 'TEXT NOT NULL UNIQUE',
        description: 'TEXT',
        emoji: 'TEXT',
        synced: 'INTEGER DEFAULT 0',
        createdAt: 'TEXT NOT NULL',
        updatedAt: 'TEXT NOT NULL',
    },
    primaryKey: 'id',
    conflictResolutionKey: [
        'uuid'
    ]
};

class PillarsTableManager extends BaseTableManager<PillarData> {
    constructor() {
        super(pillarsTableStructure);
    }

    async getPillars(): Promise<PillarData[]> {
        const db = await databaseManager.getDatabase();
        const query = `SELECT * FROM ${this.tableStructure.name} ORDER BY name;`;
        const result = await databaseManager.executeSqlAsync(db, query);
        return result.rows._array as PillarData[];
    }

    async getPillarByName(name: string): Promise<PillarData | null> {
        const db = await databaseManager.getDatabase();
        const query = `SELECT * FROM ${this.tableStructure.name} WHERE name = ?;`;
        const result = await databaseManager.executeSqlAsync(db, query, [name]);
        return result.rows.length > 0 ? result.rows.item(0) as PillarData : null;
    }

    async getPillarById(id: number): Promise<PillarData | null> {
        const db = await databaseManager.getDatabase();
        const query = `SELECT * FROM ${this.tableStructure.name} WHERE id = ?;`;
        const result = await databaseManager.executeSqlAsync(db, query, [id]);
        return result.rows.length > 0 ? result.rows.item(0) as PillarData : null;
    }
}

export const pillarsTableManager = new PillarsTableManager();