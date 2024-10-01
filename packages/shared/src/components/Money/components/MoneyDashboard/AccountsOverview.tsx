import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, TextInput } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { MoneyData } from '@los/shared/src/types/Money';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { UniversalModal } from '@los/shared/src/sharedComponents/UniversalModal';

interface AccountsOverviewProps {
    transactions: MoneyData[];
    addTransaction: (transaction: Partial<MoneyData>) => void;
    updateTransaction: (updatedTransaction: MoneyData) => void;
    deleteTransaction: (uuid: string) => void;
}

const AccountsOverview: React.FC<AccountsOverviewProps> = ({ 
    transactions, 
    addTransaction,
    updateTransaction,
    deleteTransaction
}) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<MoneyData | null>(null);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountBalance, setNewAccountBalance] = useState('');
    
    const accountSummaries = useMemo(() => {
        const summaries: { [key: string]: { income: number, expenses: number, total: number, transaction: MoneyData | null } } = {};
        
        transactions.forEach(transaction => {
            if (transaction.account && transaction.account !== 'null') {
                if (!summaries[transaction.account]) {
                    summaries[transaction.account] = { income: 0, expenses: 0, total: 0, transaction: null };
                }
                
                if (transaction.type === 'totalAccount') {
                    summaries[transaction.account].transaction = transaction;
                    summaries[transaction.account].total = transaction.amount;
                } else if (transaction.type === 'Income') {
                    summaries[transaction.account].income += transaction.amount;
                    summaries[transaction.account].total += transaction.amount;
                } else if (transaction.type === 'Expense') {
                    summaries[transaction.account].expenses += transaction.amount;
                    summaries[transaction.account].total -= transaction.amount;
                }
            }
        });
    
        return Object.entries(summaries).map(([account, summary]) => ({
            account,
            ...summary,
            transaction: summary.transaction || transactions.find(t => t.account === account && t.type === 'totalAccount') || null
        }));
    }, [transactions]);

    const handleAddAccount = useCallback(() => {
        if (newAccountName) {
            addTransaction({
                type: 'totalAccount',
                account: newAccountName,
                amount: 0, // Set initial amount to 0
                date: new Date().toISOString()
            });
            setNewAccountName('');
            setIsModalVisible(false);
        }
    }, [newAccountName, addTransaction]);

    const handleUpdateAccount = useCallback(() => {
        if (editingTransaction && editingTransaction.uuid && newAccountName) {
            const updatedTransaction = {
                ...editingTransaction,
                account: newAccountName,
                // Keep the existing amount
            };
            updateTransaction(updatedTransaction);
            setEditingTransaction(null);
            setNewAccountName('');
            setIsModalVisible(false);
        }
    }, [editingTransaction, newAccountName, updateTransaction]);

    const handleDeleteAccount = useCallback((transaction: MoneyData) => {
        if (transaction.uuid && transaction.type === 'totalAccount') {
            console.log('deleting account', transaction);
            deleteTransaction(transaction.uuid);
        } else {
            console.warn('Attempted to delete non-totalAccount transaction:', transaction);
        }
    }, [deleteTransaction]);

    const renderAccountItem = useCallback(({ item }: { item: { account: string, income: number, expenses: number, total: number, transaction: MoneyData | null } }) => (
        <View style={styles.accountItem}>
            <Text style={styles.accountName}>{item.account}</Text>
            <Text style={styles.accountIncome}>€{item.income.toFixed(2)}</Text>
            <Text style={styles.accountExpenses}>€{item.expenses.toFixed(2)}</Text>
            <Text style={[styles.accountTotal, { color: item.total >= 0 ? 'green' : 'red' }]}>
                €{item.total.toFixed(2)}
            </Text>
            <View style={styles.accountActions}>
                {/* <Pressable onPress={() => {
                    if (item.transaction) {
                        setEditingTransaction(item.transaction);
                        setNewAccountName(item.account);
                        setNewAccountBalance(item.total.toString());
                        setIsModalVisible(true);
                    } else {
                        console.warn('No totalAccount transaction found for', item.account);
                    }
                }} style={styles.actionButton}>
                    <FontAwesomeIcon icon={faEdit} size={16} color={'gray'} />
                </Pressable> */}
                <Text style={[designs.text.text, {fontSize: 8}]}>Needs fixing</Text>
                {/* <Pressable onPress={() => {
                    if (item.transaction && item.transaction.type === 'totalAccount') {
                        handleDeleteAccount(item.transaction);
                    } else {
                        console.warn('No totalAccount transaction found for', item.account);
                    }
                }} style={styles.actionButton}>
                    <FontAwesomeIcon icon={faTrash} size={16} color={'gray'} />
                </Pressable> */}
            </View>
        </View>
    ), [styles, handleDeleteAccount]);

    return (
        <View style={styles.container}>
            <Text style={styles.subtitle}>Accounts</Text>
            <View style={styles.accountHeader}>
                <Text style={styles.headerText}>Account</Text>
                <Text style={styles.headerText}>Income</Text>
                <Text style={styles.headerText}>Expenses</Text>
                <Text style={styles.headerText}>Total</Text>
                <Text style={styles.headerText}>Actions</Text>
            </View>
            <FlatList
                data={accountSummaries}
                renderItem={renderAccountItem}
                keyExtractor={(item) => item.account}
                style={styles.accountsList}
            />
            {/* <Pressable style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                <FontAwesomeIcon icon={faPlus} size={16} color={themeColors.backgroundColor} />
                <Text style={styles.addButtonText}>Add Account</Text>
            </Pressable> */}
            
            { isModalVisible && (
                <UniversalModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingTransaction ? 'Edit Account' : 'Add New Account'}</Text>
                        <TextInput
                            style={designs.text.input}
                            placeholder="Account Name"
                            value={newAccountName}
                            onChangeText={setNewAccountName}
                            placeholderTextColor={'gray'}
                        />
                        {editingTransaction && (
                            <Text style={styles.currentBalance}>
                                Current Balance: €{editingTransaction.amount.toFixed(2)}
                            </Text>
                        )}
                        <Pressable 
                            style={[designs.button.marzoSecondary]} 
                            onPress={editingTransaction ? handleUpdateAccount : handleAddAccount}
                        >
                            <Text style={designs.button.buttonText}>
                                {editingTransaction ? 'Update' : 'Add'}
                            </Text>
                        </Pressable>
                    </View>
                </UniversalModal>
            )}
        </View>
    );
};

const getStyles = (themeColors: any, designs: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    subtitle: {
        ...designs.text.title,
        marginBottom: 10,
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
        fontSize: 14
    },
    accountIncome: {
        ...designs.text.text,
        flex: 1,
        textAlign: 'center',
        fontSize: 12
    },
    accountExpenses: {
        ...designs.text.text,
        flex: 1,
        textAlign: 'center',
        fontSize: 12
    },
    accountTotal: {
        ...designs.text.text,
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 12
    },
    accountActions: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-end',
    },
    actionButton: {
        padding: 5,
    },
    accountHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: themeColors.borderColor,
    },
    headerText: {
        ...designs.text.text,
        fontWeight: 'bold',
        fontSize: 12,
        flex: 1,
        textAlign: 'center',
    },
    accountsList: {
        flex: 1,
    },
    addButton: {
        ...designs.button.marzoSecondary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginRight: 80,
        marginBottom: 5
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
    currentBalance: {
        ...designs.text.text,
        marginBottom: 10,
    },
});

export default AccountsOverview;