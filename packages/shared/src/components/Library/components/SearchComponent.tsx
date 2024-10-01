// SearchComponent.tsx
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useThemeStyles } from '../../../styles/useThemeStyles';

interface SearchComponentProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ searchQuery, setSearchQuery}) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    return (
        <TextInput
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name"
            placeholderTextColor='gray'
        />
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    input: {
        height: 40,
        borderColor: theme.borderColor,
        borderRadius: 10,
        borderWidth: 1,
        padding: 10,
        color: theme.textColor
    },
});

export default SearchComponent;
