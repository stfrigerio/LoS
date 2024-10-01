import { useState } from 'react';
import axios from 'axios';

import { BASE_URL } from '@los/shared/src/utilities/constants';

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

    const handleNext = async () => {
        if (step < 2) {
        setStep(step + 1);
        } else {
        if (!person.category) {
            throw new Error('Please select a category');
        }
        if (!person.notificationEnabled) {
            throw new Error('Please select if notifications are enabled');
        }
        try {
            await axios.post(`${BASE_URL}/people/upsert`, person);
            resetForm();
            onClose();
        } catch (error: any) {
            console.error('Failed to save person:', error.message);
            throw error;
        }
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
        updatePerson,
        resetForm,
        handleNext,
        handleBack,
    };
};