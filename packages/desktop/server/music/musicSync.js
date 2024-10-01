const fs = require('fs').promises;
const path = require('path');
const logger = require('../../src/electron/main/logger');

const filename = 'musicSync.js';

class MusicSync {
    constructor(musicLibraryPath) {
        this.musicLibraryPath = musicLibraryPath;
    }

    async initialize() {
        await this.ensureFolderExists();
    }

    async ensureFolderExists() {
        await fs.mkdir(this.musicLibraryPath, { recursive: true });
    }

    async getAlbumList() {
        const albums = await fs.readdir(this.musicLibraryPath);
        return albums.filter(album => !album.startsWith('.'));
    }

    async getAlbumFiles(albumName) {
        const albumPath = path.join(this.musicLibraryPath, albumName);
        const files = await fs.readdir(albumPath);
        return files.map(file => ({
            name: file,
            path: path.join(albumPath, file)
        }));
    }

    async prepareAlbumForSync(albumName) {
        return this.getAlbumFiles(albumName);
    }

    async getFilePath(albumName, fileName) {
        const filePath = path.join(this.musicLibraryPath, albumName, fileName);
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        if (!fileExists) {
            logger.error('Database', filename, `File not found: ${filePath}`);
            throw new Error('File not found');
        }
        return filePath;
    }
}

module.exports = MusicSync;