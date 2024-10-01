import { useState, useEffect } from 'react';
import axios from 'axios';

import { ObjectiveData } from '@los/shared/src/types/Objective';
import { PillarData } from '@los/shared/src/types/Pillar';
import { ExtendedObjectiveData, UseObjectivesReturn } from '@los/shared/src/components/PeriodicNote/types/ObjectivesSection';

import { BASE_URL } from '@los/shared/src/utilities/constants';

export const useObjectives = (currentDate: string): UseObjectivesReturn => {
    const [objectives, setObjectives] = useState<ExtendedObjectiveData[]>([]);
    const [pillars, setPillars] = useState<PillarData[]>([]);


    const fetchData = async () => {
        const [objectivesResponse, pillarsResponse] = await Promise.all([
            axios.get(`${BASE_URL}/objectives/getObjectives`, { params: { period: currentDate } }),
            axios.get(`${BASE_URL}/pillars/list`)
        ]);

        const fetchedObjectives: ObjectiveData[] = objectivesResponse.data;
        const fetchedPillars: PillarData[] = pillarsResponse.data;
        
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
        const response = await axios.post(`${BASE_URL}/objectives/upsert`, objectiveData);
        const addedObjective: ObjectiveData = response.data;
        
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

            try {
                await axios.post(`${BASE_URL}/objectives/upsert`, updatedObjective);

                setObjectives(prevObjectives =>
                    prevObjectives.map(obj =>
                        obj.uuid === uuid ? updatedObjective : obj
                    )
                );
            } catch (error) {
                console.error('Failed to toggle objective completion:', error);
            }
        }
    };

    const deleteObjective = async (uuid: string) => {
        try {
            await axios.delete(`${BASE_URL}/objectives/remove`, { params: { uuid } });
            setObjectives(prevObjectives => prevObjectives.filter(obj => obj.uuid !== uuid));
        } catch (error) {
            console.error('Failed to delete objective:', error);
        }
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