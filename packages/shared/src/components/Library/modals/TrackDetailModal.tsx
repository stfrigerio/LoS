import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { useThemeStyles } from '../../../styles/useThemeStyles';
import { TrackData } from '../../../types/Library';
import { UniversalModal } from '../../../sharedComponents/UniversalModal';

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


    const modalContent = (
        <View style={styles.container}>
            <Text style={styles.title}>{track.trackName}</Text>
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Track Info</Text>
                {renderDetail('Track Number', track.trackNumber)}
                {renderDetail('Duration', `${Math.floor(track.durationMs / 1000 / 60)}:${String(Math.floor((track.durationMs / 1000) % 60)).padStart(2, '0')}`)}
                {track.popularity !== undefined && renderDetail('Popularity', `${track.popularity}`)}
            </View>

            {track.previewUrl && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preview</Text>
                    {renderPreviewSection()}
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Musical Features</Text>
                {renderDetail('Key', track.key)}
                {renderDetail('Mode', track.mode)}
                {renderDetail('Time Signature', track.timeSignature)}
                {renderDetail('Tempo', `${Math.round(track.tempo)} BPM`)}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Audio Characteristics</Text>
                {renderDetail('Danceability', `${track.danceability}%`)}
                {renderDetail('Energy', `${track.energy}%`)}
                {renderDetail('Speechiness', `${track.speechiness}%`)}
                {renderDetail('Acousticness', `${track.acousticness}%`)}
                {renderDetail('Instrumentalness', `${track.instrumentalness}%`)}
                {renderDetail('Liveness', `${track.liveness}%`)}
                {renderDetail('Valence', `${track.valence}%`)}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stats</Text>
                {renderDetail('Play Count', track.playCount)}
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
    section: {
        marginBottom: 20,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.textColor,
        marginBottom: 10,
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
    previewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: theme.cardColor,
        borderRadius: 8,
        marginVertical: 10,
    },
    previewText: {
        color: theme.textColor,
        fontSize: 16,
        marginLeft: 10,
    },
});

export default TrackDetailModal;