import { useState, useEffect } from 'react';
import { Platform } from 'react-native'
import { TableData } from '../types/types';

let useDatabaseData: () => { tables: string[]; fetchAllData: () => Promise<TableData>; update: (table: string, updatedRowData: any) => Promise<any>; remove: (table: string, rowData: any) => Promise<any>; };

if (Platform.OS === 'web') {
    useDatabaseData = require('@los/desktop/src/components/Database/hooks/useDatabaseData').useDatabaseData;
} else {
    useDatabaseData = require('@los/mobile/src/components/Database/hooks/useDatabaseData').useDatabaseData;
}

export const useData = () => {
  const [tableData, setTableData] = useState<TableData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldFetch, setShouldFetch] = useState(true);

  const { tables, fetchAllData, update, remove } = useDatabaseData();

  useEffect(() => {
    const loadData = async () => {
      if (!shouldFetch) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAllData();
        if (data === undefined) {
          throw new Error('Fetched data is undefined');
        }
        const processedData = processTableData(data);
        setTableData(processedData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again.');
      } finally {
        setIsLoading(false);
        setShouldFetch(false);
      }
    };

    loadData();
  }, [shouldFetch, fetchAllData]);

  const processTableData = (data: TableData | null | undefined): TableData => {
    if (!data) return {};

    const processedData: TableData = {};

    Object.entries(data).forEach(([tableName, tableRows]) => {
      if (!Array.isArray(tableRows) || tableRows.length === 0) {
        processedData[tableName] = [];
        return;
      }

      const dateColumn = Object.keys(tableRows[0]).find(col => col.toLowerCase().includes('date'));

      const filteredRows = tableRows.map(row => {
        const filteredRow = { ...row };
        return filteredRow;
      });

      if (dateColumn) {
        filteredRows.sort((a, b) => new Date(b[dateColumn]).getTime() - new Date(a[dateColumn]).getTime());
      }

      processedData[tableName] = filteredRows;
    });

    return processedData;
  };

  const refreshData = () => setShouldFetch(true);

  const handleUpdate = async (table: string, rowData: any, field: string, value: any) => {
    const updatedRowData = { ...rowData, [field]: value };
    try {
      await update(table, updatedRowData);
      refreshData();
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleRemove = async (table: string, rowData: any) => {
    try {
      await remove(table, rowData);
      refreshData();
    } catch (error) {
      console.error('Error removing data:', error);
    }
  };

  return { tableData, isLoading, error, tables, refreshData, handleUpdate, handleRemove };
};