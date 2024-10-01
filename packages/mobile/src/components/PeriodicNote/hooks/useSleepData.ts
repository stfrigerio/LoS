import { databaseManagers } from "../../../database/tables";

export const fetchAdditionalData = async (date: string) => {
    try {
      const response = await databaseManagers.dailyNotes.getByDate(date);
      return response[0];
    } catch (error) {
      console.warn('No sleep data found for date:', date);
      return null;
    }
};