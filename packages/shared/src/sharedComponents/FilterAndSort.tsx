import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import createTimePicker from '@los/shared/src/sharedComponents/DateTimePicker';
import { Picker } from '@react-native-picker/picker';
import { PickerInput } from '@los/shared/src/components/modals/components/FormComponents';

import { useThemeStyles } from '../styles/useThemeStyles';

interface FilterAndSortProps {
    onFilterChange: (filters: FilterOptions) => void;
    onSortChange: (sortOption: SortOption) => void;
    tags: string[];
    searchPlaceholder: string;
}

export interface FilterOptions {
    dateRange: { start: Date | null; end: Date | null };
    tags: string[];
    searchTerm: string;
}

export type SortOption = 'recent' | 'oldest' | 'highestValue' | 'lowestValue';

const FilterAndSort: React.FC<FilterAndSortProps> = ({ onFilterChange, onSortChange, tags, searchPlaceholder }) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors), [themeColors]);
    const TimePicker = useCallback(createTimePicker, [])();

    const [filters, setFilters] = useState<FilterOptions>({
        dateRange: { start: null, end: null },
        tags: [],
        searchTerm: '',
    });
    const [sortOption, setSortOption] = useState<SortOption>('recent');

    const handleDateChange = (type: 'start' | 'end', date: Date | undefined) => {
            setFilters(prev => ({
            ...prev,
            dateRange: { ...prev.dateRange, [type]: date || null },
            }));
            onFilterChange({ ...filters, dateRange: { ...filters.dateRange, [type]: date || null } });
        };
        
    const showDatePicker = (type: 'start' | 'end') => {
        TimePicker.showPicker(
            {
                mode: 'date',
                value: filters.dateRange[type] || new Date(),
            },
            (date) => handleDateChange(type, date)
        );
    };

    const handleTagChange = (tag: string) => {
        const newTags = filters.tags.includes(tag)
        ? filters.tags.filter(t => t !== tag)
        : [...filters.tags, tag];
        setFilters(prev => ({ ...prev, tags: newTags }));
        onFilterChange({ ...filters, tags: newTags });
    };

    const handleSearchChange = (text: string) => {
        setFilters(prev => ({ ...prev, searchTerm: text }));
        onFilterChange({ ...filters, searchTerm: text });
    };

    const handleSortChange = (option: SortOption) => {
        setSortOption(option);
        onSortChange(option);
    };

    const sortOptions = [
        { label: 'Most Recent', value: 'recent' },
        { label: 'Oldest', value: 'oldest' },
        { label: 'Highest Value', value: 'highestValue' },
        { label: 'Lowest Value', value: 'lowestValue' },
    ];

    return (
        <View style={styles.container}>   
            <Text style={styles.sectionTitle}>Date Range</Text>         
            <View style={styles.dateContainer}>
                <Pressable style={styles.dateButton}onPress={() => showDatePicker('start')}>
                    <Text style={designs.text.text}>Start Date: {filters.dateRange.start ? filters.dateRange.start.toDateString() : 'Not set'}</Text>
                </Pressable>
                <Pressable style={styles.dateButton} onPress={() => showDatePicker('end')}>
                    <Text style={designs.text.text}>End Date: {filters.dateRange.end ? filters.dateRange.end.toDateString() : 'Not set'}</Text>
                </Pressable>
            </View>

            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
                {tags.map(tag => (
                <Pressable
                    key={tag}
                    style={[styles.tagButton, filters.tags.includes(tag) && styles.tagButtonSelected]}
                    onPress={() => handleTagChange(tag)}
                >
                    <Text style={filters.tags.includes(tag) ? styles.tagTextSelected : styles.tagText}>{tag}</Text>
                </Pressable>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Search</Text>
            <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                value={filters.searchTerm}
                onChangeText={handleSearchChange}
                placeholderTextColor={'gray'}
            />

            <PickerInput
                label="Sort by"
                selectedValue={sortOption}
                onValueChange={(itemValue) => handleSortChange(itemValue as SortOption)}
                items={sortOptions}
            />

            {TimePicker.picker}
        </View>
    );
};

const getStyles = (themeColors: any) => StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 40
        // borderWidth: 1,
        // borderColor: themeColors.borderColor,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: themeColors.textColor,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateButton: {
        padding: 10,
        margin: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: themeColors.borderColor,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: themeColors.borderColor,
        padding: 8,
        borderRadius: 16,
    },
    tagButton: {
        padding: 8,
        margin: 4,
        borderRadius: 16,
        backgroundColor: themeColors.backgroundSecondary,
    },
    tagButtonSelected: {
        backgroundColor: themeColors.hoverColor,
    },
    tagText: {
        color: themeColors.textColor,
    },
    tagTextSelected: {
        color: themeColors.backgroundColor,
    },
    searchInput: {
        height: 40,
        borderColor: themeColors.borderColor,
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
        color: themeColors.textColor,
        borderRadius: 8,
    },
    sectionTitle: {
        color: 'gray',
        marginBottom: 8,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default FilterAndSort;