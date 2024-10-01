import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { BASE_URL } from '@los/shared/src/utilities/constants';

import { ContactData } from '@los/shared/src/types/Contact';

export const useContactData = () => {
    const [contacts, setContacts] = useState<ContactData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContacts = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${BASE_URL}/contact/list`);
            setContacts(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch contacts');
            console.error('Error fetching contacts:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const addContact = useCallback(async (contactData: Partial<ContactData>) => {
        try {
            const response = await axios.post(`${BASE_URL}/contact/upsert`, contactData);
            const newContact = response.data;
            setContacts(prevContacts => [...prevContacts, newContact]);
            return newContact;
        } catch (err) {
            setError('Failed to add contact');
            console.error('Error adding contact:', err);
            throw err;
        }
    }, []);

    const updateContact = useCallback(async (contactData: ContactData) => {
        try {
            const response = await axios.post(`${BASE_URL}/contact/upsert`, contactData);
            const updatedContact = response.data;
            setContacts(prevContacts => 
                prevContacts.map(contact => 
                    contact.id === updatedContact.id ? updatedContact : contact
                )
            );
            return updatedContact;
        } catch (err) {
            setError('Failed to update contact');
            console.error('Error updating contact:', err);
            throw err;
        }
    }, []);

    const deleteContact = useCallback(async (uuid: string) => {
        try {
            await axios.delete(`${BASE_URL}/contact/remove/${uuid}`);
            setContacts(prevContacts => prevContacts.filter(contact => contact.uuid !== uuid));
        } catch (err) {
            setError('Failed to delete contact');
            console.error('Error deleting contact:', err);
            throw err;
        }
    }, []);

    const refreshContacts = useCallback(async () => {
        await fetchContacts();
    }, [fetchContacts]);

    return {
        contacts,
        isLoading,
        error,
        addContact,
        updateContact,
        deleteContact,
        refreshContacts
    };
};