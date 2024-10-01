import { useState, useEffect } from 'react';
import { databaseManagers } from '@los/mobile/src/database/tables'

import { TableData } from '@los/shared/src/components/Database/types/types';

import { capitalizedTableNames, apiTableNames } from '@los/shared/src/utilities/tableNames';

export const useDatabaseData = () => {
  const [tables, setTables] = useState<string[]>([...capitalizedTableNames, 'BooleanHabits', 'QuantifiableHabits', 'DeletionLog']);
  const [allData, setAllData] = useState<TableData>({});

  const fetchAllData = async (): Promise<TableData> => {
    try {
      const data: TableData = Object.fromEntries(
        await Promise.all([
          ...apiTableNames.map(async apiTable => {
            const manager = databaseManagers[apiTable as keyof typeof databaseManagers];
            let result;
            if (apiTable === 'dailyNotes' && 'listOrderedByDate' in manager) {
              result = await manager.listOrderedByDate();
            } else if ('list' in manager) {
              result = await manager.list();
            } else {
              throw new Error(`Unsupported manager for table ${apiTable}`);
            }
            const capitalizedTable = capitalizedTableNames[apiTableNames.indexOf(apiTable)];
            return [capitalizedTable, result];
          }),
          ['BooleanHabits', await databaseManagers.booleanHabits.listOrderedByDate()],
          ['QuantifiableHabits', await databaseManagers.quantifiableHabits.listOrderedByDate()],
          ['DeletionLog', await databaseManagers.deletionLog.list()]
        ])
      );
      setAllData(data);
      return data;
    } catch (error) {
      console.error('Error fetching all data:', error);
      return {};
    }
  };

  const update = async (table: string, rowData: any) => {
    try {
      let manager;
      if (table === 'BooleanHabits') {
        manager = databaseManagers.booleanHabits;
      } else if (table === 'QuantifiableHabits') {
        manager = databaseManagers.quantifiableHabits;
      } else {
        const apiTable = apiTableNames[capitalizedTableNames.indexOf(table)];
        manager = databaseManagers[apiTable as keyof typeof databaseManagers];
      }

      if (manager && 'upsert' in manager) {
        await manager.upsert(rowData);
        await fetchAllData();
      } else {
        console.error(`Table ${table} not supported`);
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const remove = async (table: string, rowData: any) => {
    try {
      let manager;
      if (table === 'BooleanHabits') {
        manager = databaseManagers.booleanHabits;
      } else if (table === 'QuantifiableHabits') {
        manager = databaseManagers.quantifiableHabits;
      } else {
        const apiTable = apiTableNames[capitalizedTableNames.indexOf(table)];
        manager = databaseManagers[apiTable as keyof typeof databaseManagers];
      }

      if (manager && 'remove' in manager) {
        await manager.remove(rowData.id);
        await fetchAllData();
      } else {
        console.error(`Table ${table} not supported`);
      }
    } catch (error) {
      console.error('Error removing data:', error);
    }
  };

  useEffect(() => {
    try {
      fetchAllData();
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, []);

  return { tables, fetchAllData, update, remove };
};