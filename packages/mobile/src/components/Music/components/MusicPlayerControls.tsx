import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
    faPlay, 
    faPause, 
    faStepForward, 
    faStepBackward, 
    faTimes, 
    faStar 
} from '@fortawesome/free-solid-svg-icons';
import Slider from '@react-native-community/slider';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

const MusicPlayerControls: React.FC = () => {
    const {
        currentSong,
        currentTrackData,
        isPlaying,
        duration,
        position,
        pauseSound,
        resumeSound,
        playNextSong,
        playPreviousSong,
        seekTo,
        stopSound,
        updateTrackRating,
    } = useMusicPlayer();

    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);

    const handleRatingChange = useCallback((rating: number) => {
        if (updateTrackRating) {
            Promise.resolve(updateTrackRating(rating)).catch(console.error);
        }
    }, [updateTrackRating]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const renderRating = () => {
        if (!currentTrackData) return null;
        const currentRating = currentTrackData.rating || 0;
        
        return (
            <View style={[styles.ratingContainer]}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                        key={star}
                        onPress={() => handleRatingChange(star)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <FontAwesomeIcon 
                            icon={faStar} 
                            size={18} 
                            color={star <= currentRating ? themeColors.textColor : themeColors.borderColor} 
                        />
                    </Pressable>
                ))}
            </View>
        );
    };

    if (!currentSong) return null;

    const songName = currentSong.split('.').slice(0, -1).join('.');

    return (
        <View style={styles.playerControls}>
            <Text style={styles.nowPlaying} numberOfLines={1} ellipsizeMode="tail">
                {songName}
            </Text>
            
            {renderRating()}

            <Pressable onPress={stopSound} style={styles.closeButton}>
                <FontAwesomeIcon icon={faTimes} color={themeColors.textColor} size={20} />
            </Pressable>

            <View style={styles.sliderContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration}
                    value={position}
                    onSlidingComplete={seekTo}
                    minimumTrackTintColor={themeColors.hoverColor}
                    maximumTrackTintColor={themeColors.borderColor}
                    thumbTintColor={themeColors.hoverColor}
                />
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            <View style={styles.controlButtons}>
                <Pressable onPress={playPreviousSong} style={styles.controlButton}>
                    <FontAwesomeIcon icon={faStepBackward} color={themeColors.textColor} size={24} />
                </Pressable>
                <Pressable onPress={isPlaying ? pauseSound : resumeSound} style={styles.controlButton}>
                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} color={themeColors.textColor} size={24} />
                </Pressable>
                <Pressable onPress={playNextSong} style={styles.controlButton}>
                    <FontAwesomeIcon icon={faStepForward} color={themeColors.textColor} size={24} />
                </Pressable>
            </View>
        </View>
    );
};

const getStyles = (themeColors: any) => StyleSheet.create({
    playerControls: {
        padding: 10,
        backgroundColor: 'transparent',
        borderRadius: 15,
    },
    nowPlaying: {
        fontSize: 16,
        color: themeColors.textColorItalic,
        textAlign: 'center',
        marginBottom: 4,
        fontFamily: 'serif'
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    slider: {
        flex: 1,
        marginHorizontal: 10,
    },
    timeText: {
        fontSize: 12,
        color: themeColors.textColor,
    },
    controlButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButton: {
        padding: 10,
        marginHorizontal: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
        height: 30,
        gap: 20
    },
});

export default MusicPlayerControls;