import axios from 'axios';

import { BASE_URL } from '@los/shared/src/utilities/constants';
import { apiTableNames } from '@los/shared/src/utilities/tableNames';

interface TableData {
  [key: string]: any[];
}

export const useDatabaseData = () => {
  const tables = apiTableNames

  const fetchAllData = async () => {
    const allData: TableData = {};
    for (const table of tables) {
      try {
        const response = await axios.get(`${BASE_URL}/${table}/list`);
        allData[table] = response.data;
      } catch (error) {
        console.error(`Error fetching data for ${table}:`, error);
      }
    }
    return allData;
  };

  const update = async (table: string, updatedRowData: any) => {
    try {
      const response = await axios.put(`${BASE_URL}/${table}/update`, updatedRowData);
      return response.data;
    } catch (error) {
      console.error('Error updating data:', error);
      throw error;
    }
  };

  const remove = async (table: string, rowData: any) => {
    try {
        const response = await axios.delete(`${BASE_URL}/${table}/remove`, { data: rowData });
        return response.data;
    } catch (error) {
        console.error('Error removing data:', error);
        throw error;
    }
  };

  return {
      tables,
      fetchAllData,
      update,
      remove
  };
};