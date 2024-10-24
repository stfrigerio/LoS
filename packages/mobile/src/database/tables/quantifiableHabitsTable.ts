import { BaseTableManager, TableStructure } from '../baseTable';
import { databaseManager } from '../databaseManager';

import { QuantifiableHabitsData } from '@los/shared/src/types/QuantifiableHabits';

const quantifiableHabitsTableStructure: TableStructure = {
	name: 'QuantifiableHabits',
	columns: {
		id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		uuid: 'TEXT NOT NULL UNIQUE',
		date: 'TEXT NOT NULL',
		habitKey: 'TEXT NOT NULL',
		value: 'INTEGER NOT NULL',
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

class QuantifiableHabitsManager extends BaseTableManager<QuantifiableHabitsData> {
	constructor() {
		super(quantifiableHabitsTableStructure);
	}

	async getHabitByDateAndKey(date: string, habitKey: string): Promise<QuantifiableHabitsData | null> {
		const db = await databaseManager.getDatabase();
		const query = `SELECT * FROM ${this.tableStructure.name} WHERE date = ? AND habitKey = ? LIMIT 1;`;
		const results = await databaseManager.executeSqlAsync(db, query, [date, habitKey]);
		
		if (results.rows.length > 0) {
			return results.rows.item(0) as QuantifiableHabitsData;
		} else {
			return null;
		}
	}

	async listOrderedByDate(): Promise<QuantifiableHabitsData[]> {
		const db = await databaseManager.getDatabase();
		const query = `SELECT * FROM ${this.tableStructure.name} ORDER BY date(date) DESC, datetime(createdAt) DESC;`;
		const results = await databaseManager.executeSqlAsync(db, query, []);
		
		return Array.from({ length: results.rows.length }, (_, i) => {
			const row = results.rows.item(i);
			return { ...row, value: Number(row.value) } as QuantifiableHabitsData;
		});
	}
}

export const quantifiableHabitsManager = new QuantifiableHabitsManager();