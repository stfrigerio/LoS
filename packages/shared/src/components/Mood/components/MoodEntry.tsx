import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import Color from 'color';

import MoodModal from '../../modals/MoodModal';

import { useThemeStyles } from '../../../styles/useThemeStyles';
import { MoodNoteData } from '../../../types/Mood';

let useColors: any;
if (Platform.OS === 'web') {
    useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
    useColors = require('@los/mobile/src/components/useColors').useColors;
}

interface MoodEntryProps {
    item: MoodNoteData;
    isExpanded: boolean;
    toggleExpand: (id: number) => void;
    deleteMood: (id: number) => void;
    refreshMoods: () => void;
}

const MoodEntry: React.FC<MoodEntryProps> = ({ item, isExpanded, toggleExpand, deleteMood, refreshMoods }) => {
    const { themeColors, designs } = useThemeStyles();
    const { colors: tagColors, loading, error } = useColors();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
        }).start();
    }, [isExpanded, rotateAnim]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const handleEditPress = () => {
        setIsEditModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsEditModalVisible(false);
    };

    const getContrastColor = (bgColor: string) => {
        const color = Color(bgColor);
        return color.isLight() ? '#000000' : '#FFFFFF';
    };

    const renderTags = () => {
        if (!item.tag) return null;
        const tags = item.tag.split(',');

        return (
            <View style={styles.tagContainer}>
                {tags.map((tag, index) => {
                    const tagColor = tagColors[tag] || themeColors.backgroundColor;
                    return (
                        <View 
                            key={`${tag}-${index}`} 
                            style={[styles.tag, { backgroundColor: `${tagColor}99` }]}
                        >
                            <Text 
                                style={[styles.tagText, { color: getContrastColor(tagColor) }]}
                            >
                                {tag}
                            </Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.entryContainer}>
            <View style={styles.ratingContainer}>
                <Text style={styles.rating}>{item.rating}</Text>
                <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</Text>
                <Text style={styles.dateText}>{new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <View style={styles.entryContent}>
                <Pressable onPress={() => toggleExpand(item.id!)}>
                    <View style={styles.entryHeader}>
                        {renderTags()}
                        <Animated.View style={[ styles.actionIcon, { transform: [{ rotate }] }]}>
                            <FontAwesomeIcon icon={faChevronDown} size={16} color="gray" />
                        </Animated.View>
                    </View>
                </Pressable>
                <Pressable onPress={() => toggleExpand(item.id!)}>
                    <Animated.View style={{ maxHeight: isExpanded ? 1000 : 0, overflow: 'hidden' }}>
                        <Text style={styles.comment}>{item.comment}</Text>
                        <View style={styles.actionIcons}>
                            <Pressable style={styles.actionIcon} onPress={handleEditPress}>
                                <FontAwesomeIcon icon={faPencil} size={18} color="gray" />
                            </Pressable>
                            <Pressable style={styles.actionIcon} onPress={() => deleteMood(item.id!)}>
                                <FontAwesomeIcon icon={faTrash} size={18} color="gray" />
                            </Pressable>
                        </View>
                    </Animated.View>
                </Pressable>
            </View>
            {isEditModalVisible && (
                <MoodModal
                    isOpen={isEditModalVisible}
                    closeMoodModal={handleCloseModal}
                    initialMoodNote={item}
                    tagColors={tagColors}
                    refreshMoods={refreshMoods}
                    isEdit={true}
                />
            )}
        </View>
    );
};


const getStyles = (themeColors: any, designs: any) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        entryContainer: {
            // borderWidth: 1,
            // borderColor: 'blue',
            flexDirection: 'row',
            marginBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: 'gray',
            paddingBottom: 10,
        },
        ratingContainer: {
            // borderWidth: 1,
            // borderColor: 'red',
            flexDirection: 'column',
            alignItems: 'center',
            marginRight: 15,
        },
        rating: {
            fontSize: 24,
            fontWeight: 'bold',
            color: themeColors.textColor,
        },
        dateText: {
            fontSize: 12,
            color: 'gray',
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        entryContent: {
            flex: 1,
            justifyContent: 'center',
        },
        labels: {
            fontSize: 16,
            fontWeight: 'bold',
            color: themeColors.textColor,
            flexShrink: 1, // Allow text to shrink if needed
            marginRight: 10, // Add some space between text and icons
        },
        comment: {
            fontSize: 14,
            color: 'gray',
        },
        actionIcons: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 25,
            marginLeft: 20,
            justifyContent: 'flex-end',
            marginTop: 20,
        },
        actionIcon: {
            // borderWidth: 1,
            // borderColor: 'gray',
            padding: 5
        },
        tagContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            flex: 1,
        },
        tag: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 20,
            paddingHorizontal: 8,
            paddingVertical: 4,
            margin: 2,
        },
        tagText: {
            fontSize: 12,
            fontWeight: '600',
        },
    });
};

export default React.memo(MoodEntry);