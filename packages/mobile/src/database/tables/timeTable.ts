import { BaseTableManager, TableStructure } from '../baseTable';
import { databaseManager } from '../databaseManager';

import { TimeData } from '@los/shared/src/types/Time';

const timeTableStructure: TableStructure = {
  name: 'Time',
  columns: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    uuid: 'TEXT NOT NULL UNIQUE',
    date: 'TEXT NOT NULL',
    tag: 'TEXT NOT NULL',
    description: 'TEXT',
    duration: 'TEXT',
    startTime: 'TEXT',
    endTime: 'TEXT',
    synced: 'INTEGER DEFAULT 0',
    createdAt: 'TEXT NOT NULL',
    updatedAt: 'TEXT NOT NULL',
  },
  primaryKey: 'id',
  conflictResolutionKey: [
    'uuid'
  ]
};

class TimeTableManager extends BaseTableManager<TimeData> {
  constructor() {
    super(timeTableStructure);
  }

  async getTime(filter: { date?: string, dateRange?: string[], tag?: string }): Promise<TimeData[]> {
    const db = await databaseManager.getDatabase();
    let query = `SELECT * FROM ${this.tableStructure.name}`;
    const queryParams = [];

    if (filter.date) {
      query += ' WHERE date = ?';
      queryParams.push(filter.date);
    //^ careful, this has been thought stupid. you should pass each date in the range as a list
    } else if (filter.dateRange) {
      const placeholders = filter.dateRange.map(() => '?').join(', ');
      query += ` WHERE date IN (${placeholders})`;
      queryParams.push(...filter.dateRange);
    } else if (filter.tag) {
      query += ' WHERE tag = ?';
      queryParams.push(filter.tag);
    }

    const result = await databaseManager.executeSqlAsync(db, query, queryParams);
    return result.rows._array as TimeData[];
  }

  async getActiveTimer(): Promise<TimeData | null> {
    const db = await databaseManager.getDatabase();
    const query = `SELECT * FROM ${this.tableStructure.name} WHERE endTime IS NULL;`;
    const result = await databaseManager.executeSqlAsync(db, query);
    return result.rows.length > 0 ? result.rows.item(0) as TimeData : null;
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
}

export const timeTableManager = new TimeTableManager();