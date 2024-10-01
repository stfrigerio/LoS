import { BaseTableManager, TableStructure } from '../baseTable';
import { databaseManager } from '../databaseManager';

import { ContactData } from '@los/shared/src/types/Contact';

const contactsTableStructure: TableStructure = {
    name: 'Contact',
    columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        uuid: 'TEXT NOT NULL UNIQUE',
        personId: 'INTEGER NOT NULL',
        dateOfContact: 'TEXT NOT NULL',
        source: 'TEXT',
        type: 'TEXT',
        peopleName: 'TEXT',
        peopleLastname: 'TEXT',
        createdAt: 'TEXT',
        updatedAt: 'TEXT',
        synced: 'INTEGER DEFAULT 0',
    },
    primaryKey: 'id',
    conflictResolutionKey: [
        'uuid'
    ],
    foreignKeys: [
        'FOREIGN KEY (personId) REFERENCES People(id)'
    ]
};

class ContactTableManager extends BaseTableManager<ContactData> {
    constructor() {
        super(contactsTableStructure);
    }
    
    async listOrderedByCreatedAt(): Promise<ContactData[]> {
        const db = await databaseManager.getDatabase();
        try {
            const query = `
                SELECT * FROM ${this.tableStructure.name}
                ORDER BY createdAt DESC
            `;
            const result = await databaseManager.executeSqlAsync(db, query);
            return result.rows._array as ContactData[];
        } catch (error) {
            console.error('Error in listOrderedByDate:', error);
            throw error;
        }
    }
}

export const contactTableManager = new ContactTableManager();