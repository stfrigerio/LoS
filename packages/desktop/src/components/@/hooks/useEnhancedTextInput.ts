import { useState, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '@los/shared/src/utilities/constants';
import { PersonData } from '@los/shared/src/types/People';
import { ContactData } from '@los/shared/src/types/Contact';

export const useEnhancedTextInput = () => {
    const [people, setPeople] = useState<PersonData[]>([]);
    const [recentContactMap, setRecentContactMap] = useState<Map<number, Date>>(new Map());

    const fetchPeople = useCallback(async (): Promise<PersonData[]> => {
        try {
            const response = await axios.get(`${BASE_URL}/people/list`);
            const result = response.data;
            setPeople(result);
            return result;
        } catch (error) {
            console.error('Error fetching people:', error);
            return [];
        }
    }, []);

    const fetchPeopleWithRecentContacts = useCallback(async (): Promise<PersonData[]> => {
        try {
            const [peopleResponse, contactsResponse] = await Promise.all([
                axios.get<PersonData[]>(`${BASE_URL}/people/list`),
                axios.get<ContactData[]>(`${BASE_URL}/contact/listOrderedByCreatedAt`)
            ]);

            const peopleResult = peopleResponse.data;
            const contactsResult = contactsResponse.data;

            // Create a map of person IDs to their most recent contact date
            const newRecentContactMap = new Map<number, Date>(
                contactsResult.map(contact => [contact.personId, new Date(contact.dateOfContact)])
            );

            setRecentContactMap(newRecentContactMap);

            // Sort people based on their most recent contact
            const sortedPeople = sortPeopleByRecentContact(peopleResult, newRecentContactMap);

            setPeople(sortedPeople);
            return sortedPeople;
        } catch (error) {
            console.error('Error fetching people with recent contacts:', error);
            return [];
        }
    }, []);

    const sortPeopleByRecentContact = (peopleToSort: PersonData[], contactMap: Map<number, Date>): PersonData[] => {
        return [...peopleToSort].sort((a, b) => {
            const dateA = contactMap.get(Number(a.id)) || new Date(0);
            const dateB = contactMap.get(Number(b.id)) || new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
    };

    const upsertContact = useCallback(async (contact: Omit<ContactData, 'id' | 'uuid'>): Promise<ContactData | null> => {
        try {
            const response = await axios.post<ContactData>(`${BASE_URL}/contacts/upsert`, contact);
            const newContact = response.data;

            // Update the recentContactMap with the new contact
            setRecentContactMap(prevMap => {
                const newMap = new Map(prevMap);
                newMap.set(newContact.personId, new Date(newContact.dateOfContact));
                return newMap;
            });

            // Re-sort people based on the updated contact map
            setPeople(prevPeople => sortPeopleByRecentContact(prevPeople, recentContactMap));

            return newContact;
        } catch (error) {
            console.error('Error upserting contact:', error);
            return null;
        }
    }, [recentContactMap]);

    return { fetchPeopleWithRecentContacts, fetchPeople, upsertContact, people };
};