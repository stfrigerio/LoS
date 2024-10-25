import { BaseTableManager, TableStructure } from '../baseTable';
import { databaseManager } from '../databaseManager';
import { TrackData } from '@los/shared/src/types/Library';

export interface MusicQuery {
    libraryUuid?: string;
    trackName?: string;
    fileName?: string;
    sort?: 'popularity' | 'trackNumber' | 'playCount';
    limit?: number;
    offset?: number;
}

const musicTableStructure: TableStructure = {
    name: 'Music',
    columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        uuid: 'TEXT NOT NULL UNIQUE',
        libraryUuid: 'TEXT NOT NULL',
        trackName: 'TEXT NOT NULL',
        fileName: 'TEXT',
        trackNumber: 'INTEGER NOT NULL',
        durationMs: 'INTEGER NOT NULL',
        popularity: 'INTEGER',
        previewUrl: 'TEXT',
        tempo: 'REAL NOT NULL',
        key: 'TEXT NOT NULL',
        mode: 'TEXT NOT NULL',
        timeSignature: 'TEXT NOT NULL',
        danceability: 'INTEGER NOT NULL',
        energy: 'INTEGER NOT NULL',
        speechiness: 'INTEGER NOT NULL',
        acousticness: 'INTEGER NOT NULL',
        instrumentalness: 'INTEGER NOT NULL',
        liveness: 'INTEGER NOT NULL',
        valence: 'INTEGER NOT NULL',
        playCount: 'INTEGER DEFAULT 0',
        rating: 'INTEGER DEFAULT 0',
        createdAt: 'TEXT NOT NULL',
        updatedAt: 'TEXT NOT NULL'
    },
    primaryKey: 'id',
    foreignKeys: [
        'FOREIGN KEY(libraryUuid) REFERENCES Library(uuid) ON DELETE CASCADE'
    ],
    conflictResolutionKey: [
        'uuid'
    ]
};

class MusicManager extends BaseTableManager<TrackData> {
    constructor() {
        super(musicTableStructure);
    }

    async getMusicTracks(filter: MusicQuery): Promise<TrackData[]> {
        const db = await databaseManager.getDatabase();
        let query = `SELECT * FROM ${this.tableStructure.name}`;
        const queryParams = [];
        const conditions = [];

        if (filter.libraryUuid) {
            conditions.push('libraryUuid = ?');
            queryParams.push(filter.libraryUuid);
        }

        if (filter.trackName) {
            conditions.push('trackName LIKE ?');
            queryParams.push(`%${filter.trackName}%`);
        }

        if (filter.fileName) {
            conditions.push('fileName = ?');
            queryParams.push(filter.fileName);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        if (filter.sort) {
            switch (filter.sort) {
                case 'popularity':
                    query += ' ORDER BY popularity DESC';
                    break;
                case 'trackNumber':
                    query += ' ORDER BY trackNumber ASC';
                    break;
                case 'playCount':
                    query += ' ORDER BY playCount DESC';
                    break;
                default:
                    query += ' ORDER BY trackNumber ASC';
            }
        } else {
            query += ' ORDER BY trackNumber ASC';
        }

        if (filter.limit !== undefined && filter.offset !== undefined) {
            query += ' LIMIT ? OFFSET ?';
            queryParams.push(filter.limit, filter.offset);
        }

        const result = await databaseManager.executeSqlAsync(db, query, queryParams);
        return result.rows._array as TrackData[];
    }

    async incrementPlayCount(uuid: string): Promise<void> {
        const db = await databaseManager.getDatabase();
        const query = `
            UPDATE ${this.tableStructure.name} 
            SET playCount = playCount + 1 
            WHERE uuid = ?
        `;
        await databaseManager.executeSqlAsync(db, query, [uuid]);
    }

    async getTracksByLibraryUuid(libraryUuid: string): Promise<TrackData[]> {
        return this.getMusicTracks({ libraryUuid });
    }

    async getMostPlayed(limit: number = 10): Promise<TrackData[]> {
        return this.getMusicTracks({ 
            sort: 'playCount',
            limit
        });
    }
}

export const musicManager = new MusicManager();