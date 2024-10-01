import { Change, Table, TableData, Row } from '@los/shared/src/components/Database/types/types';


function universalMergeStrategy(mergedMap: Map<string, Row>, mobileData: Table, tableName: string): { merged: Table; changes: Change[] } {
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

    mobileData.forEach(entry => handleEntry(entry, 'remote'));
    const merged = Array.from(mergedMap.values()).filter(entry => !duplicatedEntries.has(entry.uuid));

    return {
        merged,
        changes
    };
}

export function mergeMobileWithDesktop(mobile: TableData, desktop: TableData): { 
    merged: TableData, 
    duplicates: TableData, 
    changes: { [key: string]: Change[] },
    syncInfo: { [key: string]: { desktop: number, mobile: number, merged: number } }
} {
    const merged: TableData = {};
    const duplicates: TableData = {};
    const changes: { [key: string]: Change[] } = {};
    const syncInfo: { [key: string]: { desktop: number, mobile: number, merged: number } } = {};

    try {
        const allTables = new Set([...Object.keys(mobile), ...Object.keys(desktop)]);
    
        for (const table of allTables) {
            const mobileData = mobile[table] || [];
            const desktopData = desktop[table] || [];
            const mergedMap = new Map();

            desktopData.forEach(entry => mergedMap.set(entry.uuid, entry));

            const result = universalMergeStrategy(mergedMap, mobileData, table);

            merged[table] = result.merged;
            changes[table] = result.changes;

            syncInfo[table] = {
                desktop: desktopData.length,
                mobile: mobileData.length,
                merged: merged[table].length,
            };
        }
    } catch (error) {
        console.error('Error merging databases:', error);
        throw error;
    }
        
    return { merged, duplicates, changes, syncInfo };
}