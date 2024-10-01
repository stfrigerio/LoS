import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';

import MoneyGraphs from './components/MoneyGraphs';
import TransactionModal from '@los/shared/src/components/modals/TransactionModal';
import MobileNavbar from '@los/shared/src/sharedComponents/NavBar';
import MoneyDashboard from './components/MoneyDashboard';
import MoneyList from './components/MoneyList';

import { useThemeStyles } from '../../styles/useThemeStyles';
import { useHomepage } from '../Home/helpers/useHomepage';

import { MoneyData } from '../../types/Money';

let useTransactionData: any;
if (Platform.OS === 'web') {
    const { useTransactionData: webUseTransactionData } = require('@los/desktop/src/components/Money/hooks/useTransactionData');
    useTransactionData = webUseTransactionData;
} else {
    const { useTransactionData: mobileUseTransactionData } = require('@los/mobile/src/components/Money/hooks/useTransactionData');
    useTransactionData = mobileUseTransactionData;
}

const MoneyHub: React.FC = () => {
    const { openHomepage } = useHomepage();
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeView, setActiveView] = useState('Dashboard');
    const [showFilter, setShowFilter] = useState(false);

    const { 
        transactions, 
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refreshTransactions 
    } = useTransactionData();

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = useCallback(() => {
        setIsAddModalOpen(false);
        refreshTransactions();
    }, [refreshTransactions]);

    // Filter and sort the transactions
    const filteredAndSortedTransactions = useMemo(() => {
        return transactions
            .sort((a: MoneyData, b: MoneyData) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);

    const navItems = [
        { label: 'Dashboard', onPress: () => setActiveView('Dashboard') },
        { label: 'List', onPress: () => setActiveView('List') },
        { label: 'Graph', onPress: () => setActiveView('Graph') }
    ];

    const toggleFilter = () => {
        setShowFilter(!showFilter);
    };

    return (
        <View style={styles.container}>

            {activeView === 'Dashboard' && (
                <MoneyDashboard 
                    transactions={filteredAndSortedTransactions} 
                    addTransaction={addTransaction}
                    updateTransaction={updateTransaction}
                    deleteTransaction={deleteTransaction}
                />
            )}
            {activeView === 'List' && (
                <MoneyList 
                    transactions={filteredAndSortedTransactions} 
                    deleteTransaction={deleteTransaction}
                    refreshTransactions={refreshTransactions}
                    showFilter={showFilter}
                />
            )}
            {activeView === 'Graph' && (
                <MoneyGraphs transactions={filteredAndSortedTransactions}/>
            )}
            {isAddModalOpen && (   
                <TransactionModal
                    isOpen={isAddModalOpen}
                    closeTransactionModal={closeAddModal}
                />
            )}
            <MobileNavbar 
                items={navItems} 
                activeIndex={navItems.findIndex(item => item.label === activeView)} 
                title="Money" 
                onBackPress={openHomepage}
                showFilter={activeView === 'List'}
                onFilterPress={toggleFilter}
                quickButtonFunction={openAddModal}
                screen="money"
            />
        </View>
    );
};

export default MoneyHub;

const getStyles = (themeColors: any, designs: any) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: themeColors.backgroundColor,
            paddingHorizontal: 10,
            marginTop: isDesktop ? 0 : 37,
        },
        floatingButton: {
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: themeColors.hoverColor,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
        },
    });
};