import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

import { sortOptions, PAGE_SIZE } from '@los/shared/src/components/Library/helpers/sortOptions';
import { databaseManagers } from '../../../database/tables';

import { LibraryData, SortOptionType } from '@los/shared/src/types/Library';

export const useMediaList = (mediaType: 'movie' | 'book' | 'series' | 'videogame' | 'music') => {
    const [items, setItems] = useState<LibraryData[]>([]);
    const [sortedItems, setSortedItems] = useState<LibraryData[]>([]);
    const [selectedItem, setSelectedItem] = useState<LibraryData | null>(null);
    const [sortOption, setSortOption] = useState<SortOptionType>('seen');
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const fetchItems = async (page = 1, sort = sortOption, search = '') => {
        try {
        const fetchedItems = await databaseManagers.library.getLibrary({ 
            type: mediaType,
            sort: sort,
            search: search,
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE
        });

        if (page === 1) {
            setItems(fetchedItems);
        } else {
            const itemsMap = new Map([...items, ...fetchedItems].map(item => [item.id, item]));
            setItems(Array.from(itemsMap.values()));
        }
        setHasMore(fetchedItems.length === PAGE_SIZE);
        } catch (error) {
        console.error(`Error fetching ${mediaType}:`, error);
        }
    };

    useEffect(() => {
        fetchItems(1, sortOption, searchQuery);
    }, [sortOption, searchQuery]);

    useEffect(() => {
        const filteredAndSorted = items
        .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort(sortOptions[sortOption]);
        setSortedItems(filteredAndSorted);
    }, [items, sortOption, searchQuery]);

    const onSaveToLibrary = async (item: LibraryData) => {
        try {
            // console.log('Saving to library:', JSON.stringify(item, null, 2));
            await databaseManagers.library.upsert(item);
            fetchItems();
        } catch (error) {
            console.error(`Error saving ${mediaType} to library:`, error);
            Alert.alert("Error", `Failed to save the ${mediaType} to your library. Please try again.`);
        }
    };

    const loadMoreItems = () => {
        if (hasMore) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchItems(nextPage, sortOption, searchQuery);
        }
    };

    const handleItemSelect = (item: LibraryData) => {
        setSelectedItem(item);
    };

    const handleCloseDetail = () => {
        setSelectedItem(null);
    };

    const handleDelete = async (item: LibraryData) => {
        try {
            await databaseManagers.library.remove(item.id);
            Alert.alert("Success", `${mediaType} deleted successfully`);
            fetchItems();
        } catch (error) {
            console.error(`Error deleting ${mediaType}:`, error);
            Alert.alert("Error", `Failed to delete the ${mediaType}`);
        }
    };

    const handleToggleDownload = async (item: LibraryData) => {
        try {
            const updatedItem = {
                ...item,
                isMarkedForDownload: item.isMarkedForDownload === 1 ? 0 : 1
            };
            await databaseManagers.library.upsert(updatedItem);
            setItems(prevItems =>
                prevItems.map(i => i.id === item.id ? updatedItem : i)
            );
            setSortedItems(prevItems =>
                prevItems.map(i => i.id === item.id ? updatedItem : i)
            );
            // If you have a selectedItem state, update it as well
            if (selectedItem && selectedItem.id === item.id) {
                setSelectedItem(updatedItem);
            }
        } catch (error) {
            console.error(`Error toggling download for ${mediaType}:`, error);
            Alert.alert("Error", `Failed to toggle download for the ${mediaType}`);
        }
    };

    const updateItem = async (updatedItem: LibraryData) => {
        try {
            await databaseManagers.library.upsert(updatedItem);
            
            setItems(prevItems =>
                prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
            );
            
            setSortedItems(prevSortedItems =>
                prevSortedItems.map(item => item.id === updatedItem.id ? updatedItem : item)
            );

            if (selectedItem && selectedItem.id === updatedItem.id) {
                setSelectedItem(updatedItem);
            }
        } catch (error) {
            console.error(`Error updating ${mediaType}:`, error);
            Alert.alert("Error", `Failed to update the ${mediaType}. Please try again.`);
        }
    };
    
    return {
        items: sortedItems,
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
        handleToggleDownload,
        updateItem,
    };
};