import { BaseTableManager, TableStructure } from '../baseTable';
import { databaseManager } from '../databaseManager';

import { PersonData } from '@los/shared/src/types/People';

const peopleTableStructure: TableStructure = {
    name: 'People',
    columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        uuid: 'TEXT NOT NULL UNIQUE',
        name: 'TEXT NOT NULL',
        middleName: 'TEXT',
        lastName: 'TEXT NOT NULL',
        birthDay: 'TEXT',
        email: 'TEXT',
        phoneNumber: 'TEXT',
        address: 'TEXT',
        city: 'TEXT',
        state: 'TEXT',
        pronouns: 'TEXT',
        category: 'TEXT NOT NULL',
        notificationEnabled: 'TEXT NOT NULL',
        frequencyOfContact: 'TEXT',
        occupation: 'TEXT',
        partner: 'TEXT',
        likes: 'TEXT',
        dislikes: 'TEXT',
        description: 'TEXT',
        aliases: 'TEXT',
        country: 'TEXT',
        createdAt: 'TEXT',
        updatedAt: 'TEXT',
        synced: 'INTEGER DEFAULT 0',
    },
    primaryKey: 'id',
    conflictResolutionKey: [
        'uuid'
    ]
};

class PeopleTableManager extends BaseTableManager<PersonData> {
    constructor() {
        super(peopleTableStructure);
    }

    async getAllBirthdays(): Promise<{ uuid: string; name: string; birthDay: string }[]> {
        const db = await databaseManager.getDatabase();
        const query = `SELECT uuid, name, birthDay FROM ${this.tableStructure.name} WHERE birthDay IS NOT NULL AND birthDay != ''`;
        const results = await databaseManager.executeSqlAsync(db, query);
        return results.rows._array;
    }
}

export const peopleTableManager = new PeopleTableManager();