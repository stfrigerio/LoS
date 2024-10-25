import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ScrollView, BackHandler, Switch, TextInput } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar, faTrash, faMusic, faPlay } from '@fortawesome/free-solid-svg-icons';

import TrackDetailModal from '../modals/TrackDetailModal';

import { LibraryData, TrackData } from '../../../types/Library';
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
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(item.title);
    const [selectedTrack, setSelectedTrack] = useState<TrackData | null>(null);
    const [isTrackModalVisible, setIsTrackModalVisible] = useState(false);

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

    const handleTitleEdit = async () => {
        if (isEditingTitle) {
            const updatedItem = { ...item, title: editedTitle };
            await databaseManagers.library.upsert(updatedItem);
            updateItem(updatedItem);
        }
        setIsEditingTitle(!isEditingTitle);
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

    const handleTrackPress = async (trackName: string) => {
        try {
            // Fetch track details from the database
            const tracks = await databaseManagers.music.getMusicTracks({ 
                libraryUuid: item.uuid,
                trackName 
            });
            
            if (tracks && tracks.length > 0) {
                setSelectedTrack(tracks[0]);
                setIsTrackModalVisible(true);
            }
        } catch (error) {
            console.error('Error fetching track details:', error);
        }
    };
    
    const renderTrackList = (trackNames: string) => {
        const tracks = trackNames.split(' | ');
        return (
            <View style={styles.tracksContainer}>
                {tracks.map((track, index) => (
                    <Pressable 
                        key={index} 
                        style={({ pressed }) => [
                            styles.trackItemContainer,
                            pressed && styles.trackItemPressed
                        ]}
                        onPress={() => handleTrackPress(track)}
                    >
                        <View style={styles.trackIconContainer}>
                            <FontAwesomeIcon 
                                icon={faMusic} 
                                size={16} 
                                color={themeColors.textColorItalic} 
                            />
                            <Text style={styles.trackNumber}>{(index + 1).toString().padStart(2, '0')}</Text>
                        </View>
                        <Text style={styles.trackName}>
                            {track}
                        </Text>
                    </Pressable>
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
        <>
            <ScrollView style={styles.container}>
                <Image source={{ uri: ensureHttpsUrl(item.mediaImage) }} style={styles.poster} />
                <View style={styles.details}>
                    <Pressable onPress={handleTitleEdit}>
                        {isEditingTitle ? (
                            <TextInput
                                style={[styles.title, styles.titleInput]}
                                value={editedTitle}
                                onChangeText={setEditedTitle}
                                onBlur={handleTitleEdit}
                                autoFocus
                            />
                        ) : (
                            <Text style={styles.title}>{item.title}</Text>
                        )}
                    </Pressable>
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
            </ScrollView>
            {selectedTrack && (
                <TrackDetailModal
                    isVisible={isTrackModalVisible}
                    onClose={() => setIsTrackModalVisible(false)}
                    track={selectedTrack}
                />
            )}
        </>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    titleInput: {
        borderBottomWidth: 1,
        borderBottomColor: theme.borderColor,
        paddingBottom: 5,
    },
    ratings: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },    tracksContainer: {
        backgroundColor: theme.cardColor,
        borderRadius: 12,
        padding: 10,
        marginTop: 10,
    },
    trackItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 4,
        backgroundColor: theme.backgroundColor,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.borderColor,
    },
    trackItemPressed: {
        backgroundColor: theme.hoverColor,
        transform: [{ scale: 0.98 }],
    },
    trackIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 60,
    },
    trackNumber: {
        fontSize: 14,
        color: theme.textColorItalic,
        marginLeft: 8,
        fontFamily: 'monospace',
    },
    trackName: {
        fontSize: 16,
        color: theme.textColor,
        flex: 1,
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.textColorBold,
        marginBottom: 5,
        marginTop: 15,
    },
    // Update existing container styles
    container: {
        flex: 1,
        backgroundColor: theme.backgroundColor,
    },
    details: {
        flex: 1,
        padding: 20,
        color: theme.textColor,
        fontSize: 14,
    },
    poster: {
        width: '100%',
        height: 400,
        resizeMode: 'cover',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.textColorBold,
        marginBottom: 15,
        letterSpacing: 0.5,
    },
    ratingContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: theme.cardColor,
        padding: 12,
        borderRadius: 12,
        justifyContent: 'center',
    },
    divider: {
        height: 2,
        backgroundColor: theme.borderColor,
        marginVertical: 20,
        opacity: 0.5,
    },
    detailContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        backgroundColor: theme.cardColor,
        padding: 15,
        borderRadius: 12,
    },
    detailLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: theme.textColorBold,
    },
    detailValue: {
        flex: 2,
        fontSize: 16,
        color: theme.textColor,
        textAlign: 'right',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        marginTop: 30,
        borderWidth: 1,
        borderColor: theme.redOpacity,
    },
    deleteButtonText: {
        color: theme.redOpacity,
        fontWeight: 'bold',
        marginLeft: 10,
        fontSize: 16,
    },
    downloadToggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: theme.cardColor,
        padding: 15,
        borderRadius: 12,
    },
});

export default DetailedView;