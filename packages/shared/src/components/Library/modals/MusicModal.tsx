import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Pressable, FlatList, StyleSheet, Image, Alert } from 'react-native';

import { useSpotifyFetcher, Album } from '../api/musicFetcher';
import { useThemeStyles } from '../../../styles/useThemeStyles';

import { LibraryData, TrackData } from '../../../types/Library';
import { databaseManagers } from '@los/mobile/src/database/tables';

interface MusicSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveToLibrary: (album: LibraryData) => Promise<LibraryData>; // Now expects return value
}

const MusicSearchModal: React.FC<MusicSearchModalProps> = ({ isOpen, onClose, onSaveToLibrary }) => {
    const [query, setQuery] = useState('');
    const [albums, setAlbums] = useState<Album[]>([]);
    const [personalRating, setPersonalRating] = useState('');
    const [showSearch, setShowSearch] = useState(true);
    const [showAlbumsList, setShowAlbumsList] = useState(false);
    const [showRatingInput, setShowRatingInput] = useState(false);
    const [detailedAlbum, setDetailedAlbum] = useState<LibraryData | null>(null);
    const [loadingTrack, setLoadingTrack] = useState<string | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [tracks, setTracks] = useState<TrackData[]>([]);

    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const { fetchAlbums, getAlbumById, getTrackDetails, apiGet, getAccessToken } = useSpotifyFetcher();

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
            if (detailedData.cast) {
                const tracks = detailedData.cast.split(' | ');
                
                const token = await getAccessToken();
                if (!token) {
                    console.error('No access token available');
                    return;
                }
    
                const albumRes = await apiGet(`albums/${album.id}`, {}, token);
                
                if (albumRes && albumRes.tracks && albumRes.tracks.items) {
                    setProgress({ current: 0, total: albumRes.tracks.items.length });
                    const tracksToSave: TrackData[] = [];
    
                    for (let i = 0; i < albumRes.tracks.items.length; i++) {
                        const track = albumRes.tracks.items[i];
                        setLoadingTrack(track.name);
                        setProgress(prev => ({ ...prev, current: i + 1 }));
                        
                        const trackDetails = await getTrackDetails(track.id);
                        if (trackDetails && trackDetails.audioFeatures) {
                            const trackData: TrackData = {
                                uuid: track.id,
                                libraryUuid: '', // Will be set after album save
                                trackName: track.name,
                                trackNumber: track.track_number,
                                durationMs: track.duration_ms,
                                popularity: trackDetails.popularity,
                                previewUrl: trackDetails.previewUrl,
                                // Audio Features
                                tempo: trackDetails.audioFeatures.tempo,
                                key: trackDetails.audioFeatures.key,
                                mode: Number(trackDetails.audioFeatures.mode) === 1 ? "Major" : "Minor", 
                                timeSignature: `${trackDetails.audioFeatures.timeSignature}`,
                                danceability: Math.round(trackDetails.audioFeatures.danceability),
                                energy: Math.round(trackDetails.audioFeatures.energy),
                                speechiness: Math.round(trackDetails.audioFeatures.speechiness),
                                acousticness: Math.round(trackDetails.audioFeatures.acousticness),
                                instrumentalness: Math.round(trackDetails.audioFeatures.instrumentalness),
                                liveness: Math.round(trackDetails.audioFeatures.liveness),
                                valence: Math.round(trackDetails.audioFeatures.valence),
                                playCount: 0,
                                rating: 0,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            };
                            tracksToSave.push(trackData);
                        }
                    }
                    setTracks(tracksToSave);
                    setLoadingTrack(null);
                }
            }
    
            setDetailedAlbum(detailedData);
            setShowAlbumsList(false);
            setShowRatingInput(true);
        }
    };

    const handleSave = async () => {
        if (detailedAlbum) {
            const libraryData: LibraryData = {
                ...detailedAlbum,
                rating: parseFloat(personalRating),
                comments: '',
            };
    
            // Save the album first to get its UUID
            const savedAlbum = await onSaveToLibrary(libraryData);
    
            // Now save all tracks with the album's UUID
            for (const track of tracks) {
                const trackWithAlbumUuid: TrackData = {
                    ...track,
                    libraryUuid: savedAlbum.uuid!,
                };
                
                try {
                    await databaseManagers.music.upsert(trackWithAlbumUuid);
                } catch (error) {
                    console.error(`Error saving track ${track.trackName}:`, error);
                }
            }

            // Reset everything
            setQuery('');
            setAlbums([]);
            setPersonalRating('');
            setShowSearch(true);
            setShowAlbumsList(false);
            setShowRatingInput(false);
            setDetailedAlbum(null);
            setTracks([]);
    
            onClose();
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

    // Add this loading indicator component
    const renderLoadingIndicator = () => {
        if (!loadingTrack) return null;
        
        return (
            <View style={styles.loadingContainer}>
                <Text style={[designs.text.text, styles.loadingText]}>
                    Fetching track {progress.current} of {progress.total}
                </Text>
                <Text style={[designs.text.text, styles.loadingTrackName]}>
                    "{loadingTrack}"
                </Text>
            </View>
        );
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
                            <Pressable style={[designs.button.marzoPrimary, {width: '100%'}]} onPress={handleSearch}>
                                <Text style={designs.button.buttonText}>Search</Text>
                            </Pressable>
                            <Pressable style={[designs.button.marzoSecondary, {width: '100%'}]} onPress={handleSaveCustomAlbumFromQuery}>
                                <Text style={designs.button.buttonText}>Add Custom Album</Text>
                            </Pressable>
                        </>
                    )}
                    {showAlbumsList && !loadingTrack && (
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
                    {loadingTrack && renderLoadingIndicator()}
                    {showRatingInput && detailedAlbum && !loadingTrack && (
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
                            <Pressable style={[designs.button.marzoSecondary, {width: '100%'}]} onPress={handleSave}>
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
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginBottom: 10,
        textAlign: 'center',
    },
    loadingTrackName: {
        fontStyle: 'italic',
        textAlign: 'center',
        color: theme.textColorFaded || 'gray',
    },
});