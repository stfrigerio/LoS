import { Change, Table, TableData, Row } from '@los/shared/src/components/Database/types/types';

function mergeEntries(mergedMap: Map<string, Row>, remote: Table, tableName: string): { merged: Table; changes: Change[] } {
  const changes: Change[] = [];
  const duplicatedEntries = new Set(); // Set to keep track of duplicate UUIDs

  const parseDate = (dateStr: string) => new Date(dateStr).toISOString();

  const handleEntry = (entry: Row, source: string) => {
    const { uuid, updatedAt } = entry;
    if (!uuid || !updatedAt) {
      console.warn('Entry missing uuid or updatedAt:', entry);
      return;
    }

    const normalizedUpdatedAt = parseDate(updatedAt);
    const existingEntry = mergedMap.get(uuid);

    if (existingEntry) {
      const existingNormalizedDate = parseDate(existingEntry.updatedAt);
      if (normalizedUpdatedAt > existingNormalizedDate) {
        mergedMap.set(uuid, { ...existingEntry, ...entry, updatedAt: normalizedUpdatedAt });
        changes.push({ type: 'modified', item: entry });
      } else if (normalizedUpdatedAt === existingNormalizedDate) {
        duplicatedEntries.add(uuid); // Track duplicates by UUID
        changes.push({ type: 'duplicated', item: existingEntry });
      } else if (normalizedUpdatedAt < existingNormalizedDate) {
        changes.push({ type: 'modified', item: entry });
      } else {
        console.warn('Unexpected updatedAt at entry:', entry);
      }
    } else {
      mergedMap.set(uuid, { ...entry, updatedAt: normalizedUpdatedAt });
      changes.push({ type: 'added', item: entry });
    }
  };

  remote.forEach(entry => handleEntry(entry, 'remote'));
  const merged = Array.from(mergedMap.values()).filter(entry => !duplicatedEntries.has(entry.uuid));

  return {
    merged,
    changes
  };
}

export function mergeDesktopIntoMobile(local: TableData, remote: TableData): { 
  merged: TableData;
  changes: { [key: string]: Change[] };
  syncInfo: { [key: string]: { desktop: number; mobile: number; merged: number } };
} {
  const merged: TableData = {};
  const changes: { [key: string]: Change[] } = {};
  const syncInfo: { [key: string]: { desktop: number; mobile: number; merged: number } } = {};

  try {
    for (const table in remote) {
      const localData = local[table] || [];
      const remoteData = remote[table] || [];
      const mergedMap = new Map();

      // Prepopulate the mergedMap with local data
      localData.forEach(entry => mergedMap.set(entry.uuid, entry));

      const result = mergeEntries(mergedMap, remoteData, table);

      merged[table] = result.merged;
      changes[table] = result.changes;

      syncInfo[table] = {
        desktop: remoteData.length,
        mobile: localData.length,
        merged: result.merged.length,
      };
      console.log('Sync info for table', table, syncInfo[table]);
    }
  } catch (error) {
    console.error('Error merging databases:', error);
  }

  return { merged, changes, syncInfo };
}