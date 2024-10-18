const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const MusicSync = require('./musicSync');
const contentDisposition = require('content-disposition');
const { logger } = require('../../src/electron/main/logger');

const musicLibraryPath = path.join(__dirname, '../../../../musicLibrary');
const musicSync = new MusicSync(musicLibraryPath);

musicSync.initialize();

const filename = 'musicApi.js';

module.exports = {
    getAlbumList: async (req, res) => {
        try {
            const albums = await musicSync.getAlbumList();
            res.json(albums);
        } catch (error) {
            logger.error('Database', filename, 'Failed to get album list:', error);
            res.status(500).json({ error: 'Failed to get album list' });
        }
    },

    getAlbumFiles: async (req, res) => {
        try {
            const { albumName } = req.params;
            const files = await musicSync.getAlbumFiles(albumName);
            res.json(files);
        } catch (error) {
            logger.error('Database', filename, `Failed to get album files for ${req.params.albumName}:`, error);
            res.status(500).json({ error: 'Failed to get album files' });
        }
    },

    prepareAlbumForSync: async (req, res) => {
        try {
            const { albumName } = req.params;
            const files = await musicSync.prepareAlbumForSync(albumName);
            res.json(files);
        } catch (error) {
            logger.error('Database', filename, `Failed to prepare album for sync: ${req.params.albumName}`, error);
            res.status(500).json({ error: 'Failed to prepare album for sync' });
        }
    },

    removeAlbumFromSync: async (req, res) => {
        try {
            const { albumName } = req.params;
            await musicSync.removeAlbumFromSync(albumName);
            res.sendStatus(200);
        } catch (error) {
            logger.error('Database', filename, `Failed to remove album from sync: ${req.params.albumName}`, error);
            res.status(500).json({ error: 'Failed to remove album from sync' });
        }
    },

    getFile: async (req, res) => {
        try {
            const { albumName, fileName } = req.params;
            
            const filePath = await musicSync.getFilePath(albumName, fileName);
            
            const fileExists = await fsPromises.access(filePath).then(() => true).catch(() => false);
            if (!fileExists) {
                logger.error('Database', filename, `File not found: ${filePath}`);
                return res.status(404).json({ error: 'File not found' });
            }
            
            // Get file stats for Content-Length header
            const stats = await fsPromises.stat(filePath);
            
            // Set appropriate headers
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Length', stats.size);
            res.setHeader('Content-Disposition', contentDisposition(fileName));
            
            // Stream the file
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
            
            res.on('finish', () => {
                logger.log('Database', filename, `File sent successfully: ${filePath}`);
            });
        } catch (error) {
            logger.error('Database', filename, `Failed to get file: ${req.params.albumName}/${req.params.fileName}`, error);
            res.status(500).json({ error: 'Failed to get file', details: error.message });
        }
    }
};