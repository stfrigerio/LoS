import { useState } from 'react';
import axios from 'axios';

import { BASE_URL } from '@los/shared/src/utilities/constants';

import { MoodNoteData } from '@los/shared/src/types/Mood';
import { PersonData } from '@los/shared/src/types/People';
import { ContactData } from '@los/shared/src/types/Contact';

export const useMoodNoteModal = (closeMoodModal: () => void) => {
    const today = new Date();
    const todayString = today.toISOString();
    const [moodNote, setMoodNote] = useState<MoodNoteData>({
        date: todayString,
        rating: 0,
        comment: '',
        tag: '',
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: 0,
    });
    const [mentionedPeople, setMentionedPeople] = useState<PersonData[]>([]);

    const handleSave = async () => {
        try {
        await axios.post(`${BASE_URL}/mood/upsert`, moodNote);

        setMoodNote({
            date: todayString,
            rating: 0,
            comment: '',
            tag: '',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            synced: 0,
        });

        for (const person of mentionedPeople) {
            const newContact: ContactData = {
                personId: Number(person.id),
                peopleName: person.name,
                peopleLastname: person.lastName,
                source: 'mood',
                dateOfContact: new Date().toISOString().split('T')[0],
            };

            try {
                const result = await axios.post(`${BASE_URL}/contact/upsert`, newContact);
                if (result.data) {
                    console.log('Contact saved successfully');
                } else {
                    console.error('Failed to save contact');
                }
            } catch (error) {
                console.error('Error saving contact:', error);
            }
        }

        setMentionedPeople([]);
        closeMoodModal();
        } catch (error: any) {
            console.log(`Failed to save mood note: ${error.message}`);
            throw error;
        }
    };

    return {
        handleSave,
    };
};