import { useState } from 'react';

import { databaseManagers } from '@los/mobile/src/database/tables';
import { useEnhancedTextInput } from '@los/mobile/src/components/@/hooks/useEnhancedTextInput';

import { PersonData } from '@los/shared/src/types/People';
import { ContactData } from '@los/shared/src/types/Contact';
import { MoodNoteData } from '@los/shared/src/types/Mood';


export const useMoodNoteModal = (closeMoodModal: () => void) => {
    const { upsertContact } = useEnhancedTextInput();

    const handleSave = async (moodNote: MoodNoteData, mentionedPeople: PersonData[]) => {
        try {
            await databaseManagers.mood.upsert(moodNote);

            for (const person of mentionedPeople) {
                const newContact: ContactData = {
                    personId: Number(person.id),
                    peopleName: person.name,
                    peopleLastname: person.lastName,
                    source: 'mood',                
                    dateOfContact: new Date().toISOString().split('T')[0],
                };

            try {
                const result = await upsertContact(newContact);
                if (result) {
                    console.log('Contact saved successfully');
                } else {
                    console.error('Failed to save contact');
                }
            } catch (error) {
                console.error('Error saving contact:', error);
            }
        }

        } catch (error: any) {
            console.log(`Failed to save mood note: ${error.message}`);
            throw error;
        }
    };

    return {
        handleSave,
    };
};