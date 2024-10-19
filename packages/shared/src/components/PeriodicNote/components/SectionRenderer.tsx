import React from 'react';
import { ObjectivesSection } from './Sections/ObjectivesSection';
import QuantifiableSection from './Sections/QuantifiableSection';
import BooleanSection from './Sections/BooleanSection';
import MoneySection from './Sections/MoneySection';
import TimeSection from './Sections/TimeSection';
import SleepSection from './Sections/SleepSection';
import GPTSection from '@los/mobile/src/components/PeriodicNote/components/GPTSection';
import TextLists from './TextLists';
import TextInputs from './TextInputs';

type SectionRendererProps = {
    activeSection: string;
    dateState: {
        startDate: Date;
        endDate: Date;
        periodType: string;
        formattedDate: string;
    };
    isModalVisible: boolean;
    setIsModalVisible: (visible: boolean) => void;
    tagColors: any;
};

export const SectionRenderer: React.FC<SectionRendererProps> = ({
    activeSection,
    dateState,
    isModalVisible,
    setIsModalVisible,
    tagColors,
}) => {
    switch (activeSection) {
        case 'objectives':
            return (
                <ObjectivesSection
                    isModalVisible={isModalVisible}
                    setIsModalVisible={setIsModalVisible}
                    currentDate={dateState.formattedDate}
                />
            );
        case 'quantifiable':
            return (
                <QuantifiableSection
                    startDate={dateState.startDate}
                    endDate={dateState.endDate}
                    tagColors={tagColors}
                    periodType={dateState.periodType}
                />
            );
        case 'boolean':
            if (dateState.periodType === 'week') return null;
            return (
                <BooleanSection
                    startDate={dateState.startDate}
                    endDate={dateState.endDate}
                    periodType={dateState.periodType}
                />
            );
        case 'money':
            return (
                <MoneySection
                    startDate={dateState.startDate}
                    endDate={dateState.endDate}
                    tagColors={tagColors}
                />
            );
        case 'time':
            return (
                <TimeSection
                    startDate={dateState.startDate}
                    endDate={dateState.endDate}
                    tagColors={tagColors}
                />
            );
        case 'sleep':
            if (dateState.periodType === 'year') return null;
            return (
                <SleepSection
                    startDate={dateState.startDate}
                    endDate={dateState.endDate}
                    periodType={dateState.periodType}
                />
            );
        case 'gpt':
            if (dateState.periodType === 'quarter' || dateState.periodType === 'year') return null;
            return (
                <>
                    <GPTSection
                        startDate={dateState.startDate}
                        endDate={dateState.endDate}
                        currentDate={dateState.formattedDate}
                    />
                    <TextLists
                        startDate={dateState.startDate}
                        endDate={dateState.endDate}
                    />
                    <TextInputs
                        periodType={dateState.periodType}
                        startDate={dateState.startDate.toISOString()}
                        endDate={dateState.endDate.toISOString()}
                    />
                </>
            );
        default:
            return null;
    }
};