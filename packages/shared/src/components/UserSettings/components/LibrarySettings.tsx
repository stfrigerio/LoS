import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';

import Collapsible from '@los/shared/src/sharedComponents/Collapsible';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { syncMarkedAlbums, fetchAPIKeys, saveAPIKey, clearMusicFolder } from '../helpers/LibrarySettingsHelper';

const LibrarySettings = () => {
    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const [booksApiKey, setBooksApiKey] = useState('');
    const [moviesApiKey, setMoviesApiKey] = useState('');
    const [spotifyClientId, setSpotifyClientId] = useState('');
    const [spotifyClientSecret, setSpotifyClientSecret] = useState('');
    const [igdbClientId, setIgdbClientId] = useState('');
    const [igdbClientSecret, setIgdbClientSecret] = useState('');

    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const loadAPIKeys = async () => {
            const apiKeys = await fetchAPIKeys();
            setBooksApiKey(apiKeys.booksApiKey || '');
            setMoviesApiKey(apiKeys.moviesApiKey || '');
            setSpotifyClientId(apiKeys.spotifyClientId || '');
            setSpotifyClientSecret(apiKeys.spotifyClientSecret || '');
            setIgdbClientId(apiKeys.igdbClientId || '');
            setIgdbClientSecret(apiKeys.igdbClientSecret || '');
        };
        loadAPIKeys();
    }, []);

    const [collapsedSections, setCollapsedSections] = useState({
        books: true,
        movies: true,
        music: true,
        games: true,
    });

    const renderAPIKeyInput = (label: string, value: string, onChangeText: (text: string) => void, onBlur: () => void) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                style={[designs.text.input, styles.input]}
                onChangeText={onChangeText}
                onBlur={onBlur}
                value={value}
                placeholder={`Enter ${label}`}
                placeholderTextColor={'gray'}
            />
        </View>
    );

    const toggleSection = (section: keyof typeof collapsedSections) => {
        setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const renderSection = (title: string, section: keyof typeof collapsedSections, children: React.ReactNode) => (
        <View style={styles.section}>
            <Pressable onPress={() => toggleSection(section)} style={styles.sectionHeader}>
                <Text style={styles.title}>{title}</Text>
                <Text style={designs.text.text}>{collapsedSections[section] ? '▼' : '▲'}</Text>
            </Pressable>
            <Collapsible collapsed={collapsedSections[section]}>
                {children}
            </Collapsible>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            {renderSection('Books', 'books', 
                renderAPIKeyInput('Books API Key', booksApiKey, setBooksApiKey, () => saveAPIKey('booksApiKey', booksApiKey))
            )}
            {renderSection('Movies & Series', 'movies', 
                renderAPIKeyInput('Movies API Key', moviesApiKey, setMoviesApiKey, () => saveAPIKey('moviesApiKey', moviesApiKey))
            )}
            {renderSection('Music', 'music', 
                <>
                    {renderAPIKeyInput('Spotify Client ID', spotifyClientId, setSpotifyClientId, () => saveAPIKey('spotifyClientId', spotifyClientId))}
                    {renderAPIKeyInput('Spotify Client Secret', spotifyClientSecret, setSpotifyClientSecret, () => saveAPIKey('spotifyClientSecret', spotifyClientSecret))}
                    <Text style={styles.subtitle}>Sync Albums</Text>
                    <Pressable
                        style={[styles.syncButton, isSyncing && styles.syncingButton]}
                        onPress={() => syncMarkedAlbums(setIsSyncing)}
                        disabled={isSyncing}
                    >
                        <Text style={styles.syncButtonText}>
                            {isSyncing ? 'Syncing...' : 'Sync Marked Albums'}
                        </Text>
                    </Pressable>
                    <Pressable
                        style={styles.syncButton}
                        onPress={() => clearMusicFolder()}
                    >
                        <Text style={styles.syncButtonText}>
                            Clear Music Folder
                        </Text>
                    </Pressable>
                </>
            )}
            {renderSection('Video Games', 'games', 
                <>
                    {renderAPIKeyInput('IGDB Client ID', igdbClientId, setIgdbClientId, () => saveAPIKey('igdbClientId', igdbClientId))}
                    {renderAPIKeyInput('IGDB Client Secret', igdbClientSecret, setIgdbClientSecret, () => saveAPIKey('igdbClientSecret', igdbClientSecret))}
                </>
            )}
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        marginVertical: 10,
        padding: 30
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        color: 'gray',
        fontSize: 12,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.borderColor,
        borderRadius: 5,
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: theme.textColor
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    syncButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: theme.borderColor,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        width: '80%',
        alignSelf: 'center',
    },
    syncingButton: {
        backgroundColor: theme.backgroundSecondary,
    },
    syncButtonText: {
        color: theme.textColor,
        fontWeight: 'bold',
        fontSize: 16,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: theme.textColor,
    },
});

export default LibrarySettings;