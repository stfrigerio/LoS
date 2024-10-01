import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { BASE_URL } from '@los/shared/src/utilities/constants';

import { PersonData } from '@los/shared/src/types/People';

export const usePeopleData = () => {
    const [people, setPeople] = useState<PersonData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPeople = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${BASE_URL}/people/list`);
            setPeople(response.data);
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
            const response = await axios.post(`${BASE_URL}/people/upsert`, personData);
            const newPerson = response.data;
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
            const response = await axios.post(`${BASE_URL}/people/upsert`, personData);
            const updatedPerson = response.data;
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

    const deletePerson = useCallback(async (uuid: string) => {
        try {
            await axios.delete(`${BASE_URL}/people/remove/${uuid}`);
            setPeople(prevPeople => prevPeople.filter(person => person.uuid !== uuid));
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