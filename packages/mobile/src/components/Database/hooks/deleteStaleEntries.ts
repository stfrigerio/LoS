import axios from 'axios';
import { getNodeServerURL } from './databaseConfig';

export const deleteStaleEntries = async (deletionLog: any[]) => {
    try {
        console.log('deletionLog:', JSON.stringify(deletionLog));
        const SERVER_URL = await getNodeServerURL();
        console.log('BASE_URL:', SERVER_URL); // Add this line
        const response = await axios.post(`${SERVER_URL}/sync/deleteStaleEntries`, deletionLog);
        if (response.status === 200) {
            console.log('Stale entries deleted successfully');
        } else {
            throw new Error('Failed to delete stale entries');
        }
    } catch (error) {
        console.error('Error deleting stale entries:', error);
        throw error;
    }
};