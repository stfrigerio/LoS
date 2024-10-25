import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { databaseManagers } from '@los/mobile/src/database/tables';
import { getNodeServerURL } from '@los/mobile/src/components/Database/hooks/databaseConfig';
import { compareTwoStrings } from 'string-similarity'; // We'll need to install this package

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const syncMarkedAlbums = async (setIsSyncing: (isSyncing: boolean) => void) => {
    setIsSyncing(true);
    const concurrencyLimit = 5; // Limit the number of concurrent album syncs
    type SyncPromiseWrapper = {
        promise: Promise<void>;
        album: string;
    };
    const activeSyncs: SyncPromiseWrapper[] = [];

    try {
        const markedAlbums = await databaseManagers.library.getLibrary({ 
            type: 'music', 
            isMarkedForDownload: 1 
        });

        const allMusicAlbums = await databaseManagers.library.getLibrary({
            type: 'music'
        });

        const SERVER_URL = await getNodeServerURL();

        // Remove unmarked albums
        for (let album of allMusicAlbums) {
            if (!markedAlbums.some(markedAlbum => markedAlbum.title === album.title)) {
                await removeAlbum(album.title);
            }
        }

        for (let album of markedAlbums) {
            if (activeSyncs.length >= concurrencyLimit) {
                await Promise.race(activeSyncs.map(p => p.promise)); // Wait for one to finish
            }

            const syncPromise = syncAlbum(album, SERVER_URL).catch(error => {
                console.error(`Failed to sync album ${album.title}:`, error);
                Alert.alert('Sync Error', `Failed to sync album: ${album.title}`);
            });

            const promiseWrapper = { promise: syncPromise, album: album.title };
            activeSyncs.push(promiseWrapper);
            syncPromise.finally(() => {
                // Remove from active syncs when done
                const index = activeSyncs.findIndex(p => p.album === album.title);
                if (index !== -1) activeSyncs.splice(index, 1);
            });
        }

        await Promise.all(activeSyncs.map(p => p.promise)); // Ensure all syncs complete

        Alert.alert('Sync Complete', 'All marked albums have been synced successfully.');
    } catch (error) {
        console.error('Failed to sync albums:', error);
        Alert.alert('Sync Error', 'Failed to sync some albums. Please check the logs for details.');
    } finally {
        setIsSyncing(false);
    }
};

const syncAlbum = async (album: any, SERVER_URL: string) => {
    const response = await fetch(`${SERVER_URL}/music/sync/${encodeURIComponent(album.title)}`, { method: 'POST' });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const files = await response.json();

    const albumPath = `${FileSystem.documentDirectory}Music/${album.title}`;
    await FileSystem.makeDirectoryAsync(albumPath, { intermediates: true });

    for (let file of files) {
        let retries = 0;
        while (retries < MAX_RETRIES) {
            try {
                await downloadFile(album.title, file.name, albumPath);
                break; // Success, exit retry loop
            } catch (error) {
                console.error(`Failed to download ${file.name}, attempt ${retries + 1}:`, error);
                if (retries === MAX_RETRIES - 1) {
                    throw error; // Rethrow if all retries failed
                }
                retries++;
                await wait(RETRY_DELAY);
            }
        }
    }

    console.log(`Successfully synced album: ${album.title}`);
};

const removeAlbum = async (albumTitle: string) => {
    try {
        const albumPath = `${FileSystem.documentDirectory}Music/${albumTitle}`;
        await FileSystem.deleteAsync(albumPath, { idempotent: true });
        console.log(`Successfully removed album: ${albumTitle}`);
    } catch (error) {
        console.error(`Failed to remove album ${albumTitle}:`, error);
    }
};

const downloadFile = async (albumTitle: string, fileName: string, albumPath: string) => {
    const SERVER_URL = await getNodeServerURL();
    const fileUrl = `${SERVER_URL}/music/file/${encodeURIComponent(albumTitle)}/${encodeURIComponent(fileName)}`;
    const fileUri = `${albumPath}/${fileName}`;

    // Check if the file already exists and has content
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists && fileInfo.size > 0) {
        console.log(`File already exists and is not empty: ${fileName}`);
        return; // Skip downloading if the file already exists and is not empty
    }
    
    try {
        const fileResponse = await fetch(fileUrl);

        if (!fileResponse.ok) {
            const errorBody = await fileResponse.text();
            console.error(`Server response: ${errorBody}`);
            throw new Error(`Failed to fetch file: ${fileName} (Status: ${fileResponse.status}, Body: ${errorBody})`);
        }
        
        const contentType = fileResponse.headers.get('Content-Type');
        const contentLength = fileResponse.headers.get('Content-Length');
        
        // Use Expo FileSystem to download the file directly
        const downloadResult = await FileSystem.downloadAsync(fileUrl, fileUri);

        // Verify the downloaded file
        const downloadedFile = await FileSystem.getInfoAsync(fileUri);
        if (!downloadedFile.exists || downloadedFile.size === 0) {
            throw new Error(`File download failed or file is empty: ${fileName}`);
        }
    } catch (error) {
        console.error(`Error in downloadFile:`, error);
        throw error;
    }
};

export const clearMusicFolder = async () => {
    try {
        const musicFolderPath = `${FileSystem.documentDirectory}Music`;
        const musicFolderContents = await FileSystem.readDirectoryAsync(musicFolderPath);

        for (const item of musicFolderContents) {
            const itemPath = `${musicFolderPath}/${item}`;
            const itemInfo = await FileSystem.getInfoAsync(itemPath);

            if (itemInfo.isDirectory) {
                await FileSystem.deleteAsync(itemPath, { idempotent: true });
            } else {
                await FileSystem.deleteAsync(itemPath);
            }
        }

    } catch (error) {
        console.error('Failed to clear Music folder:', error);
        throw new Error('Failed to clear Music folder');
    }
};

export const fetchAPIKeys = async () => {
    try {
        const keys = await Promise.all([
            databaseManagers.userSettings.getByKey('booksApiKey'),
            databaseManagers.userSettings.getByKey('moviesApiKey'),
            databaseManagers.userSettings.getByKey('spotifyClientId'),
            databaseManagers.userSettings.getByKey('spotifyClientSecret'),
            databaseManagers.userSettings.getByKey('igdbClientId'),
            databaseManagers.userSettings.getByKey('igdbClientSecret'),
        ]);

        return {
            booksApiKey: keys[0]?.value || '',
            moviesApiKey: keys[1]?.value || '',
            spotifyClientId: keys[2]?.value || '',
            spotifyClientSecret: keys[3]?.value || '',
            igdbClientId: keys[4]?.value || '',
            igdbClientSecret: keys[5]?.value || '',
        };
    } catch (error) {
        console.error('Failed to fetch API keys:', error);
        return {};
    }
};

export const saveAPIKey = async (key: string, value: string) => {
    try {
        const existingSetting = await databaseManagers.userSettings.getByKey(key);
        let newSetting: any = {
            settingKey: key,
            value: value.trim(),
            type: 'apiKey'
        };

        if (existingSetting && existingSetting.uuid) {
            newSetting.uuid = existingSetting.uuid;
        }

        await databaseManagers.userSettings.upsert(newSetting);
    } catch (error) {
        console.error(`Failed to save ${key}:`, error);
    }
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};