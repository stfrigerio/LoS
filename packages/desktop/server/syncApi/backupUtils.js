const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const dotenv = require('dotenv');
const { logger } = require('../../src/electron/main/logger');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Find the root of the monorepo
const findMonorepoRoot = (startPath) => {
    let currentPath = startPath;
    while (currentPath !== path.parse(currentPath).root) {
        if (fs.existsSync(path.join(currentPath, 'package.json')) &&
            fs.existsSync(path.join(currentPath, 'packages'))) {
            return currentPath;
        }
        currentPath = path.dirname(currentPath);
    }
    throw new Error('Monorepo root not found');
};

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

const MONOREPO_ROOT = findMonorepoRoot(__dirname);
const PARENT_DIR = path.dirname(MONOREPO_ROOT);
const BASE_DIR = path.join(MONOREPO_ROOT, `${DB_NAME}_Database`);
const BACKUPS_DIR = path.join(BASE_DIR, 'Backups');
const LOGS_DIR = path.join(BASE_DIR, 'Logs');

const ADDITIONAL_BACKUP_DIR = path.join(PARENT_DIR, 'DatabaseBackups');
const ADDITIONAL_BASE_DIR = path.join(ADDITIONAL_BACKUP_DIR, `${DB_NAME}_Database`);
const ADDITIONAL_BACKUPS_DIR = path.join(ADDITIONAL_BASE_DIR, 'Backups');
const ADDITIONAL_LOGS_DIR = path.join(ADDITIONAL_BASE_DIR, 'Logs');

const filename = 'backupUtils.js';

// Create main backup directories
if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Check for additional backup directory
let additionalBackupExists = false;
if (fs.existsSync(ADDITIONAL_BACKUP_DIR)) {
    additionalBackupExists = true;
    if (!fs.existsSync(ADDITIONAL_BASE_DIR)) {
        fs.mkdirSync(ADDITIONAL_BASE_DIR, { recursive: true });
        fs.mkdirSync(ADDITIONAL_BACKUPS_DIR, { recursive: true });
        fs.mkdirSync(ADDITIONAL_LOGS_DIR, { recursive: true });
    }
}

const createBackup = () => {
    return new Promise((resolve, reject) => {
        const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
        const backupPath = path.join(BACKUPS_DIR, `${DB_NAME}_${timestamp}.sql`);
        
        // Use a .bat file for Windows
        const batPath = path.join(__dirname, 'backup.bat');
        const batContent = `@echo off
    set PGPASSWORD=${DB_PASSWORD}
    pg_dump -U ${DB_USER} -d ${DB_NAME} -f "${backupPath}"
    `;
        
        fs.writeFileSync(batPath, batContent);
        
        exec(`"${batPath}"`, (error, stdout, stderr) => {
            // Delete the temporary .bat file
            fs.unlinkSync(batPath);
            
            if (error) {
                logger.error('Database', filename, `Error creating backup: ${error.message}`);
                reject(error);
            } else {
                logger.info('Database', filename, `Backup created successfully at ${backupPath}`);
                
                // Copy to additional backup location after successful creation
                if (additionalBackupExists) {
                    try {
                        const additionalBackupPath = path.join(ADDITIONAL_BACKUPS_DIR, `${DB_NAME}_${timestamp}.sql`);
                        fs.copyFileSync(backupPath, additionalBackupPath);
                        logger.info('Database', filename, `Backup copied to additional location: ${additionalBackupPath}`);
                    } catch (copyError) {
                        logger.error('Database', filename, `Error copying backup to additional location: ${copyError.message}`);
                        // Don't reject here, as the main backup was successful
                    }
                }
                
                resolve(backupPath);
            }
        });
    });
};

const saveSummary = async (summary) => {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const summaryPath = path.join(LOGS_DIR, `sync_summary_${timestamp}.json`);
    
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    logger.info('Database', filename, `Summary saved successfully at ${summaryPath}`);
    
    // Save to additional location if it exists
    if (additionalBackupExists) {
        const additionalSummaryPath = path.join(ADDITIONAL_LOGS_DIR, `sync_summary_${timestamp}.json`);
        fs.copyFileSync(summaryPath, additionalSummaryPath);
        logger.info('Database', filename, `Summary also saved at ${additionalSummaryPath}`);
    }
    
    // Overwrite the database with the latest data
    const batPath = path.join(__dirname, 'overwrite.bat');
    const batContent = `@echo off
set PGPASSWORD=${DB_PASSWORD}
psql -U ${DB_USER} -d ${DB_NAME} -f "${summaryPath}"
`;

    fs.writeFileSync(batPath, batContent);

    return new Promise((resolve, reject) => {
        exec(`"${batPath}"`, async (error, stdout, stderr) => {
            // Delete the temporary .bat file
            fs.unlinkSync(batPath);

            if (error) {
                logger.error('Database', filename, `Error overwriting database: ${error.message}`);
                reject(error);
            } else {
                logger.info('Database', filename, `Database overwritten successfully with the latest data`);

                if (additionalBackupExists) {
                    try {
                        const additionalBackupPath = path.join(ADDITIONAL_BACKUPS_DIR, `${DB_NAME}_${timestamp}.sql`);
                        fs.copyFileSync(summaryPath, additionalBackupPath);
                        try {
                            await pushToGitHub();
                        } catch (error) {
                            logger.error('GitHub', filename, `Failed to push to GitHub: ${error.message}`);
                        }
                        logger.info('Database', filename, `Backup copied to additional location: ${additionalBackupPath}`);
                    } catch (copyError) {
                        logger.error('Database', filename, `Error copying backup to additional location: ${copyError.message}`);
                        // Don't reject here, as the main backup was successful
                    }
                }
                resolve(summaryPath);
            }
        });
    });
};

const pushToGitHub = () => {
    return new Promise((resolve, reject) => {
        const commands = [
            `cd "${ADDITIONAL_BACKUP_DIR}"`,
            'git add .',
            'git commit -m "Automatic backup update"',
            'git push origin main'  // Adjust the branch name if necessary
        ].join(' && ');

        exec(commands, (error, stdout, stderr) => {
            if (error) {
                logger.error('GitHub', filename, `Error pushing to GitHub: ${error.message}`);
                reject(error);
            } else {
                logger.info('GitHub', filename, 'Successfully pushed changes to GitHub');
                resolve();
            }
        });
    });
};

module.exports = {
    createBackup,
    saveSummary
};