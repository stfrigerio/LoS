import { useState, useEffect, useCallback } from 'react';

import { databaseManagers } from '../../../database/tables';

import { ContactData } from '@los/shared/src/types/Contact';

export const useContactData = () => {
    const [contacts, setContacts] = useState<ContactData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContacts = useCallback(async () => {
        try {
            setIsLoading(true);
            const fetchedContacts = await databaseManagers.contact.list();
            setContacts(fetchedContacts);
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
            const newContact = await databaseManagers.contact.upsert(contactData as ContactData);
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
            const updatedContact = await databaseManagers.contact.upsert(contactData);
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

    const deleteContact = useCallback(async (id: string | number) => {
        try {
            await databaseManagers.contact.remove(id);
            setContacts(prevContacts => prevContacts.filter(contact => contact.id !== id));
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