import { BaseTableManager, TableStructure } from '../baseTable';
import { databaseManager } from '../databaseManager';

import { LibraryData, LibraryQuery } from '@los/shared/src/types/Library';


const libraryTableStructure: TableStructure = {
    name: 'Library',
    columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        uuid: 'TEXT NOT NULL UNIQUE',
        title: 'TEXT NOT NULL',
        seen: 'TEXT NOT NULL',
        type: 'TEXT NOT NULL',
        genre: 'TEXT NOT NULL',
        creator: 'TEXT',
        releaseYear: 'TEXT',
        rating: 'REAL',
        comments: 'TEXT',
        mediaImage: 'TEXT',
        cast: 'TEXT',
        writer: 'TEXT',
        metascore: 'REAL',
        ratingImdb: 'REAL',
        tomato: 'REAL',
        boxOffice: 'TEXT',
        plot: 'TEXT',
        runtime: 'TEXT',
        awards: 'TEXT',
        seasons: 'INTEGER',
        modes: 'TEXT',
        igdbURL: 'TEXT',
        pages: 'INTEGER',
        finished: 'INTEGER DEFAULT 0',
        leftAt: 'TEXT',
        isMarkedForDownload: 'INTEGER DEFAULT 0',
        createdAt: 'TEXT',
        updatedAt: 'TEXT',
    },
    primaryKey: 'id',
    conflictResolutionKey: [
        'uuid'
    ]
};

class LibraryManager extends BaseTableManager<LibraryData> {
    constructor() {
        super(libraryTableStructure);
    }

    async getLibrary(filter: LibraryQuery): Promise<LibraryData[]> {
        const db = await databaseManager.getDatabase();
        let query = `SELECT * FROM ${this.tableStructure.name}`;
        const queryParams = [];
        const conditions = [];

        if (filter.type) {
            conditions.push('type = ?');
            queryParams.push(filter.type);
        }
        if (filter.genre) {
            conditions.push('genre = ?');
            queryParams.push(filter.genre);
        }
        if (filter.finished !== undefined) {
            conditions.push('finished = ?');
            queryParams.push(filter.finished);
        }
        if (filter.search) {
            conditions.push(`title LIKE ?`);
            queryParams.push(`%${filter.search}%`);
        }
        if (filter.isMarkedForDownload !== undefined) {
            conditions.push('isMarkedForDownload = ?');
            queryParams.push(filter.isMarkedForDownload);
        }

        // Handle additional filters from Partial<LibraryData>
        for (const [key, value] of Object.entries(filter)) {
            if (!['type', 'genre', 'finished', 'search', 'sort', 'limit', 'offset', 'isMarkedForDownload'].includes(key) && value !== undefined) {
                conditions.push(`${key} = ?`);
                queryParams.push(value);
            }
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        if (filter.sort) {
            switch (filter.sort) {
                case 'year':
                    query += ' ORDER BY releaseYear DESC';
                    break;
                case 'rating':
                    query += ' ORDER BY rating DESC';
                    break;
                case 'seen':
                    query += ' ORDER BY seen DESC';
                    break;
                default:
                    query += ' ORDER BY releaseYear DESC';
            }
        } else {
            query += ' ORDER BY releaseYear DESC';
        }

        // Pagination
        if (filter.limit !== undefined && filter.offset !== undefined) {
            query += ' LIMIT ? OFFSET ?';
            queryParams.push(filter.limit, filter.offset);
        }

        const result = await databaseManager.executeSqlAsync(db, query, queryParams);
        return result.rows._array as LibraryData[];
    }
}

export const libraryManager = new LibraryManager();