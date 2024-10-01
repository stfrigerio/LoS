import { useState, useEffect, useCallback } from 'react';

import { databaseManagers } from '../../../database/tables';

import { PersonData } from '@los/shared/src/types/People';

export const usePeopleData = () => {
    const [people, setPeople] = useState<PersonData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPeople = useCallback(async () => {
        try {
            setIsLoading(true);
            const fetchedPeople = await databaseManagers.people.list();
            setPeople(fetchedPeople);
            setError(null);
        } catch (err) {
            setError('Failed to fetch people');
            console.error('Error fetching people:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPeople();
    }, [fetchPeople]);

    const addPerson = useCallback(async (personData: Partial<PersonData>) => {
        try {
            const newPerson = await databaseManagers.people.upsert(personData as PersonData);
            setPeople(prevPeople => [...prevPeople, newPerson]);
            return newPerson;
        } catch (err) {
            setError('Failed to add person');
            console.error('Error adding person:', err);
            throw err;
        }
    }, []);

    const updatePerson = useCallback(async (personData: PersonData) => {
        try {
            const updatedPerson = await databaseManagers.people.upsert(personData);
            setPeople(prevPeople => 
                prevPeople.map(person => 
                    person.id === updatedPerson.id ? updatedPerson : person
                )
            );
            return updatedPerson;
        } catch (err) {
            setError('Failed to update person');
            console.error('Error updating person:', err);
            throw err;
        }
    }, []);

    const deletePerson = useCallback(async (id: string) => {
        try {
            await databaseManagers.people.remove(id);
            setPeople(prevPeople => prevPeople.filter(person => person.id !== id));
        } catch (err) {
            setError('Failed to delete person');
            console.error('Error deleting person:', err);
            throw err;
        }
    }, []);

    const refreshPeople = useCallback(async () => {
        await fetchPeople();
    }, [fetchPeople]);

    return {
        people,
        isLoading,
        error,
        addPerson,
        updatePerson,
        deletePerson,
        refreshPeople
    };
};