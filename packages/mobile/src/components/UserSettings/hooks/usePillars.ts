import { useState, useEffect, useCallback } from 'react';
import { databaseManagers } from '@los/mobile/src/database/tables';
import { PillarData } from '@los/shared/src/types/Pillar';

export const usePillars = () => {
    const [pillars, setPillars] = useState<PillarData[]>([]);

    useEffect(() => {
        fetchPillars();
    }, []);

    const fetchPillars = async (): Promise<PillarData[]> => {
        try {
        const fetchedPillars = await databaseManagers.pillars.list();
        setPillars(fetchedPillars);
        return fetchedPillars;
        } catch (error) {
        console.error('Failed to fetch pillars:', error);
        return [];
        }
    };

    const handleDeletePillar = async (id: number) => {
        try {
        await databaseManagers.pillars.remove(id);
        await fetchPillars();
        } catch (error) {
        console.error('Failed to delete pillar:', error);
        }
    };

    const handleAddOrUpdatePillar = async (pillarData: PillarData): Promise<PillarData[]> => {
        try {
        await databaseManagers.pillars.upsert(pillarData);
        return await fetchPillars();
        } catch (error) {
        console.error('Failed to add or update pillar:', error);
        return [];
        }
    };

    const getPillarById = useCallback((id: number): PillarData | undefined => {
        return pillars.find(pillar => pillar.id === id);
    }, [pillars]);

    return {
        pillars,
        handleDeletePillar,
        handleAddOrUpdatePillar,
        fetchPillars,
        getPillarById
    };
};