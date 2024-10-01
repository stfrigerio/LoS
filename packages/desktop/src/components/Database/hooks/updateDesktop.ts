import axios from 'axios';

import { TableData } from '@los/shared/src/components/Database/types/types';
import { getNodeServerURL } from '@los/mobile/src/components/Database/hooks/databaseConfig';
import { SyncSummary } from '@los/shared/src/components/Database/types/types';
import { uploadImages } from './uploadImages';
import { readImageData } from '@los/shared/src/components/Images/ImageFileManager';

const DEFAULT_CHUNK_SIZE = 1000;
const TABLE_CHUNK_SIZES: Record<string, number> = {
  Library: 100, // Smaller chunk size for Library table
};

export async function updateDesktop(mergedData: TableData, testMode: boolean = false): Promise<Record<string, number>> {
  const SERVER_URL = await getNodeServerURL();
  const updateCounts: Record<string, number> = {};
  const overallSummary: SyncSummary = {
    tables: {},
    totals: {
      processed: 0,
      successful: 0,
      failed: 0,
      created: 0,
      updated: 0,
      skipped: 0
    },
    errors: [],
    clientErrors: []

  };
  
  try {
    // Create backup
    await axios.get(`${SERVER_URL}/sync/createBackup`);
    console.log('Backup created');

    const syncOrder = ['Pillars', 'Objectives', 'Tasks', ...Object.keys(mergedData).filter(table => !['Pillars', 'Objectives', 'Tasks'].includes(table))];

    for (const table of syncOrder) {
      if (!mergedData[table]) continue; // Skip if table doesn't exist in mergedData

      updateCounts[table] = 0;
      if (!overallSummary.tables[table]) {
        overallSummary.tables[table] = {
          processed: 0,
          successful: { number: 0, notes: {} },
          failed: { number: 0, notes: {} },
          created: { number: 0, notes: {} },
          updated: { number: 0, notes: {} },
          skipped: { number: 0, notes: {} }
        };
      }
      
      const data = mergedData[table];
      const items = Array.isArray(data) ? (testMode ? [data[0]] : data) : [data];
      const chunkSize = TABLE_CHUNK_SIZES[table] || DEFAULT_CHUNK_SIZE;

      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        const preparedChunk = chunk.map(item => prepareItemForSync(table, item)).filter(item => item !== null);
        const chunkData = { [table]: preparedChunk };

        try {
          const response = await axios.post(`${SERVER_URL}/sync/syncData`, { data: chunkData }, {
            headers: { 'Content-Type': 'application/json' }
          });

          const { summary } = response.data;
          updateCounts[table] += summary.tables[table].successful.number;
          mergeSummaries(overallSummary, summary);

          console.log(`Synced chunk ${Math.floor(i / chunkSize) + 1} for table ${table}`);
        } catch (error) {
          const errorMessage = axios.isAxiosError(error) && error.response
            ? `${error.response.status} - ${JSON.stringify(error.response.data)}`
            : (error as Error).message;

          console.error(`Error syncing chunk ${Math.floor(i / chunkSize) + 1} for table ${table}:`, errorMessage);
          addClientErrorToSummary(overallSummary, table, `Error syncing chunk: ${errorMessage}`, chunk);
        }
      }
    }

    // Upload Images
    const imageData = await readImageData(); // { "2024-04-25": ["uri1", "uri2"], ... }
    
    for (const [date, uris] of Object.entries(imageData)) {
      try {
        await uploadImages(SERVER_URL, date, uris);
      } catch (error: any) {
        console.error(`Error uploading images for date ${date}:`, error);
        addClientErrorToSummary(overallSummary, 'Images', `Error uploading images for date ${date}: ${error.message}`, uris);
      }
    }

    console.log('Sync process completed. Overall summary:', overallSummary);
    return updateCounts;
  } catch (error) {
    const errorMessage = axios.isAxiosError(error) && error.response
      ? `${error.response.status} - ${JSON.stringify(error.response.data)}`
      : (error as Error).message;

    console.error('Error during sync process:', errorMessage);
    addClientErrorToSummary(overallSummary, 'General', `Error during sync process: ${errorMessage}`);

    throw error;
  } finally {
    // Save the overall summary including client errors
    try {
      await axios.post(`${SERVER_URL}/sync/saveSummary`, { summary: overallSummary });
      console.log('Overall summary including client errors saved on server.');
    } catch (saveError) {
      console.error('Failed to save overall summary on server:', saveError);
    }
  }
}

function mergeSummaries(overall: SyncSummary, chunk: SyncSummary) {
  // Merge totals
  for (const key in chunk.totals) {
    overall.totals[key as keyof typeof overall.totals] += chunk.totals[key as keyof typeof chunk.totals];
  }

  // Merge table stats
  for (const [table, stats] of Object.entries(chunk.tables)) {
    if (!overall.tables[table]) {
      overall.tables[table] = {
        processed: 0,
        successful: { number: 0, notes: {} },
        failed: { number: 0, notes: {} },
        created: { number: 0, notes: {} },
        updated: { number: 0, notes: {} },
        skipped: { number: 0, notes: {} }
      };
    }

    overall.tables[table].processed += stats.processed;

    for (const category of ['successful', 'failed', 'created', 'updated', 'skipped'] as const) {
      overall.tables[table][category].number += stats[category].number;
      Object.assign(overall.tables[table][category].notes, stats[category].notes);
    }
  }

  // Merge errors
  overall.errors.push(...chunk.errors);
}

function addClientErrorToSummary(summary: SyncSummary, table: string, message: string, items?: any[]) {
  summary.clientErrors.push({ table, message, items });

  if (!summary.tables[table]) {
    summary.tables[table] = {
      processed: 0,
      successful: { number: 0, notes: {} },
      failed: { number: 0, notes: {} },
      created: { number: 0, notes: {} },
      updated: { number: 0, notes: {} },
      skipped: { number: 0, notes: {} }
    };
  }

  const errorCount = items ? items.length : 1;
  summary.tables[table].failed.number += errorCount;
  summary.totals.failed += errorCount;
  summary.totals.processed += errorCount;
}

function prepareItemForSync(table: string, item: any): any {
  const { id, ...dataWithoutId } = item;

  // Ensure date is a string in ISO format
  if (dataWithoutId.date instanceof Date) {
    dataWithoutId.date = dataWithoutId.date.toISOString().split('T')[0];
  } else if (typeof dataWithoutId.date === 'object' || Array.isArray(dataWithoutId.date)) {
    console.error(`Invalid date format for ${table}:`, dataWithoutId.date);
    dataWithoutId.date = null; // or set to a default value
  }

  if (table === 'DailyNotes') {
    const { uuid, quantifiableHabits, booleanHabits, ...rest } = dataWithoutId;
    return {
      ...rest,
      uuid,
      quantifiableHabits: Object.entries(quantifiableHabits || {}).map(([habitKey, value]) => ({
        habitKey,
        value: Number(value),
      })),
      booleanHabits: Object.entries(booleanHabits || {}).map(([habitKey, value]) => ({
        habitKey,
        value: Boolean(value),
      })),
    };
  } else if (table === 'UserSettings') {
    // Skip updating if the settingKey is 'serverUrl'
    if (dataWithoutId.settingKey === 'serverUrl') {
      console.log('Skipping update for serverUrl setting');
      return null;
    }
    // Ensure UUID is present for UserSettings
    if (!dataWithoutId.uuid) {
      console.error('Missing UUID for UserSettings item:', dataWithoutId);
      return null;
    }
    return dataWithoutId;
  } else {
    // Ensure UUID is present for all other tables
    if (!dataWithoutId.uuid) {
      console.error(`Missing UUID for ${table} item:`, dataWithoutId);
      return null;
    }
    return dataWithoutId;
  }
}


