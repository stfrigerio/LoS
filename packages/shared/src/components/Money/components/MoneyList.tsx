import React, { useState, useEffect, useMemo } from 'react';
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
    const styles = React.useMemo(() => getStyles(themeColors, designs, showFilter), [themeColors, designs, showFilter]);

    // Maintain filter and sort states
    const [filters, setFilters] = useState<FilterOptions>({
        dateRange: { start: null, end: null },
        tags: [],
        searchTerm: '',
    });

    const [sortOption, setSortOption] = useState<SortOption>('recent');

    // Compute valid transactions
    const validTransactions = useMemo(() => {
        return transactions.filter(transaction => 
            transaction.type === 'Income' || transaction.type === 'Expense'
        );
    }, [transactions]);

    // Derive unique tags
    const tags = useMemo(() => {
        return Array.from(new Set(validTransactions.map(t => t.tag)));
    }, [validTransactions]);

    // Compute filtered and sorted transactions
    const filteredTransactions = useMemo(() => {
        // Apply Filters
        let filtered = validTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const inDateRange = (!filters.dateRange.start || transactionDate >= filters.dateRange.start) &&
                                (!filters.dateRange.end || transactionDate <= filters.dateRange.end);
            const matchesTags = filters.tags.length === 0 || filters.tags.includes(transaction.tag);
            const matchesSearch = transaction.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
            return inDateRange && matchesTags && matchesSearch;
        });

        // Apply Sorting
        filtered.sort((a, b) => {
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

        return filtered;
    }, [validTransactions, filters, sortOption]);

    const handleFilterChange = (newFilters: FilterOptions) => {
        setFilters(newFilters);
    };

    const handleSortChange = (newSortOption: SortOption) => {
        setSortOption(newSortOption);
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
            <FilterAndSort
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                tags={tags}
                searchPlaceholder="Search by description"
                isActive={showFilter}
            />
        </View>
    );
};

const getStyles = (themeColors: any, designs: any, showFilter: boolean) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        container: {
            flex: 1,
            position: 'relative',
        },
        list: {
            marginTop: 30,
            marginBottom: showFilter ? 80 : 0,
            flex: 1,
        },
    });
};

export default MoneyList;
