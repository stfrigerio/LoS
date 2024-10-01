import { useState } from 'react';

import { databaseManagers } from '../../database/tables';

import { ContactData } from '@los/shared/src/types/Contact';
import { PersonData } from '@los/shared/src/types/People';

export const useContactModal = (onClose: () => void) => {
    const today = new Date();
    const [contact, setContact] = useState<ContactData>({
        personId: 0,
        dateOfContact: today.toISOString().split('T')[0],
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
    });
    const [selectedPerson, setSelectedPerson] = useState<PersonData | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDateChange = (selectedDate: Date) => {
        setContact(prev => ({
            ...prev,
            dateOfContact: selectedDate.toISOString(),
        }));
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

            await databaseManagers.contact.upsert(contact);

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
        handleDateChange,
        handlePersonSelected,
        handleSave,
    };
};