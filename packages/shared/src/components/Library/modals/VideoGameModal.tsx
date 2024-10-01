import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Pressable, FlatList, StyleSheet, Image } from 'react-native';

import { searchGames, GameSearchResult } from '../api/videogameFetcher';
import { useThemeStyles } from '../../../styles/useThemeStyles';

import { LibraryData } from '../../../types/Library';

interface GameSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveToLibrary: (game: LibraryData) => void;
}

const VideoGameSearchModal: React.FC<GameSearchModalProps> = ({ isOpen, onClose, onSaveToLibrary }) => {
    const [query, setQuery] = useState('');
    const [games, setGames] = useState<GameSearchResult[]>([]);
    const [personalRating, setPersonalRating] = useState('');
    const [showSearch, setShowSearch] = useState(true);
    const [showGamesList, setShowGamesList] = useState(false);
    const [showRatingInput, setShowRatingInput] = useState(false);
    const [detailedGame, setDetailedGame] = useState<GameSearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const handleSearch = async () => {
        setIsLoading(true); // Start loading
        const fetchedGames = await searchGames(query); // Use searchGames here
        setGames(fetchedGames);
        setIsLoading(false); // End loading
        setShowSearch(false);
        setShowGamesList(true);
    };

    const handleSelectGame = (game: GameSearchResult) => {
        // Since all details are already fetched, set the detailedGame directly
        setDetailedGame(game);
        setShowGamesList(false);
        setShowRatingInput(true);
    };

    const handleSave = () => {
        if (detailedGame) {
            const today = new Date();
            const todayString = today.toISOString().slice(0, 10);
            const genreNames = detailedGame.genres ? detailedGame.genres.map(genre => genre.name).join(', ') : '';
            const companyNames = detailedGame.involved_companies ? detailedGame.involved_companies.map(ic => ic.company.name).join(', ') : '';

            onSaveToLibrary({
                id: detailedGame.id,
                title: detailedGame.name,
                seen: todayString,
                type: 'videogame',
                genre: genreNames,
                creator: companyNames,
                releaseYear: detailedGame.first_release_date ? detailedGame.first_release_date.toString() : 'Unknown',
                mediaImage: detailedGame.cover.url.replace('thumb', 'cover_big'),
                plot: detailedGame.summary,
                metascore: detailedGame.igdbRating,
                comments: '',
                rating: parseFloat(personalRating),
                finished: 1,
            });

            // reset everything
            setQuery('');
            setGames([]);
            setPersonalRating('');
            setShowSearch(true);
            setShowGamesList(false);
            setShowRatingInput(false);
            setDetailedGame(null);

            onClose();
        }
    };

    return (
        <Modal visible={isOpen} onRequestClose={onClose} transparent={true}>
            <View style={designs.modal.modalContainer}>
                <View style={designs.modal.modalView}>
                    {showSearch && !isLoading && (
                        <>
                            <Text style={designs.text.title}>Search for a Game</Text>
                            <TextInput
                                style={designs.text.input}
                                value={query}
                                onChangeText={setQuery}
                                onEndEditing={(e) => setQuery(e.nativeEvent.text.trim())}
                                placeholder="Enter game title"
                                placeholderTextColor={'gray'}
                                onSubmitEditing={handleSearch}
                            />
                            <Pressable style={designs.button.marzoPrimary} onPress={handleSearch}>
                                <Text style={designs.button.buttonText}>Search</Text>
                            </Pressable>
                        </>
                    )}
                    {isLoading && (
                        <Text style={styles.loadingText}>Loading...</Text>
                    )}
                    {showGamesList && (
                        <FlatList
                            data={games}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <Pressable style={styles.gameItem} onPress={() => handleSelectGame(item)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {item.cover && item.cover.url && (
                                        <Image source={{ uri: `https:${item.cover.url}` }} style={styles.gameImage} />
                                        )}
                                        <View style={{ flexDirection: 'column'}}>
                                            <Text style={[designs.text.text, {fontWeight: 'bold'}]}>{item.name}</Text>
                                            <Text style={designs.text.text}>{item.first_release_date}</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            )}
                        />
                    )}
                    {showRatingInput && detailedGame && (
                        <View>
                            <Text style={designs.text.title}>Rate this Game</Text>
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
}

export default VideoGameSearchModal

const getStyles = (theme: any) => StyleSheet.create({
    gameItem: {
        paddingHorizontal: 10,
        padding: 15,
        marginVertical: 0,
        backgroundColor: theme.backgroundColor,
        borderBottomWidth: 1,
        borderColor: theme.borderColor,
        borderRadius: 5,
    },
    gameImage: {
        width: 50,
        height: 70,
        marginRight: 10,
    },
    loadingText: {
        color: theme.textColor,
        marginTop: 10
    }
});