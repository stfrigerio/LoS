import * as FileSystem from 'expo-file-system';
import { getFlaskServerURL } from '../../../Database/hooks/databaseConfig';

const LOCAL_DB_PATH = `${FileSystem.documentDirectory}SQLite/LocalDB.db`;

export const uploadDatabase = async (
    data?: string,
    format: 'sqlite' | 'json' = 'sqlite'
): Promise<{ success: boolean; message: string }> => {
    try {
        const flaskURL = await getFlaskServerURL();
        console.log('Uploading to URL:', flaskURL); // Debug log

        const formData = new FormData();

        if (format === 'sqlite') {
            // Handle SQLite file upload
            const fileInfo = await FileSystem.getInfoAsync(LOCAL_DB_PATH);
            const fileContent = await FileSystem.readAsStringAsync(LOCAL_DB_PATH, { length: 16 });
            
            if (!fileInfo.exists) {
                throw new Error(`Database file not found at: ${LOCAL_DB_PATH}`);
            }
            if (!fileContent.startsWith('SQLite format')) {
                throw new Error('This is not a valid SQLite database file');
            }

            formData.append('file', {
                uri: fileInfo.uri,
                name: 'LocalDB.db',
                type: 'application/x-sqlite3'
            } as any);

            const response = await fetch(`${flaskURL}/upload_${format}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.ok) {
                return { 
                    success: true, 
                    message: `${format.toUpperCase()} data uploaded successfully` 
                };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }
        } else {
            // Handle JSON data upload
            if (!data) {
                throw new Error('No JSON data provided');
            }
            
            // Create a temporary file with the formatted JSON
            const tempPath = `${FileSystem.documentDirectory}temp_upload.json`;
            const formattedJson = JSON.stringify(JSON.parse(data), null, 2);
            await FileSystem.writeAsStringAsync(tempPath, formattedJson);

            // Verify file exists
            const fileInfo = await FileSystem.getInfoAsync(tempPath);
            console.log('Temp file info:', fileInfo); // Debug log

            if (!fileInfo.exists) {
                throw new Error('Failed to create temporary file');
            }

            formData.append('file', {
                uri: `file://${tempPath}`, // Add file:// prefix
                name: 'database_backup.json',
                type: 'application/json'
            } as any);

            try {
                const response = await fetch(`${flaskURL}/upload_${format}`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                    },
                });

                console.log('Response status:', response.status); // Debug log
                const responseText = await response.text();
                console.log('Response text:', responseText); // Debug log

                if (response.ok) {
                    await FileSystem.deleteAsync(tempPath, { idempotent: true });
                    return { 
                        success: true, 
                        message: `${format.toUpperCase()} data uploaded successfully` 
                    };
                } else {
                    throw new Error(responseText || 'Upload failed');
                }
            } catch (fetchError) {
                console.error('Fetch error details:', fetchError); // Debug log
                throw fetchError;
            } finally {
                // Ensure cleanup happens even if upload fails
                await FileSystem.deleteAsync(tempPath, { idempotent: true });
            }
        }
    } catch (error: any) {
        console.error('Upload error details:', error); // Debug log
        return { success: false, message: `Upload failed: ${error.message}` };
    }
};

export const downloadDatabase = async (): Promise<{ success: boolean; message: string }> => {
    try {
        const flaskURL = await getFlaskServerURL();
        
        const { uri } = await FileSystem.downloadAsync(
            `${flaskURL}/download_db`,
            LOCAL_DB_PATH
        );

        if (uri) {
            return { success: true, message: 'Database downloaded successfully' };
        } else {
            throw new Error('Download failed');
        }
    } catch (error: any) {
        console.error('Download error:', error);
        return { success: false, message: `Download failed: ${error.message}` };
    }
};