import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

import { useThemeStyles } from '../../../styles/useThemeStyles';
import { TrackData } from '../../../types/Library';
import { UniversalModal } from '../../../sharedComponents/UniversalModal';

import { databaseManagers } from '@los/mobile/src/database/tables';

interface TrackDetailModalProps {
    isVisible: boolean;
    onClose: () => void;
    track: TrackData;
}

const TrackDetailModal: React.FC<TrackDetailModalProps> = ({ isVisible, onClose, track }) => {
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentRating, setCurrentRating] = useState(track.rating || 0);

    const handleRatingChange = async (newRating: number) => {
        setCurrentRating(newRating);
        // Update the track rating in the database
        await databaseManagers.music.upsert({
            ...track,
            rating: newRating
        });
    };

    const renderRating = (rating: number) => (
        <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                    key={star}
                    onPress={() => handleRatingChange(star)}
                    style={styles.starButton}
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

    useEffect(() => {
        const cleanup = async () => {
            if (sound) {
                await sound.stopAsync();
                await sound.unloadAsync();
                setSound(null);
                setIsPlaying(false);
            }
        };

        cleanup();
    }, [track, isVisible]);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const handlePlayPause = async () => {
        if (!track.previewUrl) return;

        try {
            if (sound) {
                if (isPlaying) {
                    await sound.pauseAsync();
                } else {
                    await sound.playAsync();
                }
                setIsPlaying(!isPlaying);
            } else {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: track.previewUrl },
                    { shouldPlay: true }
                );
                setSound(newSound);
                setIsPlaying(true);

                // Handle playback finished
                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (!status.isLoaded) return;
                    
                    if (status.isLoaded && status.didJustFinish) {
                        setIsPlaying(false);
                    }
                });
            }
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    const renderDetail = (label: string, value: string | number) => (
        <View style={styles.detailRow}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );

    const renderPreviewSection = () => {
        if (!track.previewUrl) return null;

        return (
            <Pressable 
                style={styles.previewButton} 
                onPress={handlePlayPause}
            >
                <Ionicons 
                    name={isPlaying ? "pause-circle" : "play-circle"} 
                    size={48} 
                    color={themeColors.textColor} 
                />
                <Text style={styles.previewText}>
                    {isPlaying ? 'Pause Preview' : 'Play Preview'}
                </Text>
            </Pressable>
        );
    };

    const renderCharacteristic = (label: string, value: number) => (
        <View style={styles.characteristicItem}>
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${value}%` }]} />
            </View>
            <Text style={styles.characteristicLabel}>{label}</Text>
            <Text style={styles.characteristicValue}>{value}%</Text>
        </View>
    );

    const modalContent = (
        <View style={styles.container}>
            <Text style={styles.title}>{track.trackName}</Text>
            {renderRating(currentRating)}
            <View style={styles.section}>
                {renderDetail('Play Count', track.playCount)}
            </View>
            
            {track.previewUrl && (
                <View style={styles.previewSection}>
                    {renderPreviewSection()}
                </View>
            )}

            <View style={styles.mainContent}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Track Info</Text>
                    {renderDetail('Track Number', track.trackNumber)}
                    {renderDetail('Duration', `${Math.floor(track.durationMs / 1000 / 60)}:${String(Math.floor((track.durationMs / 1000) % 60)).padStart(2, '0')}`)}
                    {track.popularity !== undefined && renderDetail('Popularity', `${track.popularity}`)}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Musical Features</Text>
                    {renderDetail('Key', track.key)}
                    {renderDetail('Mode', track.mode)}
                    {renderDetail('Time Signature', track.timeSignature)}
                    {renderDetail('Tempo', `${Math.round(track.tempo)} BPM`)}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Audio Characteristics</Text>
                    <View style={styles.characteristicsGrid}>
                        {renderCharacteristic('Danceability', track.danceability)}
                        {renderCharacteristic('Energy', track.energy)}
                        {renderCharacteristic('Speechiness', track.speechiness)}
                        {renderCharacteristic('Acousticness', track.acousticness)}
                        {renderCharacteristic('Instrumentalness', track.instrumentalness)}
                        {renderCharacteristic('Liveness', track.liveness)}
                        {renderCharacteristic('Valence', track.valence)}
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <UniversalModal 
            isVisible={isVisible} 
            onClose={onClose}
            modalViewStyle="taller"
        >
            {modalContent}
        </UniversalModal>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.textColorBold,
        marginBottom: 20,
        textAlign: 'center',
    },
    mainContent: {
        backgroundColor: theme.backgroundSecondary,
        borderRadius: 12,
        padding: 15,
        marginTop: 15,
    },
    section: {
        marginBottom: 25,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.textColor,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.borderColor,
        paddingBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    starButton: {
        padding: 5,
    },
    previewSection: {
        backgroundColor: theme.cardColor,
        borderRadius: 12,
        padding: 5,
    },
    previewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.backgroundColor,
        borderRadius: 8,
    },
    previewText: {
        color: theme.textColor,
        fontSize: 16,
        marginLeft: 10,
        fontWeight: '500',
    },
    characteristicsGrid: {
        gap: 12,
    },
    characteristicItem: {
        marginBottom: 8,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: theme.borderColor,
        borderRadius: 3,
        marginBottom: 4,
    },
    progressBar: {
        height: '100%',
        backgroundColor: theme.textColorBold,
        borderRadius: 3,
    },
    characteristicLabel: {
        color: theme.textColor,
        fontSize: 14,
    },
    characteristicValue: {
        color: theme.textColorItalic,
        fontSize: 12,
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        width: '100%',
    },
    label: {
        fontSize: 16,
        color: theme.opaqueTextColor,
        flex: 1,
    },
    value: {
        fontSize: 16,
        color: theme.textColorItalic,
        flex: 1,
        textAlign: 'right',
    },
});

export default TrackDetailModal;