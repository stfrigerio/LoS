import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Pressable, FlatList, StyleSheet, Image } from 'react-native';

import { fetchSeries, isImdbId, getByImdbId, Series } from '../api/seriesFetcher';
import { useThemeStyles } from '../../../styles/useThemeStyles';

import { LibraryData } from '../../../types/Library';

interface SeriesSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveToLibrary: (series: LibraryData) => void; // Callback to save the series to the library
}

const SeriesSearchModal: React.FC<SeriesSearchModalProps> = ({ isOpen, onClose, onSaveToLibrary }) => {
    const [query, setQuery] = useState('');
    const [seriesList, setSeriesList] = useState<Series[]>([]);
    const [personalRating, setPersonalRating] = useState('');
    const [showSearch, setShowSearch] = useState(true); 
    const [showSeriesList, setShowSeriesList] = useState(false);
    const [showRatingInput, setShowRatingInput] = useState(false);
    const [detailedSeries, setDetailedSeries] = useState<LibraryData | null>(null);

    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const handleSearch = async () => {
        const fetchedSeries = await fetchSeries(query);
        setSeriesList(fetchedSeries);
        setShowSearch(false); 
        setShowSeriesList(true); 
    };

    const handleSelectSeries = async (series: Series) => {
        if (series.imdbID && isImdbId(series.imdbID)) {
            const detailedData = await getByImdbId(series.imdbID);
            setDetailedSeries(detailedData);
            setShowSeriesList(false); 
            setShowRatingInput(true); 
        }
    };

    const handleSave = () => {
        if (detailedSeries) {
            const today = new Date()
            const todayString = today.toISOString().slice(0, 10);
            onSaveToLibrary({
                ...detailedSeries,
                seen: todayString,
                rating: parseFloat(personalRating),
                finished: 1,
            });

            // reset everything
            setQuery('');
            setSeriesList([]);
            setPersonalRating('');
            setShowSearch(true);
            setShowSeriesList(false);
            setShowRatingInput(false);
            setDetailedSeries(null);

            onClose();
        }
    };

    return (
        <Modal visible={isOpen} onRequestClose={onClose} transparent={true}>
            <View style={designs.modal.modalContainer}>
                <View style={designs.modal.modalView}>
                    {showSearch && (
                        <>
                            <Text style={designs.text.title}>Search for a Series</Text>
                            <TextInput
                                style={designs.text.input}
                                value={query}
                                onChangeText={setQuery}
                                onEndEditing={(e) => setQuery(e.nativeEvent.text.trim())}
                                placeholder="Enter series title"
                                placeholderTextColor={'gray'}
                                onSubmitEditing={handleSearch}
                            />
                            <Pressable style={designs.button.marzoPrimary} onPress={handleSearch}>
                                <Text style={designs.button.buttonText}>Search</Text>
                            </Pressable>
                        </>
                    )}
                    {showSeriesList && (
                        <FlatList
                            data={seriesList}
                            keyExtractor={(item) => item.imdbID.toString()}
                            renderItem={({ item }) => (
                                <Pressable style={styles.seriesItem} onPress={() => handleSelectSeries(item)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={{ uri: item.Poster }} style={styles.serieImage} />
                                        <View style={{ flexDirection: 'column'}}>
                                            <Text style={[designs.text.text, {fontWeight: 'bold'}]}>{item.Title}</Text>
                                            <Text style={designs.text.text}>({item.Year})</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            )}
                        />
                    )}
                    {showRatingInput && detailedSeries && (
                        <View>
                            <Text style={designs.text.title}>Rate this series</Text>
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

export default SeriesSearchModal;

const getStyles = (theme: any) => StyleSheet.create({
    seriesItem: {
        paddingHorizontal: 10,
        padding: 15,
        marginVertical: 0,
        backgroundColor: theme.backgroundColor,
        borderBottomWidth: 1,
        borderColor: theme.borderColor,
        borderRadius: 5,
    },
    serieImage: {
        width: 50,
        height: 70,
        marginRight: 10,
    }
});
