// TransactionEntry.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash, faCheckCircle, faCircle } from '@fortawesome/free-solid-svg-icons';

import TransactionModal from '../../modals/TransactionModal';
import AlertModal from '@los/shared/src/components/modals/AlertModal';

import { MoneyData } from '../../../types/Money';
import { useThemeStyles } from '../../../styles/useThemeStyles';

interface TransactionEntryProps {
    transaction: MoneyData;
    deleteTransaction: (uuid: string) => void;
    refreshTransactions: () => void;
    tagColor: string;
    isSelectionMode: boolean;
    isSelected: boolean;
    toggleSelect: (uuid: string) => void;
}

const TransactionEntry: React.FC<TransactionEntryProps> = ({
    transaction,
    deleteTransaction,
    refreshTransactions,
    tagColor,
    isSelectionMode,
    isSelected,
    toggleSelect,
}) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);

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

    const handlePress = () => {
        if (isSelectionMode) {
            toggleSelect(transaction.uuid!);
        } else {
            setIsEditModalOpen(true);
        }
    };

    return (
        <>
            <Pressable
                onPress={handlePress}
                onLongPress={() => toggleSelect(transaction.uuid!)}
                style={[
                    styles.container,
                    isSelected && styles.selectedContainer
                ]}
            >
                {isSelectionMode && (
                    <FontAwesomeIcon
                        icon={isSelected ? faCheckCircle : faCircle}
                        size={20}
                        color={isSelected ? 'green' : 'gray'}
                        style={styles.selectionIcon}
                    />
                )}
                <View style={styles.content}>
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
                </View>
                {!isSelectionMode && (
                    <Pressable onPress={handleDelete} style={styles.actionIcon}>
                        <FontAwesomeIcon icon={faTrash} size={20} color={'gray'} />
                    </Pressable>
                )}
            </Pressable>
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
                    title="Delete Transaction"
                    message="Are you sure you want to delete this transaction?"
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


const getStyles = (themeColors: any, designs: any) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        container: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderRadius: 8,
            marginBottom: 10,
            backgroundColor: themeColors.backgroundSecondary,
        },
        selectedContainer: {
            backgroundColor: themeColors.backgroundColor, // Define a color for selected state
        },
        selectionIcon: {
            marginRight: 10,
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
            backgroundColor: themeColors.tagBackground,
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
};

export default TransactionEntry;