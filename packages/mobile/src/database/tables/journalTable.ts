import { BaseTableManager, TableStructure } from '../baseTable';

import { JournalData } from '@los/shared/src/types/Journal';

const journalTableStructure: TableStructure = {
    name: 'Journal',
    columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        uuid: 'TEXT NOT NULL UNIQUE',
        date: 'TEXT NOT NULL',
        place: 'TEXT',
        text: 'TEXT NOT NULL',
        createdAt: 'TEXT NOT NULL',
        updatedAt: 'TEXT NOT NULL',
    },
    primaryKey: 'id',
    conflictResolutionKey: [
        'uuid'
    ]
};

class JournalTableManager extends BaseTableManager<JournalData> {
    constructor() {
        super(journalTableStructure);
    }
}

export const journalTableManager = new JournalTableManager();