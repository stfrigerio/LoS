import { BaseTableManager, TableStructure } from '../baseTable';
import { databaseManager } from '../databaseManager';

import { TextNotesData } from '@los/shared/src/types/TextNotes';

const textNotesTableStructure: TableStructure = {
  name: 'Text',
  columns: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    uuid: 'TEXT NOT NULL UNIQUE',
    period: 'TEXT NOT NULL',
    key: 'TEXT',
    text: 'TEXT NOT NULL',
    synced: 'INTEGER DEFAULT 0',
    createdAt: 'TEXT NOT NULL',
    updatedAt: 'TEXT NOT NULL',
  },
  primaryKey: 'id',
  conflictResolutionKey: [
    'uuid'
  ]
};

class TextNotesManager extends BaseTableManager<TextNotesData> {
  constructor() {
    super(textNotesTableStructure);
  }

  async getByPeriod(period: string): Promise<TextNotesData[]> {
    const db = await databaseManager.getDatabase();
    const query = `SELECT * FROM ${this.tableStructure.name} WHERE period = ?;`;
    const results = await databaseManager.executeSqlAsync(db, query, [period]);
    return results.rows._array as TextNotesData[];
  }

  async getByPeriodAndKey(period: string, key: string): Promise<TextNotesData | null> {
    const db = await databaseManager.getDatabase();
    const query = `SELECT * FROM ${this.tableStructure.name} WHERE period = ? AND key = ? LIMIT 1;`;
    const results = await databaseManager.executeSqlAsync(db, query, [period, key]);
    if (results.rows.length > 0) {
      return results.rows.item(0) as TextNotesData;
    } else {
      return null;
    }
  }
}

export const textNotesManager = new TextNotesManager();
