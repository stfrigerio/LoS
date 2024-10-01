import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Pressable, FlatList, StyleSheet, Image } from 'react-native';

import { searchBooks, getBookDetails, SearchResult, DetailedBook } from '../api/bookFetcher';
import { useThemeStyles } from '../../../styles/useThemeStyles';

import { LibraryData } from '../../../types/Library';

interface BookSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveToLibrary: (book: LibraryData) => void;
}

const BookSearchModal: React.FC<BookSearchModalProps> = ({ isOpen, onClose, onSaveToLibrary }) => {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState<SearchResult[]>([]);
    const [personalRating, setPersonalRating] = useState('');
    const [showSearch, setShowSearch] = useState(true);
    const [showBooksList, setShowBooksList] = useState(false);
    const [showRatingInput, setShowRatingInput] = useState(false);
    const [detailedBook, setDetailedBook] = useState<DetailedBook | null>(null);

    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const handleSearch = async () => {
        const fetchedBooks = await searchBooks(query);
        setBooks(fetchedBooks);
        setShowSearch(false);
        setShowBooksList(true);
    };

    const handleSelectBook = async (book: SearchResult) => {
        const bookDetails = await getBookDetails(book.id);
        if (bookDetails) {
            setDetailedBook(bookDetails);
            setShowBooksList(false);
            setShowRatingInput(true);
        }
    };

    const handleSave = () => {
        if (detailedBook) {
            const today = new Date();
            const todayString = today.toISOString().slice(0, 10);
            onSaveToLibrary({
                id: detailedBook.ISBN_13,
                title: detailedBook.title,
                seen: todayString,
                type: 'book',
                genre: detailedBook.categories.join(', '),
                creator: detailedBook.authors.join(', '),
                releaseYear: detailedBook.publishedDate,
                mediaImage: detailedBook.mediaImage,
                plot: detailedBook.description,
                pages: detailedBook.pageCount,
                comments: '',
                rating: parseFloat(personalRating),
                finished: 1,
            });

            // reset everything
            setQuery('');
            setBooks([]);
            setPersonalRating('');
            setShowSearch(true);
            setShowBooksList(false);
            setShowRatingInput(false);
            setDetailedBook(null);

            onClose();
        }
    };

    return (
        <Modal visible={isOpen} onRequestClose={onClose} transparent={true}>
            <View style={designs.modal.modalContainer}>
                <View style={designs.modal.modalView}>
                    {showSearch && (
                        <>
                            <Text style={designs.text.title}>Search for a Book</Text>
                            <TextInput
                                style={designs.text.input}
                                value={query}
                                onChangeText={setQuery}
                                onEndEditing={(e) => setQuery(e.nativeEvent.text.trim())}
                                placeholder="Enter book title"
                                placeholderTextColor={'gray'}
                                onSubmitEditing={handleSearch}
                            />
                            <Pressable style={designs.button.marzoPrimary} onPress={handleSearch}>
                                <Text style={designs.button.buttonText}>Search</Text>
                            </Pressable>
                        </>
                    )}
                    {showBooksList && (
                        <FlatList
                            data={books}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Pressable style={styles.bookItem} onPress={() => handleSelectBook(item)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={{ uri: item.mediaImage }} style={styles.bookImage} />
                                        <View style={{ flexDirection: 'column'}}>
                                            <Text style={[designs.text.text, {fontWeight: 'bold'}]}>{item.title}</Text>
                                            <Text style={designs.text.text}>{item.authors} ({new Date(item.publishedDate).getFullYear()})</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            )}
                        />
                    )}
                    {showRatingInput && detailedBook && (
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <Text style={designs.text.title}>Rate this Book</Text>
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

export default BookSearchModal;

const getStyles = (theme: any) => StyleSheet.create({
    bookItem: {
        paddingHorizontal: 10,
        padding: 15,
        marginVertical: 0,
        backgroundColor: theme.backgroundColor,
        borderBottomWidth: 1,
        borderColor: theme.borderColor,
        borderRadius: 5,
    },
    bookImage: {
        width: 50,
        height: 70,
        marginRight: 10,
    },
});