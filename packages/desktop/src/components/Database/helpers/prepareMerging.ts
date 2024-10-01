import { mergeMobileWithDesktop } from './mergeMobileWithDesktop';
import { getDesktopData } from '@los/mobile/src/components/Database/hooks/databaseSync';

import { TableData } from '@los/shared/src/components/Database/types/types';


export const prepareMerging = async (localData: TableData) => {
  try {
    const desktopData = await getDesktopData();
    const mobileData = localData

    // Check if all tables exist in the desktop datasets
    if (mobileData && desktopData) {
      const allTables = new Set([...Object.keys(mobileData), ...Object.keys(desktopData)]);
      for (const table of allTables) {
        if (!mobileData[table]) {
          console.warn(`Table '${table}' is missing in mobile data. Initializing as empty array.`);
          mobileData[table] = [];
        }
      }

      const { merged, duplicates, syncInfo, changes } = mergeMobileWithDesktop(mobileData, desktopData);
      console.log('Merge complete. Merged data tables:', Object.keys(merged));
      
      return { merged, syncInfo, duplicates, changes };
    } else {
      return { error: 'Failed to fetch and transform desktop data. Please try again.' };
    }
  } catch (error) {
    console.error('Sync failed:', error);
    if (error instanceof Error) {
      return { error: error.message, stack: error.stack };
    } else {
      return { error: 'An unknown error occurred during sync' };
    }
  }
};