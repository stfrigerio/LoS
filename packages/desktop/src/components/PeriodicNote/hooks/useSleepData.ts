import axios from 'axios'

import { logger } from '../../../electron/main/logger';
import { BASE_URL } from '@los/shared/src/utilities/constants';

const filename = 'useSleepData.ts'

export const fetchAdditionalData = async (date: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/dailyNotes/read?date=${date}`);
      return response.data;
    } catch (error) {
      logger.log('FrontToDatabase', filename, 'No sleep data found for date:', date);
      return null;
    }
};