import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { TagData } from '@los/shared/src/types/TagsAndDescriptions';

interface TagDescriptionSelectorProps {
    tag?: TagData | string;
    description?: TagData | string;
    onPress: () => void;
}

const TagDescriptionSelector: React.FC<TagDescriptionSelectorProps> = ({ tag, description, onPress }) => {
    const { designs, themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);

    const renderTagOrDescription = (item: TagData | string | undefined, defaultText: string) => {
        if (!item) return defaultText;
        if (typeof item === 'string') return item;
        
        return (
            <Text style={[styles.tagText, { color: item.color }]}>
                {item.emoji} {item.text}
            </Text>
        );
    };

    return (
        <Pressable onPress={onPress}>
            <View style={styles.displayView}>
                <Text style={styles.displayText}>
                    {tag ? renderTagOrDescription(tag, "No Tag Selected") : "No Tag Selected"}
                    {" - "}
                    {description ? renderTagOrDescription(description, "No Description") : "No Description"}
                </Text>
            </View>
        </Pressable>
    );
};

const getStyles = (themeColors: any) => StyleSheet.create({
    displayView: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: themeColors.backgroundColor,
    },
    displayText: {
        color: 'gray',
        textAlign: 'center',
        fontSize: 16,
    },
    tagText: {
        padding: 4,
        borderRadius: 4,
        overflow: 'hidden',
    },
    descriptionText: {
        padding: 4,
        borderRadius: 4,
        overflow: 'hidden',
    },
});

export default TagDescriptionSelector;