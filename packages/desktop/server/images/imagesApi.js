const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { logger } = require('../../src/electron/main/logger');
const crypto = require('crypto');

// Define the path to the imageLibrary folder
const IMAGE_LIBRARY_PATH = path.join(__dirname, '../../../../imageLibrary');

// Ensure the imageLibrary directory exists
if (!fs.existsSync(IMAGE_LIBRARY_PATH)) {
    fs.mkdirSync(IMAGE_LIBRARY_PATH, { recursive: true });
}

/**
 * Helper function to get month name from a date string
 * @param {string} dateStr - Date in 'YYYY-MM-DD' format
 * @returns {string} - Full month name (e.g., 'April')
 */
function getMonthName(dateStr) {
    const date = new Date(dateStr);
    const options = { month: 'long' };
    return date.toLocaleString('default', options);
}

/**
 * Helper function to get the next available filename for a given date
 * @param {string} month - Month name
 * @param {string} dateStr - Date in 'YYYY-MM-DD' format
 * @returns {string} - Filename with progressive number (e.g., '2024-04-25_1.jpg')
 */
function getNextFilename(month, dateStr) {
    const monthPath = path.join(IMAGE_LIBRARY_PATH, month);
    if (!fs.existsSync(monthPath)) {
        fs.mkdirSync(monthPath, { recursive: true });
    }

    const files = fs.readdirSync(monthPath).filter(file => file.startsWith(dateStr));
    const numbers = files.map(file => {
        const match = file.match(/_(\d+)\./);
        return match ? parseInt(match[1], 10) : 0;
    });
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `${dateStr}_${nextNumber}.jpg`;
}

/**
 * POST /images/upload
 * Body Parameters:
 * - date: string (format 'YYYY-MM-DD')
 * - images: array of base64 encoded image strings
 */
router.post('/upload', async (req, res) => {
    try {
        const { date, images } = req.body;

        if (!date || !images || !Array.isArray(images)) {
            return res.status(400).json({ error: 'Invalid request body. "date" and "images" are required.' });
        }

        const monthName = getMonthName(date);
        const monthPath = path.join(IMAGE_LIBRARY_PATH, monthName);

        if (!fs.existsSync(monthPath)) {
            fs.mkdirSync(monthPath, { recursive: true });
        }

        const savedImages = [];
        const duplicates = [];

        for (const base64Image of images) {
            const buffer = Buffer.from(base64Image, 'base64');
            const imageHash = crypto.createHash('md5').update(buffer).digest('hex');

            // Check for duplicates
            const isDuplicate = fs.readdirSync(monthPath).some(file => {
                const existingFilePath = path.join(monthPath, file);
                const existingBuffer = fs.readFileSync(existingFilePath);
                const existingHash = crypto.createHash('md5').update(existingBuffer).digest('hex');
                return imageHash === existingHash;
            });

            if (isDuplicate) {
                duplicates.push(imageHash);
            } else {
                // Save non-duplicate image
                const filename = getNextFilename(monthName, date);
                const filePath = path.join(monthPath, filename);
                fs.writeFileSync(filePath, buffer);
                savedImages.push(path.join(monthName, filename));
            }
        }

        logger.log('Database', 'imagesApi.js', `Saved ${savedImages.length} images to ${monthPath}, ${duplicates.length} duplicates skipped`);
        res.status(200).json({ success: true, savedImages, duplicates: duplicates.length });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
