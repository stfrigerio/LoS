import React, { useState, useEffect, useMemo } from 'react';
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
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);
    
    const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());

    const sortedEntries = useMemo(() => {
        return [...entries].sort((a: TimeData, b: TimeData) => 
            new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime()
        );
    }, [entries]);
    
    const [filteredEntries, setFilteredEntries] = useState<TimeData[]>(sortedEntries);
    const tags: string[] = useMemo(() => {
        return Array.from(new Set(entries.map((entry: TimeData) => entry.tag)));
    }, [entries]);

    useEffect(() => {
        setFilteredEntries(sortedEntries);
    }, [sortedEntries]);

    const toggleExpand = (id: number) => {
        setExpandedEntries(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const renderTimeEntry = React.useCallback(({ item }: { item: TimeData }) => (
        <TimeEntry
            item={item}
            isExpanded={expandedEntries.has(item.id!)}
            toggleExpand={toggleExpand}
            onUpdateTimeEntry={editTimeEntry}
            deleteTimeEntry={deleteTimeEntry}
        />
    ), [expandedEntries, toggleExpand]);


    const handleFilterChange = (filters: FilterOptions) => {
        const filtered = entries.filter((entry: TimeData) => {
            const entryDate = new Date(entry.date!);
            entryDate.setHours(0, 0, 0, 0);  // Reset time to start of day
    
            const inDateRange = (!filters.dateRange.start || entryDate >= new Date(filters.dateRange.start.setHours(0, 0, 0, 0))) &&
                                (!filters.dateRange.end || entryDate <= new Date(filters.dateRange.end.setHours(0, 0, 0, 0)));
    
            const matchesTags = filters.tags.length === 0 || filters.tags.includes(entry.tag);
            const matchesSearch = entry.description!.toLowerCase().includes(filters.searchTerm.toLowerCase());
            return inDateRange && matchesTags && matchesSearch;
        });
        setFilteredEntries(filtered);
    };

    const handleSortChange = (sortOption: SortOption) => {
        const sorted = [...filteredEntries].sort((a: TimeData, b: TimeData) => {
            switch (sortOption) {
                case 'recent':
                    return new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime();
                case 'oldest':
                    return new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime();
                case 'highestValue':
                    return b.duration!.localeCompare(a.duration!);
                case 'lowestValue':
                    return a.duration!.localeCompare(b.duration!);
                default:
                    return 0;
            }
        });
        setFilteredEntries(sorted);
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
            {showFilter && (
                <FilterAndSort
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                    tags={tags}
                    searchPlaceholder="Search by description"
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
            flex: 1,
            backgroundColor: themeColors.backgroundColor,
            padding: 20,
            marginTop: isDesktop ? 0 : 37,
        },
        header: {
            alignItems: 'center',
            marginBottom: 10,
            fontFamily: 'serif',
        },
        headerText: {
            ...designs.text.title,
            fontSize: 24,
            fontFamily: 'serif',
        },
        viewToggle: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 20,
        },
        chartIcon: {
            marginLeft: 15,
        },
        list: {
            flex: 1,
        },
        graphPlaceholder: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
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
        timeList: {
            flex: 1,
            marginTop: 30,
        },
    });
};

export default TimeList;