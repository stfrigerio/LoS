import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Platform } from 'react-native';

import TransactionEntry from './TransactionEntry';
import FilterAndSort, { FilterOptions, SortOption } from '@los/shared/src/sharedComponents/FilterAndSort';

import { useThemeStyles } from '../../../styles/useThemeStyles';

import { MoneyData } from '../../../types/Money';

interface MoneyListProps {
    transactions: MoneyData[];
    deleteTransaction: (id: string) => void;
    refreshTransactions: () => void;
    showFilter: boolean;
}

const MoneyList: React.FC<MoneyListProps> = ({
    transactions,
    deleteTransaction,
    refreshTransactions,
    showFilter
}) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);

    //filter transactions to exclude anything that is not income or expense
    const validTransactions = transactions.filter(transaction => 
        transaction.type === 'Income' || transaction.type === 'Expense'
    );

    const [filteredTransactions, setFilteredTransactions] = useState(validTransactions);
    const tags = Array.from(new Set(validTransactions.map(t => t.tag)));

    useEffect(() => {
        setFilteredTransactions(transactions);
    }, [transactions]);

    const handleFilterChange = (filters: FilterOptions) => {
        const filtered = validTransactions.filter(transaction => {
            const inDateRange = (!filters.dateRange.start || new Date(transaction.date) >= filters.dateRange.start) &&
                                (!filters.dateRange.end || new Date(transaction.date) <= filters.dateRange.end);
            const matchesTags = filters.tags.length === 0 || filters.tags.includes(transaction.tag);
            const matchesSearch = transaction.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
            return inDateRange && matchesTags && matchesSearch;
        });
        setFilteredTransactions(filtered);
    };

    const handleSortChange = (sortOption: SortOption) => {
        // Implement sorting logic here
        const sorted = [...filteredTransactions].sort((a, b) => {
            switch (sortOption) {
                case 'recent':
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'oldest':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'highestValue':
                    return b.amount - a.amount;
                case 'lowestValue':
                    return a.amount - b.amount;
                default:
                    return 0;
            }
        });
        setFilteredTransactions(sorted);
    };
    
    const renderItem = ({ item }: { item: MoneyData }) => (
        <TransactionEntry
            transaction={item}
            deleteTransaction={deleteTransaction}
            refreshTransactions={refreshTransactions}
        />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredTransactions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id!.toString()}
                style={styles.list}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={true}
            />
            {showFilter && (
                <FilterAndSort
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                    tags={tags}
                    searchPlaceholder="Search by description"
                />
            )}
        </View>
    );
};

const getStyles = (themeColors: any, designs: any) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        container: {
            flex: 1,
        },
        list: {
            marginTop: 30,
            flex: 1,
        },
    });
};

export default MoneyList;