import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Pressable, FlatList, StyleSheet, Image, Alert } from 'react-native';

import { useSpotifyFetcher, Album } from '../api/musicFetcher';
import { useThemeStyles } from '../../../styles/useThemeStyles';

import { LibraryData } from '../../../types/Library';

interface MusicSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveToLibrary: (album: LibraryData) => void;
}

const MusicSearchModal: React.FC<MusicSearchModalProps> = ({ isOpen, onClose, onSaveToLibrary }) => {
    const [query, setQuery] = useState('');
    const [albums, setAlbums] = useState<Album[]>([]);
    const [personalRating, setPersonalRating] = useState('');
    const [showSearch, setShowSearch] = useState(true);
    const [showAlbumsList, setShowAlbumsList] = useState(false);
    const [showRatingInput, setShowRatingInput] = useState(false);
    const [detailedAlbum, setDetailedAlbum] = useState<LibraryData | null>(null);

    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const { fetchAlbums, getAlbumById } = useSpotifyFetcher();

    const handleSearch = async () => {
        try {
            const fetchedAlbums = await fetchAlbums(query);
            if (fetchedAlbums.length === 0) {
                // The user has already been alerted in fetchAlbums, so we just return
                return;
            }
            setAlbums(fetchedAlbums);
            setShowSearch(false);
            setShowAlbumsList(true);
        } catch (error) {
            console.error('Error searching albums:', error);
            Alert.alert('Error', 'Failed to search albums. Please try again.');
        }
    };

    const handleSelectAlbum = async (album: Album) => {
        const detailedData = await getAlbumById(album.id);
        if (detailedData) {
            setDetailedAlbum(detailedData);
            setShowAlbumsList(false);
            setShowRatingInput(true);
        }
    };

    const handleSaveCustomAlbumFromQuery = () => {
        if (!query) {
            Alert.alert('Error', 'Please enter an album name.');
            return;
        }
    
        //@ts-ignore we dont pass id
        const libraryData: LibraryData = {
            title: query,
            rating: 0, // Default rating, adjust as needed
            comments: '',
            seen: new Date().toISOString(),
            type: 'music',
            genre: 'custom',
            creator: 'custom',
            releaseYear: new Date().getFullYear().toString(),
            mediaImage: 'custom',
            finished: 1,
        };
    
        onSaveToLibrary(libraryData);
    
        // Reset states after saving
        setQuery('');
        onClose(); // Close modal after saving
    };

    const handleSave = () => {
        if (detailedAlbum) {
            const libraryData: LibraryData = {
                ...detailedAlbum,
                rating: parseFloat(personalRating),
                comments: '', // You might want to add a field for comments in your modal
            };

            onSaveToLibrary(libraryData);

            // reset everything
            setQuery('');
            setAlbums([]);
            setPersonalRating('');
            setShowSearch(true);
            setShowAlbumsList(false);
            setShowRatingInput(false);
            setDetailedAlbum(null);

            onClose();
        }
    };

    return (
        <Modal visible={isOpen} onRequestClose={onClose} transparent={true}>
            <View style={designs.modal.modalContainer}>
                <View style={designs.modal.modalView}>
                    {showSearch && (
                        <>
                            <Text style={designs.text.title}>Search for an Album</Text>
                            <TextInput
                                style={designs.text.input}
                                value={query}
                                onChangeText={setQuery}
                                onEndEditing={(e) => setQuery(e.nativeEvent.text.trim())}
                                placeholder="Enter album title"
                                placeholderTextColor={'gray'}
                                onSubmitEditing={handleSearch}
                            />
                            <Pressable style={designs.button.marzoPrimary} onPress={handleSearch}>
                                <Text style={designs.button.buttonText}>Search</Text>
                            </Pressable>
                            <Pressable style={designs.button.marzoSecondary} onPress={handleSaveCustomAlbumFromQuery}>
                                <Text style={designs.button.buttonText}>Add Custom Album</Text>
                            </Pressable>
                        </>
                    )}
                    {showAlbumsList && (
                        <FlatList
                            data={albums}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Pressable style={styles.albumItem} onPress={() => handleSelectAlbum(item)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={{ uri: item.images[0]?.url }} style={styles.albumImage} />
                                        <View style={{ flexDirection: 'column'}}>
                                            <Text style={[designs.text.text, {fontWeight: 'bold'}]}>{item.name}</Text>
                                            <Text style={designs.text.text}>{item.artists[0].name}</Text>
                                            <Text style={designs.text.text}>({new Date(item.release_date).getFullYear()})</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            )}
                        />
                    )}
                    {showRatingInput && detailedAlbum && (
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <Text style={designs.text.title}>Rate this album</Text>
                            <TextInput
                                style={designs.text.input}
                                value={personalRating}
                                onChangeText={setPersonalRating}
                                placeholder="Your Rating"
                                placeholderTextColor={'gray'}
                                keyboardType="numeric"
                                onSubmitEditing={handleSave}
                            />
                            <Pressable style={designs.button.marzoSecondary} onPress={handleSave}>
                                <Text style={designs.button.buttonText}>Save to Library</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default MusicSearchModal;

const getStyles = (theme: any) => StyleSheet.create({
    albumItem: {
        paddingHorizontal: 10,
        padding: 15,
        marginVertical: 0,
        backgroundColor: theme.backgroundColor,
        borderBottomWidth: 1,
        borderColor: theme.borderColor,
        borderRadius: 5,
    },
    albumImage: {
        width: 50,
        height: 50,
        marginRight: 10,
    }
});