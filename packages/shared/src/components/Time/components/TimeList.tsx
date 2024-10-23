import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Platform, Text } from 'react-native';

import TimeEntry from './TimeEntry';
import FilterAndSort, { FilterOptions, SortOption } from '@los/shared/src/sharedComponents/FilterAndSort';

import { useThemeStyles } from '../../../styles/useThemeStyles';

import { TimeData } from '../../../types/Time';

interface TimeListProps {
    entries: TimeData[];
    deleteTimeEntry: (id: number) => void;
    editTimeEntry: any;
    showFilter: boolean;
    isLoading: boolean;
    error: string;
}

const TimeList: React.FC<TimeListProps> = ({
    entries,
    deleteTimeEntry,
    editTimeEntry,
    showFilter,
    isLoading,
    error,
}) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs, showFilter), [themeColors, designs, showFilter]);
    
    const [filters, setFilters] = useState<FilterOptions>({
        dateRange: { start: null, end: null },
        tags: [],
        searchTerm: '',
    });

    const [sortOption, setSortOption] = useState<SortOption>('recent');

    // Compute sorted entries
    const sortedEntries = useMemo(() => {
        return [...entries].sort((a: TimeData, b: TimeData) => 
            new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime()
        );
    }, [entries]);

    // Derive unique tags
    const tags = useMemo(() => {
        return Array.from(new Set(entries.map((entry: TimeData) => entry.tag)));
    }, [entries]);

    // Compute filtered and sorted entries
    const filteredEntries = useMemo(() => {
        // Apply Filters
        let filtered = sortedEntries.filter((entry: TimeData) => {
            const entryDate = new Date(entry.date!);
            entryDate.setHours(0, 0, 0, 0);  // Reset time to start of day

            const inDateRange = (!filters.dateRange.start || entryDate >= new Date(filters.dateRange.start.setHours(0, 0, 0, 0))) &&
                                (!filters.dateRange.end || entryDate <= new Date(filters.dateRange.end.setHours(0, 0, 0, 0)));

            const matchesTags = filters.tags.length === 0 || filters.tags.includes(entry.tag);
            const matchesSearch = entry.description!.toLowerCase().includes(filters.searchTerm.toLowerCase());
            return inDateRange && matchesTags && matchesSearch;
        });

        // Apply Sorting
        filtered.sort((a: TimeData, b: TimeData) => {
            switch (sortOption) {
                case 'recent':
                    return new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime();
                case 'oldest':
                    return new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime();
                case 'highestValue':
                    // Assuming duration is a number; adjust if it's a string
                    return Number(b.duration!) - Number(a.duration!);
                case 'lowestValue':
                    return Number(a.duration!) - Number(b.duration!);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [sortedEntries, filters, sortOption]);

    const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());

    const toggleExpand = useCallback((id: number) => {
        setExpandedEntries(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const renderTimeEntry = useCallback(({ item }: { item: TimeData }) => (
        <TimeEntry
            item={item}
            isExpanded={expandedEntries.has(item.id!)}
            toggleExpand={toggleExpand}
            onUpdateTimeEntry={editTimeEntry}
            deleteTimeEntry={deleteTimeEntry}
        />
    ), [expandedEntries, toggleExpand, editTimeEntry, deleteTimeEntry]);

    const handleFilterChange = (newFilters: FilterOptions) => {
        setFilters(newFilters);
    };

    const handleSortChange = (newSortOption: SortOption) => {
        setSortOption(newSortOption);
    };

    return (
        <>
            <View style={styles.timeList}>
                {isLoading ? (
                    <Text style={designs.text.text}>Loading...</Text>
                ) : error ? (
                    <Text style={designs.text.text}>Error: {error}</Text>
                ) : filteredEntries.length === 0 ? (
                    <Text style={designs.text.text}>No entries found</Text>
                ) : (
                    <FlatList
                        data={filteredEntries}
                        renderItem={renderTimeEntry}
                        keyExtractor={(item) => item.id!.toString()}
                        style={styles.list}
                        initialNumToRender={10}
                        maxToRenderPerBatch={5}
                        windowSize={5}
                        removeClippedSubviews={true}
                    />
                )}
            </View>
            <FilterAndSort
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                tags={tags}
                searchPlaceholder="Search by description"
                isActive={showFilter}
            />
        </>
    );
};

const getStyles = (themeColors: any, designs: any, showFilter: boolean) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        list: {
            flex: 1,
        },
        timeList: {
            flex: 1,
            marginTop: 30,
            marginBottom: showFilter ? 80 : 0,
        },
    });
};

export default TimeList;
