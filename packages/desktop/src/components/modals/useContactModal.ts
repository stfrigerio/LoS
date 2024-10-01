import { useState } from 'react';
import axios from 'axios';

import { BASE_URL } from '@los/shared/src/utilities/constants';

import { ContactData } from '@los/shared/src/types/Contact';
import { PersonData } from '@los/shared/src/types/People';

export const useAddContactModal = (onClose: () => void) => {
    const today = new Date();
    const [contact, setContact] = useState<ContactData>({
        personId: 0,
        dateOfContact: today.toISOString().split('T')[0],
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
    });
    const [selectedPerson, setSelectedPerson] = useState<PersonData | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
        setContact({
            ...contact,
            dateOfContact: selectedDate.toISOString().split('T')[0],
        });
        }
    };

    const handlePersonSelected = (person: PersonData) => {
        setSelectedPerson(person);
        setContact({
        ...contact,
        personId: Number(person.id),
        });
    };

    const handleSave = async () => {
        try {
        if (!selectedPerson) {
            throw new Error('Please select a person for the contact.');
        }

        // Use the desktop API route to upsert the contact
        await axios.post(`${BASE_URL}/contact/upsert`, contact);

        setContact({
            personId: 0,
            dateOfContact: today.toISOString().split('T')[0],
            createdAt: today.toISOString(),
            updatedAt: today.toISOString(),
        });
        setSelectedPerson(null);
        onClose();
        } catch (error: any) {
        console.log(`Failed to save contact: ${error.message}`);
        throw error;
        }
    };

    return {
        contact,
        selectedPerson,
        showDatePicker,
        setShowDatePicker,
        handleDateChange,
        handlePersonSelected,
        handleSave,
    };
};