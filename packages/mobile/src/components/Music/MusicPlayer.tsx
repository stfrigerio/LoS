import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Alert, BackHandler, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faMusic, faPlay, faStar, faLink, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';

import MusicPlayerControls from './components/MusicPlayerControls';
import LinkTrackModal from './modals/LinkTrackModal';

import { databaseManagers } from '@los/mobile/src/database/tables';
import { autoLinkTracks } from './helpers/autoLinkTracks';
import { TrackData } from '@los/shared/src/types/Library';
import { useMusicPlayer } from './contexts/MusicPlayerContext';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface Album {
    name: string;
    songs: string[];
    uuid?: string;
}

interface ExtendedTrackData extends TrackData {
    artistName: string;
}

const MusicPlayer = () => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
    const [trackDetails, setTrackDetails] = useState<{ [key: string]: TrackData }>({});
    const [selectedSongForLinking, setSelectedSongForLinking] = useState<string | null>(null);
    const [availableTracks, setAvailableTracks] = useState<ExtendedTrackData[]>([]);

    const { playSound, currentTrackData } = useMusicPlayer();

    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    useEffect(() => {
        loadAlbums();
    }, []);

    useEffect(() => {
        if (selectedAlbum) {
            loadTrackDetails();
        }
    }, [selectedAlbum]);

    useEffect(() => {
        if (currentTrackData) {
            loadTrackDetails();
        }
    }, [currentTrackData]);

    const loadTrackDetails = async () => {
        if (!selectedAlbum) return;
        
        const details: { [key: string]: TrackData } = {};
        for (const song of selectedAlbum.songs) {
            try {
                // First try to get track by fileName
                let tracks = await databaseManagers.music.getMusicTracks({ 
                    fileName: song 
                });
                
                // If not found by fileName, try by trackName
                if (!tracks || tracks.length === 0) {
                    const trackName = song.split('.').slice(0, -1).join('.');
                    tracks = await databaseManagers.music.getMusicTracks({ 
                        trackName 
                    });
                }

                if (tracks && tracks.length > 0) {
                    const trackName = song.split('.').slice(0, -1).join('.');
                    details[trackName] = tracks[0];
                }
            } catch (error) {
                console.error('Error loading track details:', error);
            }
        }
        setTrackDetails(details);
    };

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (selectedAlbum) {
                setSelectedAlbum(null);
                return true; // Prevent default behavior
                }
                return false; // Allow default behavior
            };
        
            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [selectedAlbum])
    )

    const loadAlbums = async () => {
        const musicDir = `${FileSystem.documentDirectory}Music`;
        try {
            const albumDirs = await FileSystem.readDirectoryAsync(musicDir);
            
            // Get all music albums from library
            const libraryAlbums = await databaseManagers.library.getLibrary({ 
                type: 'music' 
            });
    
            const loadedAlbums: Album[] = await Promise.all(
                albumDirs.map(async (albumName) => {
                    const albumPath = `${musicDir}/${albumName}`;
                    const songs = await FileSystem.readDirectoryAsync(albumPath);
                    const libraryEntry = libraryAlbums.find(album => album.title === albumName);
                    return { 
                        name: albumName, 
                        songs,
                        uuid: libraryEntry?.uuid
                    };
                })
            );
            setAlbums(loadedAlbums);
        } catch (error) {
            console.error('Failed to load albums:', error);
        }
    };

    const renderRating = (rating: number = 0) => (
        <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesomeIcon 
                    key={star}
                    icon={faStar} 
                    size={14} 
                    color={star <= rating ? themeColors.textColor : themeColors.borderColor} 
                />
            ))}
        </View>
    );

    const renderAlbumItem = ({ item }: { item: Album }) => (
        <Pressable 
            style={({ pressed }) => [
                styles.albumItem,
                pressed && styles.albumItemPressed
            ]} 
            onPress={() => setSelectedAlbum(item)}
        >
            <View style={styles.albumIconContainer}>
                <FontAwesomeIcon 
                    icon={faMusic} 
                    size={20} 
                    color={themeColors.textColorItalic} 
                />
            </View>
            <Text style={styles.albumTitle}>{item.name}</Text>
            <Text style={styles.songCount}>{item.songs.length} tracks</Text>
        </Pressable>
    );

    const loadAvailableTracks = async () => {
        try {
            // Get all tracks for this album
            const tracks = await databaseManagers.music.getMusicTracks({ 
                libraryUuid: selectedAlbum!.uuid
            });
            
            // Get the album details from library
            const albumDetails = await databaseManagers.library.getLibrary({
                uuid: tracks[0]?.libraryUuid
            });

            // Process tracks to add artist name from album creator
            const tracksWithArtist = tracks.map(track => ({
                ...track,
                artistName: albumDetails[0]?.creator || 'Unknown Artist'
            }));

            // Filter out tracks that are already linked to files
            const unlinkedTracks = tracksWithArtist.filter(track => !track.fileName);
            setAvailableTracks(unlinkedTracks);
        } catch (error) {
            console.error('Error loading available tracks:', error);
        }
    };

    const handleLinkTrack = async (selectedTrack: ExtendedTrackData) => {
        if (!selectedSongForLinking) return;
        
        try {
            // Remove artistName from the track data before saving
            const { artistName, ...trackDataToSave } = selectedTrack;
            
            await databaseManagers.music.upsert({
                ...trackDataToSave,
                fileName: selectedSongForLinking
            });
            setSelectedSongForLinking(null);
            loadTrackDetails();
        } catch (error) {
            console.error('Error linking track:', error);
            Alert.alert('Error', 'Failed to link track to file');
        }
    };

    const handleAutoLink = async () => {
        if (!selectedAlbum?.uuid) return;

        try {
            const result = await autoLinkTracks(
                selectedAlbum.uuid, 
                selectedAlbum.songs,
                { 
                    similarityThreshold: 0.8,
                    ignoreTrackNumbers: true,
                    ignoreCase: true
                }
            );

            if (result.success) {
                Alert.alert(
                    'Auto-link Complete', 
                    `Successfully linked ${result.linkedCount} tracks.`
                );
                loadTrackDetails();
            } else {
                Alert.alert(
                    'Auto-link Failed',
                    result.errors?.join('\n') || 'Unknown error occurred'
                );
            }
        } catch (error) {
            console.error('Error during auto-link:', error);
            Alert.alert('Error', 'Failed to auto-link tracks');
        }
    };

    const renderAlbumHeader = () => {
        if (!selectedAlbum) return null;

        return (
            <View style={styles.albumHeader}>
                <Pressable 
                    style={styles.backButton} 
                    onPress={() => setSelectedAlbum(null)}
                >
                    <FontAwesomeIcon 
                        icon={faArrowLeft} 
                        color={themeColors.textColor} 
                        size={20} 
                    />
                </Pressable>
                <Text style={styles.albumTitle}>{selectedAlbum.name}</Text>
                <Pressable 
                    style={styles.autoLinkButton}
                    onPress={handleAutoLink}
                >
                    <FontAwesomeIcon 
                        icon={faMagicWandSparkles} 
                        size={14} 
                        color={themeColors.textColorItalic} 
                    />
                </Pressable>
            </View>
        );
    };
    
    const renderSongItem = ({ item, index }: { item: string, index: number }) => {
        const trackName = item.split('.').slice(0, -1).join('.');
        const trackData = trackDetails[trackName];
        
        return (
            <Pressable 
                style={({ pressed }) => [
                    styles.songItem,
                    pressed && styles.songItemPressed
                ]} 
                onPress={() => playSound(selectedAlbum!.name, item, selectedAlbum!.songs)}
            >
                <View style={styles.songMainInfo}>
                    <View style={styles.songIconContainer}>
                        <Text style={styles.trackNumber}>
                            {(index + 1).toString().padStart(2, '0')}
                        </Text>
                    </View>
                    <View style={styles.songDetails}>
                        <Text style={styles.songTitle}>
                            {trackName}
                        </Text>
                        {trackData ? (
                            <View style={styles.songMetadata}>
                                {renderRating(trackData.rating)}
                                <Text style={styles.playCount}>
                                    Plays: {trackData.playCount || 0}
                                </Text>
                                <Text style={styles.duration}>
                                    {Math.floor(trackData.durationMs / 1000 / 60)}:
                                    {String(Math.floor((trackData.durationMs / 1000) % 60)).padStart(2, '0')}
                                </Text>
                            </View>
                        ) : (
                            <Pressable 
                                style={styles.linkButton}
                                onPress={() => {
                                    loadAvailableTracks();
                                    setSelectedSongForLinking(item);
                                }}
                            >
                                <FontAwesomeIcon 
                                    icon={faLink} 
                                    size={14} 
                                    color={themeColors.textColorItalic} 
                                />
                                <Text style={styles.linkText}>Link to track</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
                <FontAwesomeIcon 
                    icon={faPlay} 
                    size={16} 
                    color={themeColors.textColorItalic} 
                />
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Music Library</Text>
            {selectedAlbum ? (
                <>
                    {renderAlbumHeader()}
                    <FlatList
                        data={selectedAlbum.songs}
                        renderItem={renderSongItem}
                        keyExtractor={(item) => item}
                        contentContainerStyle={styles.songList}
                    />
                </>
            ) : (
                <FlatList
                    data={albums}
                    renderItem={renderAlbumItem}
                    keyExtractor={(item) => item.name}
                    contentContainerStyle={styles.albumList}
                />
            )}
            <View style={styles.playerControlsContainer}>
                <MusicPlayerControls />
            </View>
            <LinkTrackModal 
                isVisible={!!selectedSongForLinking}
                onClose={() => setSelectedSongForLinking(null)}
                fileName={selectedSongForLinking || ''}
                availableTracks={availableTracks}
                onLinkTrack={handleLinkTrack}
            />
        </View>
    );
};



const getStyles = (themeColors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColors.backgroundColor,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: themeColors.textColorBold,
        marginTop: 60,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 10,
        backgroundColor: themeColors.cardColor,
        borderRadius: 12,
        marginRight: 15,
    },
    selectedAlbumTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: themeColors.textColorBold,
        flex: 1,
    },
    albumList: {
        padding: 20,
    },
    songList: {
        padding: 20,
    },
    albumItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.cardColor,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: themeColors.borderColor,
    },
    albumItemPressed: {
        backgroundColor: themeColors.hoverColor,
        transform: [{ scale: 0.98 }],
    },
    albumIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: themeColors.backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    albumTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: themeColors.textColorBold,
    },
    songCount: {
        fontSize: 14,
        color: themeColors.textColorItalic,
    },
    songItemPressed: {
        backgroundColor: themeColors.hoverColor,
        transform: [{ scale: 0.98 }],
    },
    playerControlsContainer: {
        padding: 20,
        paddingBottom: 30,
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: themeColors.cardColor,
        padding: 15,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: themeColors.borderColor,
    },
    songMainInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    songDetails: {
        flex: 1,
    },
    songTitle: {
        fontSize: 16,
        color: themeColors.textColor,
        marginBottom: 4,
    },
    songMetadata: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    playCount: {
        fontSize: 12,
        color: themeColors.textColorItalic,
    },
    duration: {
        fontSize: 12,
        color: themeColors.textColorItalic,
        fontFamily: 'monospace',
    },
    songIconContainer: {
        width: 30,
        marginRight: 15,
        justifyContent: 'center',
    },
    trackNumber: {
        fontSize: 14,
        color: themeColors.textColorItalic,
        fontFamily: 'monospace',
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    linkText: {
        fontSize: 12,
        color: themeColors.textColorItalic,
    },
    albumHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: themeColors.cardColor,
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: themeColors.borderColor,
    },
    autoLinkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.backgroundColor,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    autoLinkText: {
        fontSize: 14,
        color: themeColors.textColorItalic,
    },
});

export default MusicPlayer;