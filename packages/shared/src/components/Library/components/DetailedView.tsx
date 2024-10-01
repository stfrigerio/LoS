import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ScrollView, BackHandler, Switch } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar, faTrash } from '@fortawesome/free-solid-svg-icons';

import { LibraryData } from '../../../types/Library';
import { useThemeStyles } from '../../../styles/useThemeStyles';
import { databaseManagers } from '@los/mobile/src/database/tables';

interface DetailedViewProps {
    item: LibraryData;
    onClose: () => void;
    onDelete: (item: LibraryData) => void;
    onToggleDownload?: (item: LibraryData) => void;
    updateItem: (item: LibraryData) => Promise<void>;
}

const DetailedView: React.FC<DetailedViewProps> = ({ item, onClose, onDelete, onToggleDownload, updateItem }) => {
    const { themeColors, designs } = useThemeStyles();
    const [currentRating, setCurrentRating] = useState(item.rating);
    const styles = getStyles(themeColors);

    const handleDelete = async () => {
        onDelete(item);
        onClose();
    };

    const handleToggleDownload = () => {
        if (onToggleDownload) {
            onToggleDownload(item);
        }
    };

    const handleBackPress = useCallback(() => {
        onClose();
        return true; // Prevent default back behavior
    }, [onClose]);

    useEffect(() => {
        // Add back button handler
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        // Cleanup function
        return () => backHandler.remove();
    }, [handleBackPress]);

    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const ensureHttpsUrl = (url: string) => {
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
            return `https:${url}`;
        }
        return url;
    };

    const cleanText = (text: string) => {
        return text ? text.replace(/<b>/g, '').replace(/<\/b>/g, '').replace(/<br>/g, '\n').replace(/<p>/g, '').replace(/<\/p>/g, '') : '';
    };

    const getActionText = (mediaType: string): string => {
        switch (mediaType) {
            case 'book': return 'Read';
            case 'movie':
            case 'series': return 'Seen';
            case 'videogame': return 'Played';
            case 'music': return 'Listened';
            default: return 'Consumed';
        }
    };

    const handleRatingChange = async (newRating: number) => {
        setCurrentRating(newRating);
        const updatedItem = { ...item, rating: newRating };
        await databaseManagers.library.upsert(updatedItem);
        updateItem(updatedItem);
    };

    const renderRating = (rating: number) => (
        <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                    key={star}
                    onPress={() => handleRatingChange(star)}
                    style={{ padding: 5 }}
                >
                    <FontAwesomeIcon 
                        icon={faStar} 
                        size={20} 
                        color={star <= rating ? themeColors.textColor : 'gray'} 
                    />
                </Pressable>
            ))}
        </View>
    );

    const renderDetail = (label: string, value: string | number | undefined) => (
        <View style={styles.detailContainer}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );

    const renderDownloadToggle = () => {
        if (item.type !== 'music' || !onToggleDownload) return null;
        return (
            <View style={styles.downloadToggleContainer}>
                <Text style={styles.detailLabel}>Mark for Download</Text>
                <Switch
                    trackColor={{ false: themeColors.borderColor, true: themeColors.hoverColor }}
                    thumbColor={item.isMarkedForDownload === 1 ? themeColors.textColorBold : themeColors.textColor}
                    onValueChange={handleToggleDownload}
                    value={item.isMarkedForDownload === 1}
                />
            </View>
        );
    };

    const renderCommonDetails = () => (
        <>
            {renderDetail(`Date ${getActionText(item.type)}`, formatDate(item.seen))}
            {renderDetail(item.type === 'book' ? 'Author' : 'Creator', item.creator)}
            {renderDetail('Genre', item.genre)}
            {renderDetail(item.type === 'book' ? 'Publish Year' : 'Release Year', 
                typeof item.releaseYear === 'string' ? new Date(item.releaseYear).getFullYear() : item.releaseYear)}
            {renderDetail(item.type === 'book' ? 'Description' : 'Plot', cleanText(item.plot!))}
        </>
    );

    const renderTrackList = (trackNames: string) => {
        const tracks = trackNames.split(' | ');
        return (
            <View>
                {tracks.map((track, index) => (
                    <View key={index} style={styles.trackItemContainer}>
                        <Text style={styles.trackNumber}>{index + 1}.</Text>
                        <Text style={styles.trackName}>{track}</Text>
                    </View>
                ))}
            </View>
        );
    };

    const renderSpecificDetails = () => {
        switch (item.type) {
            case 'book':
                return renderDetail('Pages', item.pages);
            case 'movie':
                return (
                    <>
                        {renderDetail('Box Office', item.boxOffice)}
                        {renderDetail('Runtime', item.runtime)}
                        {renderDetail('Cast', item.cast)}
                        <View style={styles.ratings}>
                            <Text style={styles.details}>Rotten Tomato: {item.tomato}%</Text>
                            <Text style={styles.details}>Imdb: {item.ratingImdb}</Text>
                            <Text style={styles.details}>Metascore: {item.metascore}</Text>
                        </View>
                    </>
                );
            case 'series':
                return (
                    <>
                        {renderDetail('Total Seasons', item.seasons)}
                        {renderDetail('Runtime', item.runtime)}
                        {renderDetail('Cast', item.cast)}
                        <View style={styles.ratings}>
                            <Text style={styles.details}>Imdb: {item.ratingImdb}</Text>
                        </View>
                    </>
                );
            case 'music':
                return (
                    <>
                        <Text style={styles.sectionTitle}>Tracks:</Text>
                        {item.cast && renderTrackList(item.cast)}
                        {renderDownloadToggle()}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: ensureHttpsUrl(item.mediaImage) }} style={styles.poster} />
            <View style={styles.details}>
                <Text style={styles.title}>{item.title}</Text>
                {renderRating(currentRating)}
                <View style={styles.divider} />
                {renderCommonDetails()}
                <View style={styles.divider} />
                {renderSpecificDetails()}
                <Pressable onPress={handleDelete} style={styles.deleteButton}>
                    <FontAwesomeIcon icon={faTrash} size={20} color={themeColors.redOpacity} />
                    <Text style={styles.deleteButtonText}>{`Delete ${item.type}`}</Text>
                </Pressable>
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.backgroundColor,
    },
    poster: {
        width: '100%',
        height: 400,
        resizeMode: 'cover',
    },
    details: {
        flex: 1,
        padding: 20,
        color: theme.textColor,
        fontSize: 14,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.textColorBold,
        marginBottom: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    divider: {
        height: 1,
        backgroundColor: theme.borderColor,
        marginVertical: 15,
    },
    detailContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    detailLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.textColorBold,
    },
    detailValue: {
        flex: 2,
        fontSize: 16,
        color: theme.textColor,
        textAlign: 'right',
    },
    ratings: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
    },
    deleteButtonText: {
        color: theme.redOpacity,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    downloadToggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.textColorBold,
        marginBottom: 10,
    },
    trackItemContainer: {
        flexDirection: 'row',
        marginBottom: 5,
        marginLeft: 40,
    },
    trackNumber: {
        fontSize: 16,
        color: 'gray',
        marginRight: 5,
        minWidth: 30,
    },
    trackName: {
        fontSize: 16,
        color: theme.textColor,
        flex: 1,
    },
});

export default DetailedView;