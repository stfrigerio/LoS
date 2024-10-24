// MoneyList.tsx
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Platform, Text, Pressable } from 'react-native';

import TransactionEntry from './TransactionEntry';
import FilterAndSort, { FilterOptions, SortOption } from '@los/shared/src/sharedComponents/FilterAndSort';
import BatchTransactionModal from '../modals/BatchTransactionModal'; // New modal for batch editing

import { useTransactionData } from '@los/mobile/src/components/Money/hooks/useTransactionData';
import { useThemeStyles } from '../../../styles/useThemeStyles';

import { MoneyData } from '../../../types/Money';

let useColors: any;
if (Platform.OS === 'web') {
	useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
	useColors = require('@los/mobile/src/components/useColors').useColors;
}

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
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const styles = React.useMemo(() => getStyles(themeColors, designs, showFilter, isSelectionMode), [themeColors, designs, showFilter, isSelectionMode]);
    const { colors: tagColors, loading: colorsLoading, error: colorsError } = useColors();
    const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set());
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

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

    // Memoize the color mapping for all entries
    const entryColors = useMemo(() => {
        if (colorsLoading || !tagColors) {
                return {};
        }
        return validTransactions.reduce((acc, entry) => {
            acc[entry.id!] = tagColors[entry.tag!] || themeColors.textColor;
            return acc;
        }, {} as Record<number, string>);
    }, [validTransactions, tagColors, colorsLoading, themeColors.textColor]);

    const toggleSelect = (uuid: string) => {
        const newSelectedUuids = new Set(selectedUuids);
        if (newSelectedUuids.has(uuid)) {
            newSelectedUuids.delete(uuid);
        } else {
            newSelectedUuids.add(uuid);
        }
        setSelectedUuids(newSelectedUuids);
        if (newSelectedUuids.size > 0) {
            setIsSelectionMode(true);
        } else {
            setIsSelectionMode(false);
        }
    };

    const clearSelection = () => {
        setSelectedUuids(new Set());
        setIsSelectionMode(false);
    };

    const handleBatchEdit = () => {
        setIsBatchModalOpen(true);
    };

    const handleBatchModalClose = () => {
        setIsBatchModalOpen(false);
        clearSelection();
        refreshTransactions();
    };

    const { batchUpdateTransactions } = useTransactionData();

    const handleBatchUpdate = (updatedFields: Partial<MoneyData>) => {
        batchUpdateTransactions(Array.from(selectedUuids), updatedFields);
        handleBatchModalClose();
    };

    const renderItem = ({ item }: { item: MoneyData }) => (
        <TransactionEntry
            transaction={item}
            deleteTransaction={deleteTransaction}
            refreshTransactions={refreshTransactions}
            tagColor={entryColors[item.id!] || themeColors.textColor}
            isSelectionMode={isSelectionMode}
            isSelected={selectedUuids.has(item.uuid!)}
            toggleSelect={toggleSelect}
        />
    );

    const handleFilterChange = (newFilters: FilterOptions) => {
        setFilters(newFilters);
    };

    const handleSortChange = (newSortOption: SortOption) => {
        setSortOption(newSortOption);
    };

    return (
        <View style={styles.container}>
            {isSelectionMode && (
                <View style={styles.selectionHeader}>
                    <Text style={styles.selectionText}>{selectedUuids.size} Selected</Text>
                    <Pressable onPress={handleBatchEdit} style={styles.batchButton}>
                        <Text style={styles.batchButtonText}>Batch Edit</Text>
                    </Pressable>
                    <Pressable onPress={clearSelection} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                </View>
            )}
            <FlatList
                data={filteredTransactions}
                renderItem={renderItem}
                keyExtractor={(item) => item.uuid!}
                style={styles.list}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={true}
            />
            {!isSelectionMode && (
                <FilterAndSort
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                    tags={tags}
                    searchPlaceholder="Search by description"
                    isActive={showFilter}
                />
            )}
            {isBatchModalOpen && (
                <BatchTransactionModal
                    isOpen={isBatchModalOpen}
                    closeBatchModal={handleBatchModalClose}
                    selectedTransactions={Array.from(selectedUuids).map(uuid => filteredTransactions.find(t => t.uuid === uuid)!)}
                    onBatchUpdate={handleBatchUpdate}
                />
            )}
        </View>
    );
};

const getStyles = (themeColors: any, designs: any, showFilter: boolean, isSelectionMode: boolean) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        container: {
            flex: 1,
            position: 'relative',
        },
        list: {
            marginTop: isSelectionMode ? 80 : 30, // Adjust margin if selection header is visible
            marginBottom: showFilter ? 80 : 0,
            flex: 1,
        },
        selectionHeader: {
            position: 'absolute',
            top: 10,
            left: 0,
            right: 0,
            height: 60,
            backgroundColor: themeColors.backgroundSecondary,
            borderBottomWidth: 1,
            borderBottomColor: themeColors.borderColor,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
            zIndex: 1,
        },
        selectionText: {
            color: 'gray',
        },
        batchButton: {
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
        },
        batchButtonText: {
            color: themeColors.textColor,
            fontWeight: 'bold',
        },
        cancelButton: {
            padding: 10,
            borderRadius: 5,
        },
        cancelButtonText: {
            color: 'gray',
        },
    });
};

export default MoneyList;
