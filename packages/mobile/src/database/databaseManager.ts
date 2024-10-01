import * as SQLite from 'expo-sqlite';
import * as MediaLibrary from 'expo-media-library';

import { capitalizedTableNames } from '@los/shared/src/utilities/tableNames';

class DatabaseManager {
    db: SQLite.SQLiteDatabase | null;
    initializePromise: Promise<SQLite.SQLiteDatabase> | null;

    constructor() {
        this.db = null;
        this.initializePromise = this.checkAndRequestPermissions()
            .then(() => this.initializeDatabase())
            .catch((error) => {
                console.log('Error initializing database: ', error);
                return Promise.reject(error);
            });
    }

    async checkAndRequestPermissions(): Promise<void> {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Permission not granted');
        }
    }

    async dropAllTables(): Promise<void> {
        const tables = [...capitalizedTableNames, "QuantifiableHabits", "BooleanHabits", "DeletionLog"];
    
        return new Promise((resolve, reject) => {
            // Ensure db is not null before proceeding
            if (!this.db) {
                console.error('Database not initialized');
                return Promise.reject('Database not initialized');
            }
            this.db.transaction(tx => {
                tables.forEach((table, index) => {
                tx.executeSql(
                    `DROP TABLE IF EXISTS ${table};`,
                    [],
                    () => {
                        console.log(`${table} table dropped`);
                        // If this is the last table, resolve the promise
                        if (index === tables.length - 1) {
                            resolve();
                        }
                    },
                    (_, error) => {
                    console.error(`Error dropping ${table} table:`, error);
                    reject(error);
                    return true; // to indicate an error occurred
                    }
                );
                });
            }, (error) => {
                reject(error);
            });
        });
    }

    async dropTable(tableName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                console.error('Database not initialized');
                return reject('Database not initialized');
            }
        
            this.db.transaction(tx => {
                tx.executeSql(
                `DROP TABLE IF EXISTS ${tableName};`,
                [],
                (_, result) => {
                    console.log(`${tableName} table dropped successfully`);
                    resolve();
                },
                (_, error) => {
                    console.error(`Error dropping ${tableName} table:`, error);
                    reject(error);
                    return true; // to indicate an error occurred
                }
                );
            }, (error) => {
                console.error('Transaction error:', error);
                reject(error);
            });
        });
    }

    initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
        try {
            this.db = SQLite.openDatabase('LocalDB.db');
            return Promise.resolve(this.db);
        } catch (error) {
            console.error('Error opening database:', error);
            return Promise.reject(error);
        }
    }

    async checkDatabaseConnection(): Promise<SQLite.SQLiteDatabase> {
        try {
            this.db = SQLite.openDatabase('LocalDB.db');
            console.log('Database opened... Testing connection for all tables...');
            
            for (const tableName of [...capitalizedTableNames, 'DeletionLog']) {
                try {
                    await this.executeSqlAsync(this.db, `SELECT * FROM ${tableName} LIMIT 1;`);
                    // console.log(`Connection successful, ${tableName} table exists`);
                } catch (sqlError) {
                    console.log(`Error executing SQL for ${tableName}, table might not exist:`, sqlError);
                    throw sqlError;
                }
            }
            
            return this.db;
        } catch (error) {
            console.error('Error opening or initializing database:', error);
            throw error;
        }
    }

    getDatabase(): Promise<SQLite.SQLiteDatabase> {
        if (!this.db) {
            this.initializePromise = this.initializeDatabase();
        }
        return this.initializePromise as Promise<SQLite.SQLiteDatabase>;
    }

    executeSqlAsync = (db: SQLite.SQLiteDatabase, sql: string, params: any[] = []): Promise<SQLite.SQLResultSet> => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                sql,
                params,
                (_, result) => resolve(result),
                (_, error) => {
                    reject(error);
                    return false; // Return false to rollback the transaction on error.
                }
                );
            });
        });
    };

    generateUuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

export const databaseManager = new DatabaseManager();