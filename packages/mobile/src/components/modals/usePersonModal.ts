import { useState } from 'react';
import { Alert } from 'react-native';

import { databaseManagers } from '@los/mobile/src/database/tables';

import { PersonData } from '@los/shared/src/types/People';

export const usePersonModal = (onClose: () => void, initialPerson?: PersonData) => {
    const [step, setStep] = useState(0);
    const [person, setPerson] = useState<Partial<PersonData>>(initialPerson || {});

    const updatePerson = (key: keyof PersonData, value: any) => {
        setPerson(prev => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        setPerson({});
        setStep(0);
    };

    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            if (!person.category) {
                Alert.alert('Error', 'Please select a category');
                return;
            }
            if (!person.notificationEnabled) {
                Alert.alert('Error', 'Please select if notifications are enabled');
                return;
            }

            if (!person.name) {
                Alert.alert('Error', 'Please enter a name');
                return;
            } else if (!person.lastName) {
                Alert.alert('Error', 'Please enter a last name');
                return;
            }
            
            console.log('about to save person', person);
            databaseManagers.people.upsert(person);
            resetForm();
            onClose();
        }
    };

    const handleBack = () => {
        if (step > 0) {
        setStep(step - 1);
        } else {
        resetForm();
        onClose();
        }
    };

    return {
        step,
        person,
        setPerson,
        updatePerson,
        resetForm,
        handleNext,
        handleBack,
    };
};