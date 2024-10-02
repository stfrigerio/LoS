import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Alert, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
// import * as BackgroundFetch from 'expo-background-fetch';
// import * as TaskManager from 'expo-task-manager';
import * as FileSystem from 'expo-file-system';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import MusicPlayerControls from './components/MusicPlayerControls';

import { useMusicPlayer } from './contexts/MusicPlayerContext';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

// const BACKGROUND_FETCH_TASK = 'background-fetch';

// TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
//     // This is where you can update playback status, sync new songs, etc.
//     return BackgroundFetch.BackgroundFetchResult.NewData;
// });

interface Album {
    name: string;
    songs: string[];
}

const MusicPlayer = () => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

    const { playSound } = useMusicPlayer();

    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    useEffect(() => {
        // registerBackgroundFetch();
        loadAlbums();
    }, []);

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

    // const registerBackgroundFetch = async () => {
    //     try {
    //     await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    //         minimumInterval: 60 * 15, // 15 minutes
    //         stopOnTerminate: false,
    //         startOnBoot: true,
    //     });
    //     } catch (err) {
    //         console.log('Background fetch failed to register:', err);
    //     }
    // };

    const loadAlbums = async () => {
        const musicDir = `${FileSystem.documentDirectory}Music`;
        try {
            const albumDirs = await FileSystem.readDirectoryAsync(musicDir);
            const loadedAlbums: Album[] = await Promise.all(
                albumDirs.map(async (albumName) => {
                    const albumPath = `${musicDir}/${albumName}`;
                    const songs = await FileSystem.readDirectoryAsync(albumPath);
                    return { name: albumName, songs };
                })
            );
            setAlbums(loadedAlbums);
        } catch (error) {
            console.error('Failed to load albums:', error);
        }
    };

    const handlePlaySound = (albumName: string, songName: string, albumSongs: string[]) => {
        playSound(albumName, songName, albumSongs);
    };

    const renderAlbumItem = ({ item }: { item: Album }) => (
        <Pressable style={styles.albumItem} onPress={() => setSelectedAlbum(item)}>
            <Text style={styles.albumTitle}>{item.name}</Text>
        </Pressable>
    );
    
    const renderSongItem = ({ item }: { item: string }) => (
        <Pressable 
            style={styles.songItem} 
            onPress={() => handlePlaySound(selectedAlbum!.name, item, selectedAlbum!.songs)}
        >
            <Text style={styles.songTitle}>{item}</Text>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Music Library 🎶</Text>
            {selectedAlbum ? (
                <>
                    <Text style={styles.albumTitle}>{selectedAlbum.name}</Text>
                    <Pressable style={styles.backButton} onPress={() => setSelectedAlbum(null)}>
                        <FontAwesomeIcon icon={faArrowLeft} color={'gray'} size={16} />
                        <Text style={styles.backButtonText}>Back to Albums</Text>
                    </Pressable>
                    <FlatList
                        data={selectedAlbum.songs}
                        renderItem={renderSongItem}
                        keyExtractor={(item) => item}
                    />
                </>
            ) : (
                <>
                    <FlatList
                        data={albums}
                        renderItem={renderAlbumItem}
                        keyExtractor={(item) => item.name}
                    />
                </>
            )}
            <View style={{ height: 30 }} />
            <MusicPlayerControls />
        </View>
    );
};

const getStyles = (themeColors: any) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        marginTop: 40,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: themeColors.textColor,
        alignSelf: 'center',
    },
    albumItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.borderColor,
    },
    albumTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: themeColors.textColorBold,
        marginVertical: 10
    },
    songItem: {
        marginTop: 10,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.borderColor,
    },
    songTitle: {
        fontSize: 16,
        color: themeColors.textColor,
    },
    backButton: {
        backgroundColor: themeColors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginVertical: 30,
        width: '60%',
        alignSelf: 'center',
        padding: 10,
        borderRadius: 10,
    },
    backButtonText: {
        marginLeft: 10,
        fontWeight: 'bold',
        color: 'gray',
        fontSize: 16,
    },
});

export default MusicPlayer;