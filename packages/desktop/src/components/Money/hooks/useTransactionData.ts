import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { BASE_URL } from '@los/shared/src/utilities/constants';

import { MoneyData } from '@los/shared/src/types/Money';

export const useTransactionData = () => {
    const [transactions, setTransactions] = useState<MoneyData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${BASE_URL}/money/list`);
            setTransactions(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch transactions');
            console.error('Error fetching transactions:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const addTransaction = useCallback(async (moneyData: Partial<MoneyData>) => {
        try {
            const response = await axios.post(`${BASE_URL}/money/upsert`, moneyData);
            const newTransaction = response.data;
            setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
            return newTransaction;
        } catch (err) {
            setError('Failed to add transaction');
            console.error('Error adding transaction:', err);
            throw err;
        }
    }, []);

    const updateTransaction = useCallback(async (moneyData: MoneyData) => {
        try {
            const response = await axios.post(`${BASE_URL}/money/upsert`, moneyData);
            const updatedTransaction = response.data;
            setTransactions(prevTransactions => 
                prevTransactions.map(transaction => 
                    transaction.id === updatedTransaction.id ? updatedTransaction : transaction
                )
            );
            return updatedTransaction;
        } catch (err) {
            setError('Failed to update transaction');
            console.error('Error updating transaction:', err);
            throw err;
        }
    }, []);

    const deleteTransaction = useCallback(async (uuid: string) => {
        try {
            await axios.delete(`${BASE_URL}/money/remove/${uuid}`);
            setTransactions(prevTransactions => prevTransactions.filter(transaction => transaction.uuid !== uuid));
        } catch (err) {
            setError('Failed to delete transaction');
            console.error('Error deleting transaction:', err);
            throw err;
        }
    }, []);

    const refreshTransactions = useCallback(async () => {
        await fetchTransactions();
    }, [fetchTransactions]);

    return {
        transactions,
        isLoading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refreshTransactions
    };
};