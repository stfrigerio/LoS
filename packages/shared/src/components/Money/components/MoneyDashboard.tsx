import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

import AccountsOverview from './MoneyDashboard/AccountsOverview';
import { UniversalModal } from '../../../sharedComponents/UniversalModal';

import { useThemeStyles } from '../../../styles/useThemeStyles';

import { MoneyData } from '../../../types/Money';

interface MoneyDashboardProps {
    transactions: MoneyData[];
    addTransaction: (transaction: Partial<MoneyData>) => void;
    updateTransaction: (updatedTransaction: MoneyData) => void;
    deleteTransaction: (uuid: string) => void;
}

const MoneyDashboard: React.FC<MoneyDashboardProps> = ({ 
    transactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction 
}) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);

    const { totalIncome, totalExpenses, balance, accountTransactions } = useMemo(() => {
        const income = transactions
            .filter(t => t.type === 'Income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions
            .filter(t => t.type === 'Expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const accountTransactions = transactions
            .filter(t => t.type === 'totalAccount');
    
        return {
            totalIncome: income,
            totalExpenses: expenses,
            balance: income - expenses,
            accountTransactions
        };
    }, [transactions]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Financial Overview</Text>
            <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Income</Text>
                    <Text style={styles.summaryValue}>{totalIncome.toFixed(2)} €</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Expenses</Text>
                    <Text style={styles.summaryValue}>{totalExpenses.toFixed(2)} €</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Balance</Text>
                    <Text style={[styles.summaryValue, { color: balance >= 0 ? 'green' : 'red' }]}>
                        {balance.toFixed(2)} €
                    </Text>
                </View>
            </View>
            <View style={styles.accountsContainer}>
                <AccountsOverview 
                    transactions={transactions}
                    addTransaction={addTransaction}
                    updateTransaction={updateTransaction}
                    deleteTransaction={deleteTransaction}
                />
            </View>
        </View>
    );
};

const getStyles = (themeColors: any, designs: any) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        ...designs.text.title,
        marginBottom: 20,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        ...designs.text.text,
        color: 'gray',
        marginBottom: 5,
    },
    summaryValue: {
        ...designs.text.text,
        fontWeight: 'bold',
    },
    accountsContainer: {
        flex: 1,
    },
    subtitle: {
        ...designs.text.title,
        marginBottom: 10,
    },
    accountsList: {
        flex: 1,
    },
    accountItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.borderColor,
    },
    accountName: {
        ...designs.text.text,
        flex: 1,
    },
    accountBalance: {
        ...designs.text.text,
        fontWeight: 'bold',
        marginRight: 10,
    },
    accountActions: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 5,
        marginLeft: 10,
    },
    addButton: {
        ...designs.button.marzoSecondary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    addButtonText: {
        ...designs.button.buttonText,
        marginLeft: 10,
    },
    modalContent: {
        width: '100%',
        alignItems: 'center',
    },
    modalTitle: {
        ...designs.text.title,
        marginBottom: 20,
    },
});

export default MoneyDashboard;