import { useState, useEffect } from 'react';
import axios from 'axios';

import { sortOptions, PAGE_SIZE } from '@los/shared/src/components/Library/helpers/sortOptions';
import { BASE_URL } from '@los/shared/src/utilities/constants';

import { LibraryData, SortOptionType } from '@los/shared/src/types/Library';


export const useMediaList = (mediaType: 'movie' | 'book' | 'series' | 'videogame') => {
    const [items, setItems] = useState<LibraryData[]>([]);
    const [sortedItems, setSortedItems] = useState<LibraryData[]>([]);
    const [selectedItem, setSelectedItem] = useState<LibraryData | null>(null);
    const [sortOption, setSortOption] = useState<SortOptionType>('seen');
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const fetchItems = async (page = 1, sort = sortOption, search = '') => {
        try {
            const response = await axios.get(`${BASE_URL}/library/listByType/${mediaType}`, {
                params: {
                    type: mediaType,
                    sort: sort,
                    search: search,
                    limit: PAGE_SIZE,
                    offset: (page - 1) * PAGE_SIZE
                }
            });

            const fetchedItems = response.data;

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
            await axios.post(`${BASE_URL}/library/upsert`, item);
            fetchItems();
        } catch (error) {
            console.error(`Error saving ${mediaType} to library:`, error);
            // Consider using a desktop-specific notification method here
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
            await axios.delete(`${BASE_URL}/library/remove/${item.uuid}`);
            console.log(`${mediaType} deleted successfully`);
            fetchItems();
        } catch (error) {
            console.error(`Error deleting ${mediaType}:`, error);
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
    };
};