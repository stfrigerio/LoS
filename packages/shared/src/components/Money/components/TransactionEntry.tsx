import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import TransactionModal from '../../modals/TransactionModal';
import AlertModal from '@los/shared/src/components/modals/AlertModal';

import { MoneyData } from '../../../types/Money';
import { useThemeStyles } from '../../../styles/useThemeStyles';

let useColors: any;
if (Platform.OS === 'web') {
    useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
    useColors = require('@los/mobile/src/components/useColors').useColors;
}

interface TransactionEntryProps {
    transaction: MoneyData;
    deleteTransaction: (uuid: string) => void;
    refreshTransactions: () => void;
}

const TransactionEntry: React.FC<TransactionEntryProps> = ({
    transaction,
    deleteTransaction,
    refreshTransactions,
}) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);
    const { colors: tagColors, loading, error } = useColors();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);

    const handleDelete = () => {
        setIsDeleteAlertVisible(true);
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        return {
            day: d.getDate().toString(),
            month: d.toLocaleString('default', { month: 'short' })
        };
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        refreshTransactions();
    };

    const { day, month } = formatDate(transaction.date);
    const tagColor = tagColors[transaction.tag] || 'gray'; // Default to gray if color not found
    
    return (
        <>
            <View style={styles.container}>
                <Pressable onPress={() => setIsEditModalOpen(true)} style={styles.content}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateDay}>{day}</Text>
                        <Text style={styles.dateMonth}>{month}</Text>
                    </View>
                    <View style={[styles.tag]}>
                        <Text style={[styles.tagText, { color: tagColor }]}>{transaction.tag}</Text>
                    </View>
                    <Text style={[styles.description]}>{transaction.description}</Text>
                    <Text style={[styles.amount, { color: transaction.type === 'Income' ? 'green' : 'red' }]}>
                        {transaction.amount.toFixed(2)}
                    </Text>
                </Pressable>
                <Pressable onPress={handleDelete} style={styles.actionIcon}>
                    <FontAwesomeIcon icon={faTrash} size={20} color={'gray'}/>
                </Pressable>
            </View>
            {isEditModalOpen && (
                <TransactionModal
                    isOpen={isEditModalOpen}
                    closeTransactionModal={handleEditModalClose}
                    initialTransaction={transaction}
                />
            )}
            {isDeleteAlertVisible && (
                <AlertModal
                    isVisible={isDeleteAlertVisible}
                    title="Delete Task"
                    message="Are you sure you want to delete this task?"
                    onCancel={() => setIsDeleteAlertVisible(false)}
                    onConfirm={() => {
                        deleteTransaction(transaction.uuid!);
                        setIsDeleteAlertVisible(false);
                    }}
                />
            )}
        </>
    );
};

const getStyles = (themeColors: any, designs: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 2,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: themeColors.backgroundSecondary,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateContainer: {
        width: '15%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateDay: {
        ...designs.text.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    dateMonth: {
        ...designs.text.text,
        fontSize: 12,
    },
    tag: {
        width: '25%',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginHorizontal: 5,
    },
    tagText: {
        fontWeight: 'bold',
        textAlign: 'left',
    },
    description: {
        ...designs.text.text,
        flex: 1,
        marginHorizontal: 5,
        color: 'gray',
        textAlign: 'left',
    },
    amount: {
        ...designs.text.text,
        width: '20%',
        textAlign: 'center',
        marginRight: 10,
    },
    actionIcon: {
        padding: 15,
        width: '10%',
        alignItems: 'center',
    },
});

export default TransactionEntry;