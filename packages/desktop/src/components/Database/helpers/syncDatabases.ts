import { TableData } from '@los/shared/src/components/Database/types/types';

import { updateDesktop } from '@los/desktop/src/components/Database/hooks/updateDesktop';

export const syncDatabases = async (mergedData: TableData) => {
  try {

    const updateCounts = await updateDesktop(mergedData);
    
    const totalUpdated = Object.values(updateCounts).reduce((sum, count) => sum + count, 0);
    
    return { 
      success: true, 
      message: 'Database sync completed successfully',
      totalUpdated,
      updateCounts
    };
  } catch (error) {
    console.error('Sync failed:', error);
    return { success: false, message: 'Sync failed', error };
  }
};