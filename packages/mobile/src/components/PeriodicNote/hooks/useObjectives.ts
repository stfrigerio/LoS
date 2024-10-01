import { useState, useEffect } from 'react';

import { databaseManagers } from '../../../database/tables';

import { ObjectiveData } from '@los/shared/src/types/Objective';
import { PillarData } from '@los/shared/src/types/Pillar';
import { ExtendedObjectiveData, UseObjectivesReturn } from '@los/shared/src/components/PeriodicNote/types/ObjectivesSection';

export const useObjectives = (currentDate: string): UseObjectivesReturn => {
    const [objectives, setObjectives] = useState<ExtendedObjectiveData[]>([]);
    const [pillars, setPillars] = useState<PillarData[]>([]);


    const fetchData = async () => {
        const fetchedObjectives = await databaseManagers.objectives.getObjectives({ period: currentDate });
        const fetchedPillars = await databaseManagers.pillars.list();
        
        const extendedObjectives = fetchedObjectives.map(objective => ({
            ...objective,
            pillarEmoji: fetchedPillars.find(pillar => pillar.uuid === objective.pillarUuid)?.emoji || ''
        }));

        setObjectives(extendedObjectives);
        setPillars(fetchedPillars);
    };

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    const addObjective = async (newObjective: Omit<ExtendedObjectiveData, 'uuid'>) => {
        const { pillarEmoji, ...objectiveData } = newObjective;
        const addedObjective = await databaseManagers.objectives.upsert(objectiveData);
        
        if (addedObjective && typeof addedObjective === 'object' && 'uuid' in addedObjective && typeof addedObjective.uuid === 'string') {
            const extendedAddedObjective: ExtendedObjectiveData = {
                ...addedObjective as ObjectiveData,
                pillarEmoji
            };

            setObjectives((prevObjectives) => [...prevObjectives, extendedAddedObjective]);
        } else {
            console.error('Failed to add objective: Invalid or missing UUID');
        }
    };

    const toggleObjectiveCompletion = async (uuid: string) => {
        const objectiveToUpdate = objectives.find(obj => obj.uuid === uuid);
        if (objectiveToUpdate) {
            const updatedObjective: ExtendedObjectiveData = {
                ...objectiveToUpdate,
                completed: !objectiveToUpdate.completed,
                updatedAt: new Date().toISOString()
            };

            // Remove pillarEmoji before upsert
            const { pillarEmoji, ...objectiveDataToUpsert } = updatedObjective;

            await databaseManagers.objectives.upsert(objectiveDataToUpsert);

            setObjectives(prevObjectives =>
                prevObjectives.map(obj =>
                    obj.uuid === uuid ? { ...updatedObjective, pillarEmoji } : obj
                )
            );
        }
    };

    const deleteObjective = async (uuid: string) => {
        await databaseManagers.objectives.removeByUuid(uuid);
        setObjectives(prevObjectives => prevObjectives.filter(obj => obj.uuid !== uuid));
    };

    return { 
        objectives, 
        pillars, 
        addObjective, 
        toggleObjectiveCompletion, 
        deleteObjective, 
        refreshObjectives: fetchData
    };
};