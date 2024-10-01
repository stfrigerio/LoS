import axios from 'axios';
import { MoneyData } from '@los/shared/src/types/Money';
import { BASE_URL } from '@los/shared/src/utilities/constants';

export const useTransactionModal = (closeTransactionModal: () => void, initialTransaction?: MoneyData) => {
    const handleAddTransaction = async (transaction: MoneyData) => {
        try {
            await axios.post(`${BASE_URL}/money/upsert`, transaction);
            closeTransactionModal();
        } catch (error: any) {
            console.error('Error saving transaction:', error);
            throw error;
        }
    };

    return {
        handleAddTransaction
    };
};