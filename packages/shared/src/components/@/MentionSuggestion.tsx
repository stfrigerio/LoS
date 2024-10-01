import React from 'react';
import { FlatList, Text, Pressable, StyleSheet, View, Dimensions, Platform } from 'react-native';
import { PersonData } from '@los/shared/src/types/People';

import { useThemeStyles } from '../../styles/useThemeStyles';

interface MentionSuggestionProps {
    suggestions: PersonData[];
    onSuggestionPress: (person: PersonData) => void;
}

const MentionSuggestion: React.FC<MentionSuggestionProps> = ({ suggestions, onSuggestionPress }) => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const limitedSuggestions = suggestions.slice(0, 3);

    return (
        <View style={styles.container}>
            <FlatList
                data={limitedSuggestions}
                renderItem={({ item }) => (
                    <Pressable 
                        style={({ pressed }) => [
                            styles.suggestionItem,
                            pressed && styles.suggestionItemPressed
                        ]}
                        onPress={() => onSuggestionPress(item)}
                    >
                        <Text style={styles.nameText}>{item.name}</Text>
                        {item.lastName && <Text style={styles.lastNameText}>{item.lastName}</Text>}
                    </Pressable>
                )}
                keyExtractor={(item) => item.id.toString()}
                style={styles.list}
            />
        </View>
    );
};

const getStyles = (theme: any) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        container: {
            maxHeight: 200,
            borderWidth: 1,
            borderColor: theme.borderColor,
            borderRadius: 5,
            backgroundColor: theme.backgroundColor,
            marginTop: 0,
            zIndex: 10
        },
        list: {
            flexGrow: 0,
        },
        suggestionItem: {
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor,
            flexDirection: 'row',
            alignItems: 'center',
        },
        suggestionItemPressed: {
            backgroundColor: theme.hoverColor,
        },
        nameText: {
            fontSize: 12,
            fontWeight: 'bold',
            marginRight: 5,
            color: theme.textColor,
        },
        lastNameText: {
            fontSize: 10,
            color: 'gray',
        },
    });
};

export default MentionSuggestion;