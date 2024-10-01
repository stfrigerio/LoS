import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Pressable, FlatList, StyleSheet, Image } from 'react-native';

import { fetchMovies, isImdbId, getByImdbId, Movie } from '../api/movieFetcher';
import { useThemeStyles } from '../../../styles/useThemeStyles';

import { LibraryData } from '../../../types/Library';

interface MovieSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveToLibrary: (movie: LibraryData) => void;
}

const MovieSearchModal: React.FC<MovieSearchModalProps> = ({ isOpen, onClose, onSaveToLibrary }) => {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState<Movie[]>([]);
    const [personalRating, setPersonalRating] = useState('');
    const [showSearch, setShowSearch] = useState(true); // Show search initially
    const [showMoviesList, setShowMoviesList] = useState(false);
    const [showRatingInput, setShowRatingInput] = useState(false);
    const [detailedMovie, setDetailedMovie] = useState<Movie | null>(null);

    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);


    const handleSearch = async () => {
        const fetchedMovies = await fetchMovies(query);
        setMovies(fetchedMovies);
        setShowSearch(false); 
        setShowMoviesList(true);
    };

    const handleSelectMovie = async (movie: Movie) => {
        if (movie.imdbID && isImdbId(movie.imdbID)) {
            const detailedData = await getByImdbId(movie.imdbID);
            setDetailedMovie(detailedData);
            setShowMoviesList(false); 
            setShowRatingInput(true); 
        }
    };

    const handleSave = () => {
        if (detailedMovie) {
            const today = new Date()
            const todayString = today.toISOString().slice(0, 10);
    
            const libraryData: LibraryData = {
                id: parseInt(detailedMovie.imdbID.replace('tt', '')),
                title: detailedMovie.Title,
                seen: todayString,
                type: 'movie',
                genre: detailedMovie.Genre,
                creator: detailedMovie.Director,
                releaseYear: detailedMovie.Year,
                rating: parseFloat(personalRating),
                comments: '', // You might want to add a field for comments in your modal
                mediaImage: detailedMovie.Poster,
                boxOffice: detailedMovie.BoxOffice,
                plot: detailedMovie.Plot,
                cast: detailedMovie.Actors,
                writer: detailedMovie.Writer,
                metascore: detailedMovie.Metascore ? detailedMovie.Metascore : undefined,
                ratingImdb: detailedMovie.imdbRating ? detailedMovie.imdbRating : undefined,
                tomato: detailedMovie.tomato,
                runtime: detailedMovie.Runtime,
                awards: detailedMovie.Awards,
                finished: 1
            };

            console.log('sending data from modal', JSON.stringify(libraryData, null, 2));
    
            onSaveToLibrary(libraryData);
    
            // reset everything
            setQuery('');
            setMovies([]);
            setPersonalRating('');
            setShowSearch(true);
            setShowMoviesList(false);
            setShowRatingInput(false);
            setDetailedMovie(null);
    
            onClose();
        }
    };

    return (
        <Modal visible={isOpen} onRequestClose={onClose} transparent={true}>
            <View style={designs.modal.modalContainer}>
                <View style={designs.modal.modalView}>
                    {showSearch && (
                        <>
                            <Text style={designs.text.title}>Search for a Movie</Text>
                            <TextInput
                                style={designs.text.input}
                                value={query}
                                onChangeText={setQuery}
                                onEndEditing={(e) => setQuery(e.nativeEvent.text.trim())}
                                placeholder="Enter movie title"
                                placeholderTextColor={'gray'}
                                onSubmitEditing={handleSearch}
                            />
                            <Pressable style={designs.button.marzoPrimary} onPress={handleSearch}>
                                <Text style={designs.button.buttonText}>Search</Text>
                            </Pressable>
                        </>
                    )}
                    {showMoviesList && (
                        <FlatList
                            data={movies}
                            keyExtractor={(item) => item.imdbID.toString()}
                            renderItem={({ item }) => (
                                <Pressable style={styles.movieItem} onPress={() => handleSelectMovie(item)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={{ uri: item.Poster }} style={styles.movieImage} />
                                        <View style={{ flexDirection: 'column'}}>
                                            <Text style={[designs.text.text, {fontWeight: 'bold'}]}>{item.Title}</Text>
                                            <Text style={designs.text.text}>({new Date(item.Year).getFullYear()})</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            )}
                        />
                    )}
                    {showRatingInput && detailedMovie && (
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <Text style={designs.text.title}>Rate this movie</Text>
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

export default MovieSearchModal;

const getStyles = (theme: any) => StyleSheet.create({
    movieItem: {
        paddingHorizontal: 10,
        padding: 15,
        marginVertical: 0,
        backgroundColor: theme.backgroundColor,
        borderBottomWidth: 1,
        borderColor: theme.borderColor,
        borderRadius: 5,
    },
    movieImage: {
        width: 50,
        height: 70,
        marginRight: 10,
    }
});