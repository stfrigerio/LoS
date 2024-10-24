import { useState, useEffect, useCallback } from 'react';

import { databaseManagers } from '@los/mobile/src/database/tables';

import { MoneyData } from '@los/shared/src/types/Money';

export const useTransactionData = () => {
    const [transactions, setTransactions] = useState<MoneyData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        try {
            setIsLoading(true);
            const fetchedTransactions = await databaseManagers.money.list();
            setTransactions(fetchedTransactions);
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

    const addTransaction = useCallback(async (MoneyData: Partial<MoneyData>) => {
        try {
            const newTransaction = await databaseManagers.money.upsert(MoneyData as MoneyData);
            setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
            return newTransaction;
        } catch (err) {
            setError('Failed to add transaction');
            console.error('Error adding transaction:', err);
            throw err;
        }
    }, []);

    const updateTransaction = useCallback(async (updatedTransaction: MoneyData) => {
        try {
            const updated = await databaseManagers.money.upsert(updatedTransaction);
            await fetchTransactions();
            return updated;
        } catch (err) {
            setError('Failed to update transaction');
            console.error('Error updating transaction:', err);
            throw err;
        }
    }, []);

    const batchUpdateTransactions = useCallback(
        async (uuids: string[], updatedFields: Partial<MoneyData>) => {
            try {
                setIsLoading(true);
                // Perform all upserts in parallel
                const updatePromises = uuids.map(async (uuid) => {
                    const existingTransaction = transactions.find(t => t.uuid === uuid);
                    if (existingTransaction) {
                        const updatedTransaction = { ...existingTransaction, ...updatedFields };
                        return await databaseManagers.money.upsert(updatedTransaction);
                    }
                    return null;
                });

                const updatedTransactions = await Promise.all(updatePromises);

                // Filter out any nulls (in case some uuids didn't match)
                const validUpdatedTransactions = updatedTransactions.filter(t => t !== null) as MoneyData[];

                // Update local state by replacing updated transactions
                setTransactions(prevTransactions =>
                    prevTransactions.map(t => {
                        const updated = validUpdatedTransactions.find(u => u.uuid === t.uuid);
                        return updated ? updated : t;
                    })
                );
            } catch (err) {
                setError('Failed to batch update transactions');
                console.error('Error batch updating transactions:', err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [transactions]
    );

    const deleteTransaction = useCallback(async (uuid: string) => {
        try {
            await databaseManagers.money.removeByUuid(uuid);
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
        refreshTransactions,
        batchUpdateTransactions
    };
};