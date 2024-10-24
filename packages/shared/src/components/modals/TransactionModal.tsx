// TransactionModal.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { format } from 'date-fns';

import TagModal from './TagModal';
import DescriptionModal from './DescriptionModal';
import TagDescriptionSelector from '@los/shared/src/sharedComponents/TagDescriptionSelector';
import { FormInput, PickerInput, SwitchInput } from './components/FormComponents';
import createTimePicker from '@los/shared/src/sharedComponents/DateTimePicker';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import AlertModal from './AlertModal';
import { UniversalModal } from '@los/shared/src/sharedComponents/UniversalModal';

import { MoneyData } from '@los/shared/src/types/Money';
import { SelectionData } from '@los/mobile/src/components/Home/components/TimerComponent';
import { TagData } from '../../types/TagsAndDescriptions';

let useTransactionModal: any;
if (Platform.OS === 'web') {
    useTransactionModal = require('@los/desktop/src/components/modals/useTransactionModal').useTransactionModal;
} else {
    useTransactionModal = require('@los/mobile/src/components/modals/useTransactionModal').useTransactionModal;
}

interface TransactionModalProps {
    isOpen: boolean;
    closeTransactionModal: () => void;
    initialTransaction?: MoneyData;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, closeTransactionModal, initialTransaction }) => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);
    const { showPicker, picker } = createTimePicker();

    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [amountInput, setAmountInput] = useState(initialTransaction?.amount.toString() || '');
    const [selectedTag, setSelectedTag] = useState<TagData | undefined>(undefined);
    const [selectedDescription, setSelectedDescription] = useState<TagData | undefined>(undefined);
    const [isExpense, setIsExpense] = useState(initialTransaction ? initialTransaction.type !== 'Income' : true);
    const [showAlert, setShowAlert] = useState(false);

    const handleTypeChange = (value: boolean) => {
        setIsExpense(value);
        setTransaction(prev => ({
            ...prev,
            type: value ? 'Expense' : 'Income'
        }));
    };

    const [transaction, setTransaction] = useState<MoneyData>({
        amount: 0,
        type: 'Expense',
        tag: '',
        description: '',
        date: new Date().toISOString(),
        synced: 0,
    });

    const updateTagInSelectionData = () => {
        return (updateFunc: (prevData: SelectionData) => SelectionData) => {
            const updatedData = updateFunc({} as SelectionData);
            const newSelectedTag = updatedData.selectedTag;
            if (newSelectedTag) {
                setSelectedTag(newSelectedTag);
                console.log('newSelectedTag', newSelectedTag);
                setTransaction(prevTransaction => ({ 
                    ...prevTransaction, 
                    tag: newSelectedTag.text
                }));
                setIsTagModalOpen(false);
                setIsDescriptionModalOpen(true);
            } else {
                setSelectedTag(undefined);
                setTransaction(prevTransaction => ({ 
                    ...prevTransaction, 
                    tag: ''
                }));
                setIsTagModalOpen(false);
            }
        };
    };     
    
    const updateDescriptionInSelectionData = () => {
        return (updateFunc: (prevData: SelectionData) => SelectionData) => {
            const updatedData = updateFunc({} as SelectionData);
            const newSelectedDescription = updatedData.selectedDescription;
            if (newSelectedDescription) {
                setSelectedDescription(newSelectedDescription);
                setTransaction(prevTransaction => ({
                    ...prevTransaction,
                    description: newSelectedDescription.text
                }));
            } else {
                setSelectedDescription(undefined);
                setTransaction(prevTransaction => ({
                    ...prevTransaction,
                    description: ''
                }));
            }
            setIsDescriptionModalOpen(false);
        };
    };   

    const {
        handleAddTransaction,
        accounts,
        selectedAccount,
        setSelectedAccount,
        fetchAccounts
    } = useTransactionModal(closeTransactionModal, initialTransaction);

    const showDatePicker = () => {
        showPicker({
            mode: 'date',
            value: new Date(transaction.date),
            is24Hour: true,
        }, (selectedDate) => {
            if (selectedDate) {
                handleDateChange(selectedDate);
            }
        });
    };

    const handleDateChange = (selectedDate: Date) => {
        setTransaction({...transaction, date: format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss")});
    };

    useEffect(() => {
        if (initialTransaction) {
            setTransaction(initialTransaction);
        }
    }, [initialTransaction]);

    const handleAccountChange = (account: string) => {
        setSelectedAccount(account);
        setTransaction(prev => ({
            ...prev,
            account: account
        }));
    };

    const handleSubmit = () => {
        if (!transaction.amount) {
            setShowAlert(true);
        } else {
            handleAddTransaction(transaction).catch((error: any) => alert(error.message));
        }
    };

    const handleAmountChange = (text: string) => {
        // Allow decimal point and numbers
        if (/^\d*\.?\d*$/.test(text)) {
            setAmountInput(text);
            setTransaction(prev => ({
                ...prev,
                amount: parseFloat(text) || 0
            }));
        }
    };
    
    return (
        <>
            {isOpen && (
                <UniversalModal
                    isVisible={isOpen}
                    onClose={closeTransactionModal}
                    modalViewStyle="taller"
                >
                    <Text style={designs.text.title}>💸 New transaction</Text>
                    <Pressable onPress={showDatePicker} style={styles.datePickerButton}>
                        <FormInput
                            label="Date"
                            value={transaction.date.split('T')[0]}
                            editable={false}
                            isNumeric={false}
                        />
                    </Pressable>
                    <View style={{ width: '100%', marginBottom: -15 }}>
                        <FormInput
                            label="Amount"
                            value={amountInput}
                            onChangeText={handleAmountChange}
                            isNumeric={true}
                        />
                    </View>
                    <SwitchInput
                        label="Type"
                        value={isExpense}
                        onValueChange={handleTypeChange}
                        trueLabel="Expense"
                        falseLabel="Income"
                        trackColorFalse={themeColors.greenOpacity}
                        trackColorTrue={themeColors.redOpacity}
                    />  
                    <PickerInput
                        label="Account"
                        selectedValue={selectedAccount}
                        onValueChange={handleAccountChange}
                        items={accounts}
                    />
                    <View style={{ width: '100%' }}>
                        <TagDescriptionSelector
                            tag={transaction.tag}
                            description={transaction.description}
                            onPress={() => setIsTagModalOpen(true)}
                        />
                    </View>
                    <Pressable 
                        style={[designs.button.marzoSecondary]} 
                        onPress={handleSubmit}
                    >
                        <Text style={designs.button.buttonText}>
                            {initialTransaction ? 'Update Transaction' : 'Add Transaction'}
                        </Text>
                    </Pressable>
                    {isTagModalOpen && (
                        <TagModal
                            isOpen={isTagModalOpen}
                            setSelectionData={updateTagInSelectionData()}
                            sourceTable="MoneyTable"
                        />
                    )}
                    {isDescriptionModalOpen && (
                        <DescriptionModal
                            isOpen={isDescriptionModalOpen}
                            selectedTag={selectedTag}
                            setSelectionData={updateDescriptionInSelectionData()}
                            sourceTable="MoneyTable"
                        />
                    )}
                    {picker}
                </UniversalModal>
            )}
            {showAlert && (
                <AlertModal
                    isVisible={showAlert}
                    title="Error"
                    message="Please enter an amount"
                    onConfirm={() => setShowAlert(false)}
                    onCancel={() => setShowAlert(false)}
                />
            )}
        </>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.backgroundColor,
        borderColor: theme.borderColor,
        width: '100%',
    },
});

export default TransactionModal;
