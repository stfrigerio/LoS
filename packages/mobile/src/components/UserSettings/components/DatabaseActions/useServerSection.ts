import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { databaseManagers } from '@los/mobile/src/database/tables';
import { uploadDatabase, downloadDatabase } from './syncService';

type BackupFormat = 'json' | 'sqlite';
type BackupAction = 'export' | 'import' | 'share';

interface AlertConfig {
    title: string;
    message: string;
    onConfirm: () => void;
    customButtons?: Array<{ text: string; onPress: () => void }>;
}

export const useServerSection = () => {
    const [serverURL, setServerURL] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

    useEffect(() => {
        fetchServerURL();
    }, []);

    const fetchServerURL = async () => {
        try {
            const setting = await databaseManagers.userSettings.getByKey('serverUrl');
            if (setting) {
                setServerURL(setting.value);
            }
        } catch (error) {
            console.error('Failed to fetch server URL:', error);
        }
    };

    const saveServerURL = async () => {
        try {
            let urlToSave = serverURL.trim();
            urlToSave = urlToSave.replace(/^https?:\/\//, '');
            urlToSave = urlToSave.split(':')[0];

            const existingSetting = await databaseManagers.userSettings.getByKey('serverUrl');
            const newSetting = {
                settingKey: 'serverUrl',
                value: urlToSave,
                type: 'appSettings',
                uuid: existingSetting?.uuid
            };

            await databaseManagers.userSettings.upsert(newSetting);
            console.log(`Server URL saved successfully: ${urlToSave}`);
        } catch (error) {
            console.error('Failed to save server URL:', error);
        }
    };

    const showAlert = (config: AlertConfig) => {
        setAlertConfig(config);
    };

    const showFormatSelector = (action: BackupAction) => {
        showAlert({
            title: 'Select Format',
            message: 'Which format would you like to use?',
            onConfirm: () => {},
            customButtons: [
                {
                    text: 'JSON',
                    onPress: () => handleBackupAction(action, 'json')
                },
                {
                    text: 'SQLite',
                    onPress: () => handleBackupAction(action, 'sqlite')
                }
            ]
        });
    };

    const handleBackupAction = async (action: BackupAction, format: BackupFormat) => {
        const actions = {
            export: { json: exportDatabaseJson, sqlite: exportDatabaseSqlite },
            import: { json: importDatabaseJson, sqlite: importDatabaseSqlite },
            share: { json: shareBackupJson, sqlite: shareBackupSqlite }
        };

        await actions[action][format]();
    };

    const exportDatabaseJson = async () => {
        try {
            const data: Record<string, any> = {};
            for (const table in databaseManagers) {
                if (Object.prototype.hasOwnProperty.call(databaseManagers, table)) {
                    data[table] = await databaseManagers[table as keyof typeof databaseManagers].list();
                }
            }
            const jsonString = JSON.stringify(data);
            
            // Upload JSON data to server instead of saving locally
            const result = await uploadDatabase(jsonString, 'json');
            if (result.success) {
                showAlert({
                    title: 'Success',
                    message: 'JSON backup uploaded successfully',
                    onConfirm: () => {}
                });
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Failed to export JSON backup:', error);
            showAlert({
                title: 'Error',
                message: `Failed to export JSON backup: ${error}`,
                onConfirm: () => {}
            });
        }
    };

    const exportDatabaseSqlite = async () => {
        try {
            const result = await uploadDatabase();
            if (result.success) {
                showAlert({
                    title: 'Success',
                    message: 'SQLite database exported successfully',
                    onConfirm: () => {}
                });
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Failed to export SQLite database:', error);
            showAlert({
                title: 'Error',
                message: `Failed to export SQLite database: ${error}`,
                onConfirm: () => {}
            });
        }
    };

    const importDatabaseJson = async () => {
        const path = FileSystem.documentDirectory + 'database_backup.json';
        showAlert({
            title: 'Confirm Import',
            message: `Are you sure you want to import the JSON backup from:\n${path}?`,
            onConfirm: async () => {
                setIsImporting(true);
                try {
                    const jsonString = await FileSystem.readAsStringAsync(path);
                    const data = JSON.parse(jsonString);
                    
                    for (const table in data) {
                        for (const item of data[table]) {
                            const manager = databaseManagers[table as keyof typeof databaseManagers];
                            if (manager) {
                                try {
                                    if (table === 'userSettings') {
                                        const existingItem = await databaseManagers.userSettings.getByKey(item.settingKey);
                                        if (!existingItem) {
                                            await databaseManagers.userSettings.upsert(item);
                                        }
                                    } else {
                                        await manager.upsert(item);
                                    }
                                } catch (itemError) {
                                    console.warn(`Failed to upsert item in ${table}:`, itemError);
                                }
                            }
                        }
                    }
                    showAlert({
                        title: 'Success',
                        message: 'Database imported successfully',
                        onConfirm: () => {}
                    });
                } catch (error) {
                    console.error('Failed to import database:', error);
                    showAlert({
                        title: 'Error',
                        message: 'Failed to import database.',
                        onConfirm: () => {}
                    });
                } finally {
                    setIsImporting(false);
                }
            }
        });
    };

    const importDatabaseSqlite = async () => {
        showAlert({
            title: 'Confirm Import',
            message: 'Are you sure you want to import the SQLite database?',
            onConfirm: async () => {
                setIsImporting(true);
                try {
                    const result = await downloadDatabase();
                    if (result.success) {
                        showAlert({
                            title: 'Success',
                            message: 'SQLite database imported successfully',
                            onConfirm: () => {}
                        });
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    console.error('Failed to import SQLite database:', error);
                    showAlert({
                        title: 'Error',
                        message: `Failed to import SQLite database: ${error}`,
                        onConfirm: () => {}
                    });
                } finally {
                    setIsImporting(false);
                }
            }
        });
    };

    const shareBackupJson = async () => {
        try {
            // Generate database JSON
            const data: Record<string, any> = {};
            for (const table in databaseManagers) {
                if (Object.prototype.hasOwnProperty.call(databaseManagers, table)) {
                    data[table] = await databaseManagers[table as keyof typeof databaseManagers].list();
                }
            }
            
            // Format the JSON with proper indentation
            const formattedJson = JSON.stringify(data, null, 2);
            
            // Save to temporary file and share
            const tempPath = FileSystem.documentDirectory + 'formatted_backup.json';
            await FileSystem.writeAsStringAsync(tempPath, formattedJson);
            await Sharing.shareAsync(tempPath, { UTI: '.json', mimeType: 'application/json' });
            await FileSystem.deleteAsync(tempPath, { idempotent: true });
        } catch (error) {
            console.error('Failed to share backup file:', error);
            showAlert({
                title: 'Error',
                message: 'Failed to share backup file.',
                onConfirm: () => {}
            });
        }
    };

    const shareBackupSqlite = async () => {
        try {
            const dbPath = `${FileSystem.documentDirectory}SQLite/LocalDB.db`;
            await Sharing.shareAsync(dbPath, { 
                UTI: '.db',
                mimeType: 'application/x-sqlite3'
            });
        } catch (error) {
            console.error('Failed to share SQLite database:', error);
            showAlert({
                title: 'Error',
                message: 'Failed to share SQLite database.',
                onConfirm: () => {}
            });
        }
    };

    return {
        serverURL,
        setServerURL,
        isImporting,
        alertConfig,
        setAlertConfig,
        saveServerURL,
        showFormatSelector,
        handleBackupAction
    };
};