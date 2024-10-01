import { databaseManagers } from '@los/mobile/src/database/tables';
import { TableData } from '@los/shared/src/components/Database/types/types';

import { tableMapping } from '@los/shared/src/utilities/tableNames';

export const updateMobileData = async (mergedData: TableData): Promise<Record<string, number>> => {
  const updateCounts: Record<string, number> = {};

  try {
    for (const [mobileTable, rows] of Object.entries(mergedData)) {
      console.log(`Processing mobile table: ${mobileTable}`);

      if (!Array.isArray(rows)) {
        console.warn(`Data for ${mobileTable} is not an array. Skipping.`);
        continue;
      }

      const desktopTable = tableMapping[mobileTable] || mobileTable;
      const manager = databaseManagers[desktopTable as keyof typeof databaseManagers];

      if (!manager) {
        console.warn(`No database manager found for table: ${desktopTable}. Skipping.`);
        continue;
      }

      console.log(`Starting to process ${rows.length} rows for ${mobileTable}`);
      let processedRows = 0;

      for (const row of rows) {
        try {
          if (mobileTable === 'DailyNotes') {
            const { booleanHabits, quantifiableHabits, ...dailyNoteData } = row;
            await manager.upsert(dailyNoteData, true);

            if (Array.isArray(booleanHabits)) {
              for (const habit of booleanHabits) {
                  await databaseManagers.booleanHabits.upsert({
                    uuid: habit.uuid,
                    createdAt: habit.createdAt,
                    updatedAt: habit.updatedAt,
                    date: habit.date,
                    habitKey: habit.habitKey,
                    value: habit.value ? 1 : 0
                  } as any, true);
                }
              }
            
            if (Array.isArray(quantifiableHabits)) {
              for (const habit of quantifiableHabits) {
                await databaseManagers.quantifiableHabits.upsert({
                  uuid: habit.uuid,
                  createdAt: habit.createdAt,
                  updatedAt: habit.updatedAt,
                  date: habit.date,
                  habitKey: habit.habitKey,
                  value: Number(habit.value)
                } as any, true);
              }
            }
          } else {
            await manager.upsert(row, true);
          }
          processedRows++;
          if (processedRows % 100 === 0) {
            console.log(`Processed ${processedRows} rows for ${mobileTable}`);
          }
        } catch (error) {
          console.error(`Error updating mobile data for table ${mobileTable}:`, error);
        }
      }
      console.log(`Finished processing ${processedRows} rows for ${mobileTable}`);
      updateCounts[mobileTable] = processedRows;
    }
  } catch (error) {
      console.error('Error updating mobile data:', error);
      throw error;
  }

  return updateCounts;
};