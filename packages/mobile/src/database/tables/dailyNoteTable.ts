import { BaseTableManager, TableStructure } from '../baseTable';
import { NoteData, DailyNoteData } from '@los/shared/src/types/DailyNote';
import { databaseManager } from '../databaseManager';

const dailyNoteTableStructure: TableStructure = {
  name: 'DailyNotes',
  columns: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    uuid: 'TEXT NOT NULL UNIQUE',
    date: 'TEXT UNIQUE',
    morningComment: 'TEXT',
    energy: 'INTEGER',
    wakeHour: 'TEXT',
    success: 'TEXT',
    beBetter: 'TEXT',
    dayRating: 'INTEGER',
    sleepTime: 'TEXT',
    createdAt: 'TEXT',
    updatedAt: 'TEXT',
    synced: 'INTEGER DEFAULT 0'
  },
  primaryKey: 'id',
  conflictResolutionKey: [
    'uuid'
  ]
};

class DailyNoteTableManager extends BaseTableManager<NoteData> {
  constructor() {
    super(dailyNoteTableStructure);
  }

  async listOrderedByDate(): Promise<(NoteData & { 
    quantifiableHabits: { [key: string]: number },
    booleanHabits: { [key: string]: boolean }
  })[]> {
    const db = await databaseManager.getDatabase();
    const query = `
      SELECT 
        dn.*,
        qh.habitKey AS qh_key, qh.value AS qh_value,
        bh.habitKey AS bh_key, bh.value AS bh_value
      FROM ${this.tableStructure.name} dn
      LEFT JOIN QuantifiableHabits qh ON dn.date = qh.date
      LEFT JOIN BooleanHabits bh ON dn.date = bh.date
      ORDER BY dn.date DESC;
    `;
    const result = await databaseManager.executeSqlAsync(db, query);

    const groupedResults: {
      [date: string]: NoteData & { 
        quantifiableHabits: { [key: string]: number },
        booleanHabits: { [key: string]: boolean }
      }
    } = {};

    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i) as NoteData & {
        qh_key?: string;
        qh_value?: number;
        bh_key?: string;
        bh_value?: number;
      };
      const date = row.date;
      if (!groupedResults[date]) {
        const { qh_key, qh_value, bh_key, bh_value, ...noteData } = row;
        groupedResults[date] = { 
          ...noteData, 
          quantifiableHabits: {}, 
          booleanHabits: {} 
        };
      }
      if (row.qh_key) {
        groupedResults[date].quantifiableHabits[row.qh_key] = row.qh_value!;
      }
      if (row.bh_key) {
        groupedResults[date].booleanHabits[row.bh_key] = Boolean(row.bh_value);
      }
    }

    return Object.values(groupedResults);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<(NoteData & { 
    quantifiableHabits: { [key: string]: number },
    booleanHabits: { [key: string]: boolean }
  })[]> {
    const db = await databaseManager.getDatabase();
    const query = `
      SELECT 
        dn.*,
        qh.habitKey AS qh_key, qh.value AS qh_value,
        bh.habitKey AS bh_key, bh.value AS bh_value
      FROM ${this.tableStructure.name} dn
      LEFT JOIN QuantifiableHabits qh ON dn.date = qh.date
      LEFT JOIN BooleanHabits bh ON dn.date = bh.date
      WHERE dn.date BETWEEN ? AND ?
      ORDER BY dn.date ASC;
    `;
    const result = await databaseManager.executeSqlAsync(db, query, [startDate, endDate]);

    const groupedResults: {
      [date: string]: NoteData & { 
        quantifiableHabits: { [key: string]: number },
        booleanHabits: { [key: string]: boolean }
      }
    } = {};

    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i) as NoteData & {
        qh_key?: string;
        qh_value?: number;
        bh_key?: string;
        bh_value?: number;
      };
      const date = row.date;
      if (!groupedResults[date]) {
        const { qh_key, qh_value, bh_key, bh_value, ...noteData } = row;
        groupedResults[date] = { 
          ...noteData, 
          quantifiableHabits: {}, 
          booleanHabits: {} 
        };
      }
      if (row.qh_key) {
        groupedResults[date].quantifiableHabits[row.qh_key] = row.qh_value!;
      }
      if (row.bh_key) {
        groupedResults[date].booleanHabits[row.bh_key] = Boolean(row.bh_value);
      }
    }

    return Object.values(groupedResults);
  }
}

export const dailyNoteTableManager = new DailyNoteTableManager();