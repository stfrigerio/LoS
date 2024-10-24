import { databaseManager } from './databaseManager';
import * as SQLite from 'expo-sqlite';

export interface TableStructure {
	name: string;
	columns: {
		[key: string]: string;
	};
	primaryKey: string;
	foreignKeys?: string[];
	uniqueConstraints?: string[];
	conflictResolutionKey?: string | string[];
}

export interface BaseEntry {
	uuid?: string;
	createdAt?: string;
	updatedAt?: string;
}

export class BaseTableManager<T> {
	protected tableStructure: TableStructure;

	constructor(tableStructure: TableStructure) {
		this.tableStructure = tableStructure;
	}

	async initialize(): Promise<void> {
		const db = await databaseManager.getDatabase();
		await this.createTable(db);
	}

	async getByUniqueConstraint(constraintKey: string, value: any): Promise<T | null> {
		const db = await databaseManager.getDatabase();
		const query = `SELECT * FROM ${this.tableStructure.name} WHERE ${constraintKey} = ? LIMIT 1;`;
		const result = await databaseManager.executeSqlAsync(db, query, [value]);

		if (result.rows.length > 0) {
			return result.rows.item(0) as T;
		} else {
			return null;
		}
	}

	//* Standardised methods
	async upsert<T extends BaseEntry>(data: T, isSync = false): Promise<T> {
		try {
			const db = await databaseManager.getDatabase();
			const now = new Date().toISOString();
	
			// Ensure uuid is assigned
			if (!data.uuid) {
				data.uuid = databaseManager.generateUuid();
			}
	
			// Handling timestamps
			if (!data.createdAt) {
				data.createdAt = now;
			}

			if (!isSync) {
				data.updatedAt = now;
			}

			// Special handling for UserSettings table
			if (this.tableStructure.name === 'UserSettings' && 'settingKey' in data) {
				const existingRecord = await this.getByUniqueConstraint('settingKey', data.settingKey);
				if (existingRecord) {
					// Update the existing record with the new data
					const updateColumns = Object.keys(data)
						.filter(col => col !== 'uuid' && col !== 'createdAt')
						.map(col => `${col} = ?`)
						.join(', ');
					const updateValues = Object.keys(data)
						.filter(col => col !== 'uuid' && col !== 'createdAt')
						.map(col => data[col as keyof T]);
					const updateQuery = `UPDATE ${this.tableStructure.name} SET ${updateColumns} WHERE settingKey = ?;`;
					await databaseManager.executeSqlAsync(db, updateQuery, [...updateValues, data.settingKey]);

					const updatedRecord = await this.getByUniqueConstraint('settingKey', data.settingKey);
					if (updatedRecord) {
						return updatedRecord as T;
					} else {
						throw new Error(`Failed to retrieve updated record for ${this.tableStructure.name}`);
					}
				}
			}
	
			// Prepare columns and placeholders for SQL
			const columns = Object.keys(data);
			const placeholders = columns.map(() => '?').join(', ');
			const values = Object.values(data);

			// Create SQL query with conflict handling
			const conflictKeys = ['uuid'];  // Assuming uuid is used for conflict resolution
			const updateClauses = columns
				.filter(col => !['uuid', 'createdAt'].includes(col))  // Exclude uuid and createdAt from updates
				.map(col => `${col} = EXCLUDED.${col}`)
				.join(', ');
	
			const query = `
				INSERT INTO ${this.tableStructure.name} (${columns.join(', ')})
				VALUES (${placeholders})
				ON CONFLICT(${conflictKeys.join(', ')})
				DO UPDATE SET
					${updateClauses},
					updatedAt = EXCLUDED.updatedAt;
			`;
	
			// Execute the query
			await databaseManager.executeSqlAsync(db, query, values);
			console.log(`Upserted ${this.tableStructure.name} with values ${JSON.stringify(data)}`);
	
			// Fetch the upserted row
			const selectQuery = `SELECT * FROM ${this.tableStructure.name} WHERE uuid = ? LIMIT 1;`;
			const result = await databaseManager.executeSqlAsync(db, selectQuery, [data.uuid]);
	
			if (result.rows.length > 0) {
				return result.rows.item(0) as T;
			} else {
				throw new Error(`Failed to upsert ${this.tableStructure.name}`);
			}
		} catch (error) {
			console.error('Error in upsert:', error);
			console.error('Data causing error:', JSON.stringify(data, null, 2));
			throw error;
		}
	}

	async list(): Promise<T[]> {
		const db = await databaseManager.getDatabase();
		const query = `SELECT * FROM ${this.tableStructure.name};`;
		const result = await databaseManager.executeSqlAsync(db, query);

		return result.rows._array as T[];
	}

	protected async logDeletion(tableName: string, recordUuid: string): Promise<void> {
		const db = await databaseManager.getDatabase();
		const query = `INSERT INTO DeletionLog (tableName, recordUuid, deletedAt, synced) VALUES (?, ?, ?, ?);`;
		await databaseManager.executeSqlAsync(db, query, [
			tableName,
			recordUuid,
			new Date().toISOString(),
			0
		]);
	}

	async remove(id: any): Promise<void> {
		console.log(`Removing ${this.tableStructure.name} with id ${id}`);
		const db = await databaseManager.getDatabase();

		// Get the uuid of the record to be removed
		const uuidQuery = `SELECT uuid FROM ${this.tableStructure.name} WHERE ${this.tableStructure.primaryKey} = ?;`;
		const uuidResult = await databaseManager.executeSqlAsync(db, uuidQuery, [id]);
		
		if (uuidResult.rows.length > 0) {
			const uuid = uuidResult.rows.item(0).uuid;

			if (this.tableStructure.name === 'DailyNotes') {
				// Get the date of the DailyNote to be removed
				const dateQuery = `SELECT date FROM ${this.tableStructure.name} WHERE ${this.tableStructure.primaryKey} = ?;`;
				const dateResult = await databaseManager.executeSqlAsync(db, dateQuery, [id]);

				if (dateResult.rows.length > 0) {
					const date = dateResult.rows.item(0).date;
				
					// Remove associated BooleanHabits
					await databaseManager.executeSqlAsync(db, `DELETE FROM BooleanHabits WHERE date = ?;`, [date]);
					await this.logDeletion(this.tableStructure.name, uuid);
				
					// Remove associated QuantifiableHabits
					await databaseManager.executeSqlAsync(db, `DELETE FROM QuantifiableHabits WHERE date = ?;`, [date]);
					await this.logDeletion('QuantifiableHabits', `${date}`);
				}
			}

			// Remove the main entry
			const query = `DELETE FROM ${this.tableStructure.name} WHERE ${this.tableStructure.primaryKey} = ?;`;
			await databaseManager.executeSqlAsync(db, query, [id]);

			// Log the deletion
			await this.logDeletion(this.tableStructure.name, uuid);
			console.log(`Logged deletion for ${this.tableStructure.name} with uuid ${uuid}`);
		} else {
			console.warn(`No record found with id ${id} in ${this.tableStructure.name}`);
		}
	}

	async removeByUuid(uuid: string): Promise<void> {
		console.log(`Removing ${this.tableStructure.name} with uuid ${uuid}`);
		const db = await databaseManager.getDatabase();
		const query = `DELETE FROM ${this.tableStructure.name} WHERE uuid = ?;`;
		await databaseManager.executeSqlAsync(db, query, [uuid]);

		// Log the deletion
		await this.logDeletion(this.tableStructure.name, uuid);
		console.log(`Logged deletion for ${this.tableStructure.name} with uuid ${uuid}`);
	}

	//* Specific methods
	async createTable(db: SQLite.SQLiteDatabase): Promise<void> {
		const columns = Object.entries(this.tableStructure.columns)
			.map(([name, type]) => `${name} ${type}`)
			.join(', ');
	
		let constraints = [];
	
		// Only add PRIMARY KEY constraint if it's not already in the column definition
		if (!columns.includes('PRIMARY KEY')) {
			constraints.push(`PRIMARY KEY (${this.tableStructure.primaryKey})`);
		}
	
		if (this.tableStructure.foreignKeys) {
			constraints.push(...this.tableStructure.foreignKeys);
		}
	
		// Add UNIQUE constraint for conflictResolutionKey
		if (this.tableStructure.conflictResolutionKey) {
			const conflictKeys = Array.isArray(this.tableStructure.conflictResolutionKey)
				? this.tableStructure.conflictResolutionKey
				: [this.tableStructure.conflictResolutionKey];
			constraints.push(`UNIQUE (${conflictKeys.join(', ')})`);
		}
	
		const constraintsClause = constraints.length > 0 ? `, ${constraints.join(', ')}` : '';
	
		const createTableQuery = `
			CREATE TABLE IF NOT EXISTS ${this.tableStructure.name} (
				${columns}${constraintsClause}
			);
		`;
	
		await databaseManager.executeSqlAsync(db, createTableQuery);
		console.log(`${this.tableStructure.name} table created successfully`);
	}

	async getById(id: any): Promise<T> {
		const db = await databaseManager.getDatabase();
		const query = `SELECT * FROM ${this.tableStructure.name} WHERE ${this.tableStructure.primaryKey} = ?;`;
		const result = await databaseManager.executeSqlAsync(db, query, [id]);

		if (result.rows.length > 0) {
			return result.rows.item(0) as T;
		} else {
			throw new Error(`No record found with id ${id}`);
		}
	}

	async getByDate(date: string): Promise<T[]> {
		const db = await databaseManager.getDatabase();
		const query = `SELECT * FROM ${this.tableStructure.name} WHERE date = ?;`;
		const result = await databaseManager.executeSqlAsync(db, query, [date]);

		if (result.rows.length > 0) {
			return result.rows._array as T[];
		} else {
			return [];
		}
	}

	async getByUuid(uuid: any): Promise<T> {
		const db = await databaseManager.getDatabase();
		const query = `SELECT * FROM ${this.tableStructure.name} WHERE uuid = ?;`;
		const result = await databaseManager.executeSqlAsync(db, query, [uuid]);

		if (result.rows.length > 0) {
			return result.rows.item(0) as T;
		} else {
			throw new Error(`No record found with uuid ${uuid}`);
		}
	}

	async getByDateRange(startDate: string, endDate: string): Promise<T[]> {
		const db = await databaseManager.getDatabase();
		const query = `SELECT * FROM ${this.tableStructure.name} WHERE date BETWEEN ? AND ? ORDER BY date ASC;`;
		const result = await databaseManager.executeSqlAsync(db, query, [startDate, endDate]);

		return result.rows._array as T[];
	}
}