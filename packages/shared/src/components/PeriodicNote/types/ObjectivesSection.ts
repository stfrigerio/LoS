import { ObjectiveData } from '@los/shared/src/types/Objective';
import { PillarData } from '@los/shared/src/types/Pillar';

export interface ExtendedObjectiveData extends ObjectiveData {
    pillarEmoji: string;
}

export type UseObjectivesReturn = {
    objectives: ExtendedObjectiveData[];
    pillars: PillarData[];
    addObjective: (newObjective: Omit<ExtendedObjectiveData, 'uuid'>) => Promise<void>;
    toggleObjectiveCompletion: (uuid: string) => Promise<void>;
    deleteObjective: (uuid: string) => Promise<void>;
    refreshObjectives: () => Promise<void>;
};