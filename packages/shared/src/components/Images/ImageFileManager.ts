import * as FileSystem from 'expo-file-system';

const IMAGE_FILE_NAME = 'DailyNoteImages.json';
const IMAGE_FILE_PATH = `${FileSystem.documentDirectory}${IMAGE_FILE_NAME}`;

/**
 * Initialize the JSON file if it doesn't exist.
 */
const initializeImageFile = async (): Promise<void> => {
    const fileInfo = await FileSystem.getInfoAsync(IMAGE_FILE_PATH);
    if (!fileInfo.exists) {
        await FileSystem.writeAsStringAsync(IMAGE_FILE_PATH, JSON.stringify({}));
    }
};

/**
 * Read the entire JSON data from the file.
 */
export const readImageData = async (): Promise<{ [date: string]: string[] }> => {
    try {
        await initializeImageFile();
        const jsonValue = await FileSystem.readAsStringAsync(IMAGE_FILE_PATH);
        return jsonValue ? JSON.parse(jsonValue) : {};
    } catch (error) {
        console.error('Error reading image data:', error);
        return {};
    }
};

/**
 * Write the entire JSON data to the file.
 */
const writeImageData = async (data: { [date: string]: string[] }): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(data);
        await FileSystem.writeAsStringAsync(IMAGE_FILE_PATH, jsonValue);
    } catch (error) {
        console.error('Error writing image data:', error);
    }
};

/**
 * Get image URIs for a specific date.
 * @param date - Date string in 'YYYY-MM-DD' format.
 */
export const getImageUrisForDate = async (date: string): Promise<string[]> => {
    const allData = await readImageData();
    return allData[date] || [];
};

/**
 * Add an image URI to a specific date.
 * @param date - Date string in 'YYYY-MM-DD' format.
 * @param uri - Image URI to add.
 */
export const addImageUri = async (date: string, uri: string): Promise<void> => {
    const allData = await readImageData();
    if (!allData[date]) {
        allData[date] = [];
    }
    allData[date].push(uri);
    await writeImageData(allData);
};

/**
 * Remove an image URI from a specific date by index.
 * @param date - Date string in 'YYYY-MM-DD' format.
 * @param index - Index of the image URI to remove.
 */
export const removeImageUri = async (date: string, index: number): Promise<void> => {
    const allData = await readImageData();
    if (allData[date] && allData[date][index]) {
        allData[date].splice(index, 1);
        // If no more images for the date, delete the key
        if (allData[date].length === 0) {
        delete allData[date];
        }
        await writeImageData(allData);
    }
};

/**
 * Clear all image URIs for a specific date.
 * @param date - Date string in 'YYYY-MM-DD' format.
 */
export const clearImageUrisForDate = async (date: string): Promise<void> => {
    const allData = await readImageData();
    if (allData[date]) {
        delete allData[date];
        await writeImageData(allData);
    }
};
