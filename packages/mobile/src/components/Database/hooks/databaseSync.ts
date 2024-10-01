import axios from 'axios';
import { getNodeServerURL } from './databaseConfig';

import { TableData } from '@los/shared/src/components/Database/types/types';

enum SyncError {
    ServerOffline = 'SERVER_OFFLINE',
    RouteNotFound = 'ROUTE_NOT_FOUND',
    DataNotFound = 'DATA_NOT_FOUND',
    UnexpectedError = 'UNEXPECTED_ERROR',
}

const handleSyncError = (error: unknown): never => {
    if (axios.isAxiosError(error)) {
        if (!error.response) {
            console.error('Server is offline or unreachable');
            throw new Error(SyncError.ServerOffline);
        }
        if (error.response.status === 404) {
            if (error.response.data?.type === 'data_not_found') {
                console.error('Data not found on server');
                throw new Error(SyncError.DataNotFound);
            } else {
                console.error('Route not found on server');
                throw new Error(SyncError.RouteNotFound);
            }
        }
        console.error(`Unexpected server error: ${error.response.status}`, error.response.data);
    } else {
        console.error('Unexpected error during sync:', error);
    }
    throw new Error(SyncError.UnexpectedError);
};

export const getDesktopData = async (): Promise<TableData> => {
    const SERVER_URL = await getNodeServerURL();
    try {
        const response = await axios.get<TableData>(`${SERVER_URL}/sync/getDesktopData`);
        return response.data;
    } catch (error) {
        return handleSyncError(error);
    }
};