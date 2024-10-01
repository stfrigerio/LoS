import { BaseTableManager, TableStructure } from '../baseTable';
import { databaseManager } from '../databaseManager';

import { BooleanHabitsData } from '@los/shared/src/types/BooleanHabits';

const booleanHabitsTableStructure: TableStructure = {
  name: 'BooleanHabits',
  columns: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    uuid: 'TEXT NOT NULL UNIQUE',
    date: 'TEXT NOT NULL',
    habitKey: 'TEXT NOT NULL',
    value: 'BOOLEAN NOT NULL',
    createdAt: 'TEXT NOT NULL',
    updatedAt: 'TEXT NOT NULL',
  },
  primaryKey: 'id',
  foreignKeys: [
    'FOREIGN KEY(date) REFERENCES DailyNotes(date) ON DELETE CASCADE'
  ],
  conflictResolutionKey: [
    'uuid'
  ]
};

class BooleanHabitsManager extends BaseTableManager<BooleanHabitsData> {
  constructor() {
    super(booleanHabitsTableStructure);
  }

  async getHabitByDateAndKey(date: string, habitKey: string): Promise<BooleanHabitsData | null> {
    const db = await databaseManager.getDatabase();
    const query = `SELECT * FROM ${this.tableStructure.name} WHERE date = ? AND habitKey = ? LIMIT 1;`;
    const results = await databaseManager.executeSqlAsync(db, query, [date, habitKey]);
    
    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      return {...row, value: Boolean(row.value)} as BooleanHabitsData;
    } else {
      return null;
    }
  }

  async listOrderedByDate(): Promise<BooleanHabitsData[]> {
    const db = await databaseManager.getDatabase();
    const query = `SELECT * FROM ${this.tableStructure.name} ORDER BY date(date) DESC, datetime(createdAt) DESC;`;
    const results = await databaseManager.executeSqlAsync(db, query, []);
    
    const data = Array.from({ length: results.rows.length }, (_, i) => {
      const row = results.rows.item(i);
      return { ...row, value: Boolean(row.value) } as BooleanHabitsData;
    });

    return data;
  }
}

export const booleanHabitsManager = new BooleanHabitsManager();