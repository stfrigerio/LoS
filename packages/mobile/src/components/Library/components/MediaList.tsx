import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, NativeSyntheticEvent, NativeScrollEvent, Platform, Dimensions, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ScrollView } from 'react-native-gesture-handler';

import SearchComponent from '@los/shared/src/components/Library/components/SearchComponent';
import { useThemeStyles } from '@los/shared/src/styles//useThemeStyles';
import { useMediaList } from '@los/mobile/src/components/Library/hooks/useMediaList';

import { LibraryData } from '@los/shared/src/types/Library';

interface MediaListProps {
    mediaType: 'movie' | 'book' | 'series' | 'videogame' | 'music';
    CardComponent: React.ComponentType<{ item: LibraryData; onPress: (item: LibraryData) => void }>;
    DetailedViewComponent: React.ComponentType<{
        item: LibraryData;
        onClose: () => void;
        onDelete: (item: LibraryData) => void;
        onToggleDownload?: (item: LibraryData) => Promise<void>;
        updateItem: (item: LibraryData) => Promise<void>;
    }>;
    SearchModalComponent: React.ComponentType<{ isOpen: boolean; onClose: () => void; onSaveToLibrary: (item: LibraryData) => Promise<LibraryData> }>;
    modalVisible: boolean;
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const MediaList: React.FC<MediaListProps> = ({ mediaType, CardComponent, DetailedViewComponent, SearchModalComponent, modalVisible, setModalVisible }) => {
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
        handleToggleDownload,
        updateItem,
    } = useMediaList(mediaType);

    const scrollViewRef = useRef(null);

    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (isCloseToBottom(event.nativeEvent)) {
            loadMoreItems();
        }
    };

    const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };

    return (
        <>
            <View style={styles.container}>
                {selectedItem ? (
                    <DetailedViewComponent 
                        item={selectedItem} 
                        onClose={handleCloseDetail} 
                        onDelete={handleDelete} 
                        onToggleDownload={mediaType === 'music' ? handleToggleDownload : undefined}
                        updateItem={updateItem}
                    />
                ) : (
                    <ScrollView
                        ref={scrollViewRef}
                        onScroll={onScroll}
                        scrollEventThrottle={400}
                    >
                        <View style={styles.filteringView}>
                            <View style={styles.searchContainer}>
                                <SearchComponent searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                            </View>
                            <View style={styles.pickerContainer}>
                                <Text style={styles.sortText}>Sort by</Text>
                                <Picker
                                    selectedValue={sortOption}
                                    onValueChange={(itemValue) => setSortOption(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Seen" value="seen" />
                                    <Picker.Item label="Release Year" value="year" />
                                    <Picker.Item label="Rating" value="rating" />
                                </Picker>
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
                        {hasMore && <Text style={styles.buttonText}>Loading more...</Text>}
                        {modalVisible && 
                            <SearchModalComponent
                                isOpen={modalVisible}
                                onClose={() => setModalVisible(false)}
                                onSaveToLibrary={onSaveToLibrary}
                            />
                        }
                    </ScrollView>
                )}
            </View>
        </>
    );
};

const getStyles = (theme: any) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 10,
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
        picker: {
            color: theme.textColor,
        },
        sortText: {
            color: theme.textColor,
            marginLeft: 10
        },
        searchContainer: {
            flexGrow: 1,
        }
    });
};

export default MediaList;