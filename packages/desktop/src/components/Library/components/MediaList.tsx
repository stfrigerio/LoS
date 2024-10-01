import React from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';

import SearchComponent from '@los/shared/src/components/Library/components/SearchComponent';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

import { LibraryData, SortOptionType } from '@los/shared/src/types/Library';

// Import the desktop version of useMediaList
import { useMediaList } from '@los/desktop/src/components/Library/hooks/useMediaList';

interface MediaListProps {
    mediaType: 'movie' | 'book' | 'series' | 'videogame';
    CardComponent: React.ComponentType<{ item: LibraryData; onPress: (item: LibraryData) => void }>;
    DetailedViewComponent: React.ComponentType<{ item: LibraryData; onClose: () => void; onDelete: (item: LibraryData) => void }>;
    SearchModalComponent: React.ComponentType<{ isOpen: boolean; onClose: () => void; onSaveToLibrary: (item: LibraryData) => Promise<void> }>;
}

const MediaList: React.FC<MediaListProps> = ({ mediaType, CardComponent, DetailedViewComponent, SearchModalComponent }) => {
    const {
        items,
        selectedItem,
        sortOption,
        hasMore,
        searchQuery,
        setSearchQuery,
        setSortOption,
        onSaveToLibrary,
        loadMoreItems,
        handleItemSelect,
        handleCloseDetail,
        handleDelete,
    } = useMediaList(mediaType);

    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        let newValue: SortOptionType;
        switch (value) {
            case 'seen':
                newValue = 'seen';
                break;
            case 'year':
                newValue = 'year';
                break;
            case 'rating':
                newValue = 'rating';
                break;
            default:
                newValue = 'seen'; // default value
        }
        setSortOption(newValue);
    };

    return (
        <View style={styles.container}>
            {selectedItem ? (
                <DetailedViewComponent item={selectedItem} onClose={handleCloseDetail} onDelete={handleDelete} />
            ) : (
                <ScrollView
                    style={styles.scrollView}
                >
                    <View style={styles.filteringView}>
                        <View style={styles.searchContainer}>
                            <SearchComponent searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                        </View>
                        <View style={styles.pickerContainer}>
                            <Text style={styles.sortText}>Sort by</Text>
                            <select
                                value={sortOption}
                                onChange={handleSortChange}
                                style={styles.select}
                            >
                                <option value="seen">Seen</option>
                                <option value="year">Release Year</option>
                                <option value="rating">Rating</option>
                            </select>
                        </View>
                    </View>
                    <FlatList
                        data={items}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <CardComponent item={item} onPress={handleItemSelect} />
                        )}
                        scrollEnabled={false}
                    />
                </ScrollView>
            )}
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: theme.backgroundColor
    },
    scrollView: {
        flex: 1,
    },
    input: {
        height: 40,
        borderColor: theme.borderColor,
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
    },
    text: {
        color: theme.textColor,
    },
    item: {
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.borderColor,
    },
    button: {
        margin: 10,
        marginHorizontal: 20,
        padding: 10,
        backgroundColor: '#CC5359',
        borderWidth: 2,
        borderColor: theme.borderColor,
        borderRadius: 10,
        cursor: 'pointer',
    },
    buttonText: {
        color: '#1E2225',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold'
    },
    filteringView: {
        flexDirection: 'row',
        margin: 10,
        padding: 15,
        marginBottom: -10
    },
    pickerContainer: {
        flexDirection: 'column',
    },
    select: {
        color: theme.textColor,
        backgroundColor: theme.backgroundColor,
        padding: 5,
        borderRadius: 5,
        border: `1px solid ${theme.borderColor}`,
    },
    sortText: {
        color: theme.textColor,
        marginLeft: 10
    },
    searchContainer: {
        flexGrow: 1,
    }
});

export default MediaList;