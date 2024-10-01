import { Alert } from 'react-native'

import { mergeDesktopIntoMobile } from './mergeDesktopWithMobile';
import { TableData } from '@los/shared/src/components/Database/types/types';

import { getDesktopData } from '@los/mobile/src/components/Database/hooks/databaseSync';

export const prepareMerging = async (localData: TableData) => {
  try {
    let desktopData: TableData;

    try {
      desktopData = await getDesktopData();

      // Check if all tables exist in both datasets
      const allTables = new Set([...Object.keys(desktopData), ...Object.keys(localData)]);
      for (const table of allTables) {
        if (!desktopData[table]) {
          console.warn(`Table '${table}' is missing in desktop data. Initializing as empty array.`);
          desktopData[table] = [];
        }
        if (!localData[table]) {
          console.warn(`Table '${table}' is missing in mobile data. Initializing as empty array.`);
          localData[table] = [];
        }
      }
    } catch (error) {
      console.error('Failed to fetch and transform desktop data:', error);
      Alert.alert(
        'Error',
        'Failed to fetch and transform desktop data. Please try again.',
        [{ text: 'OK' }]
      );
      throw new Error('Failed to fetch desktop data');
    }

    const { merged, changes, syncInfo } = mergeDesktopIntoMobile(localData, desktopData);

    return { merged, changes, syncInfo };
  } catch (error) {
    console.error('Sync failed:', error);
    if (error instanceof Error) {
      return { error: error.message, stack: error.stack };
    } else {
      return { error: 'An unknown error occurred during sync' };
    }
  }
};