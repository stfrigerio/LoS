// uploadImages.js

import axios from 'axios';
import * as FileSystem from 'expo-file-system';

/**
 * Upload images to the desktop server.
 * @param {string} serverURL - The base URL of the desktop server (e.g., 'http://192.168.1.100:3000').
 * @param {string} date - The date associated with the images in 'YYYY-MM-DD' format.
 * @param {string[]} imageUris - Array of image URIs to upload.
 */
export async function uploadImages(serverURL: string, date: string, imageUris: string[]) {
    try {
        // Convert image URIs to base64
        const imagesBase64 = await Promise.all(
            imageUris.map(async (uri) => {
                const base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                return base64;
            })
        );

        // Prepare payload
        const payload = {
            date,
            images: imagesBase64,
        };

        // Send POST request to /images/upload
        const response = await axios.post(`${serverURL}/images/upload`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.data.success) {
            console.log('Images uploaded successfully:', response.data.savedImages);
            return response.data.savedImages;
        } else {
            console.error('Failed to upload images:', response.data.error);
            throw new Error(response.data.error || 'Unknown error');
        }
    } catch (error) {
        console.error('Error uploading images:', error);
        throw error;
    }
}
