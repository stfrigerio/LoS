import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TextInput, Platform, TextInputProps, StyleProp, ViewStyle, Pressable, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBold, faItalic, faUnderline, faStrikethrough, faListUl, faListOl, faQuoteRight } from '@fortawesome/free-solid-svg-icons';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

import MentionSuggestion from './MentionSuggestion';

import { PersonData } from '@los/shared/src/types/People';

let useEnhancedTextInput: any;
if (Platform.OS === 'web') {
    useEnhancedTextInput = require('@los/desktop/src/components/@/hooks/useEnhancedTextInput').useEnhancedTextInput;
} else {
    useEnhancedTextInput = require('@los/mobile/src/components/@/hooks/useEnhancedTextInput').useEnhancedTextInput;
}

interface EnhancedTextInputProps extends TextInputProps {
    onChangeText?: (text: string) => void;
    containerStyle?: StyleProp<ViewStyle>;
    onMentionAdded?: (person: PersonData) => void;
    showToolbar?: boolean;
}

const EnhancedTextInput: React.FC<EnhancedTextInputProps> = ({ 
    onChangeText, 
    style, 
    value, 
    containerStyle,
    onMentionAdded,
    showToolbar = false,
    ...props 
}) => {
    const [text, setText] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<PersonData[]>([]);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [mentionQuery, setMentionQuery] = useState('');
    const justSelectedRef = useRef(false);

    const inputRef = useRef<TextInput>(null);

    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    useEffect(() => {
        setText(value || '');
    }, [value]);

    const { fetchPeopleWithRecentContacts } = useEnhancedTextInput();
    
    useEffect(() => {
        const fetchAndFilterSuggestions = async () => {
            const allPeople = await fetchPeopleWithRecentContacts();
            const filteredSuggestions = allPeople.filter((person: PersonData) => 
                person.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
                (person.aliases && person.aliases.toLowerCase().includes(mentionQuery.toLowerCase()))
            ).slice(0, 3); // Limit to 3 suggestions
            setSuggestions(filteredSuggestions);
        };
    
        if (showSuggestions) {
            fetchAndFilterSuggestions();
        }
    }, [mentionQuery, showSuggestions, fetchPeopleWithRecentContacts]);

    const handleTextChange = useCallback((newText: string) => {
        setText(newText);
        if (onChangeText) {
            onChangeText(newText);
        }

        const lastAtSymbolIndex = newText.lastIndexOf('@');
        if (lastAtSymbolIndex !== -1 && lastAtSymbolIndex < cursorPosition) {
            const query = newText.slice(lastAtSymbolIndex + 1, cursorPosition);
            setMentionQuery(query);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [cursorPosition, onChangeText]);

    const handleSuggestionPress = (person: PersonData) => {
        const textBeforeMention = text.slice(0, text.lastIndexOf('@'));
        const newText = textBeforeMention + '@' + person.name + ' ';
        justSelectedRef.current = true;
        handleTextChange(newText);
        setShowSuggestions(false);
        if (onMentionAdded) {
            onMentionAdded(person); // Notify parent component about the mention
        }
    };

    // todo currently crashes and not very useful
    const insertMarkdown = useCallback((syntax: string, wrapMode: boolean = true) => {
        const selection = inputRef.current?.props.selection || { start: cursorPosition, end: cursorPosition };
        const { start, end } = selection;

        if (typeof start !== 'number' || typeof end !== 'number') {
            return;
        }

        const beforeText = text.substring(0, start);
        const selectedText = text.substring(start, end);
        const afterText = text.substring(end);

        let newText = '';
        let newCursorPosition = start;

        if (start === end) {
            // No text selected, just insert syntax
            newText = beforeText + syntax + afterText;
            newCursorPosition = start + syntax.length;
        } else if (wrapMode) {
            // Wrap selected text with syntax
            newText = beforeText + syntax + selectedText + syntax + afterText;
            newCursorPosition = end + syntax.length * 2;
        } else {
            // Insert syntax at the beginning of each line in selection
            const lines = selectedText.split('\n');
            const newLines = lines.map(line => syntax + line);
            newText = beforeText + newLines.join('\n') + afterText;
            newCursorPosition = end + syntax.length * lines.length;
        }

        setText(newText);
        if (onChangeText) {
            onChangeText(newText);
        }
        
        // Update cursor position
        setTimeout(() => {
            inputRef.current?.setNativeProps({ selection: { start: newCursorPosition, end: newCursorPosition } });
        }, 0);
    }, [text, cursorPosition, onChangeText]);

    return (
        <View style={[{ flex: 1 }, containerStyle]}>
            {/* {showToolbar && ( 
                <View style={styles.toolbar}>
                    <Pressable onPress={() => insertMarkdown('**')}><FontAwesomeIcon style={styles.icon} icon={faBold} /></Pressable>
                    <Pressable onPress={() => insertMarkdown('*')}><FontAwesomeIcon style={styles.icon} icon={faItalic} /></Pressable>
                    <Pressable onPress={() => insertMarkdown('~~')}><FontAwesomeIcon style={styles.icon} icon={faStrikethrough} /></Pressable>
                    <Pressable onPress={() => insertMarkdown('- ', false)}><FontAwesomeIcon style={styles.icon} icon={faListUl} /></Pressable>
                    <Pressable onPress={() => insertMarkdown('1. ', false)}><FontAwesomeIcon style={styles.icon} icon={faListOl} /></Pressable>
                    <Pressable onPress={() => insertMarkdown('> ', false)}><FontAwesomeIcon style={styles.icon} icon={faQuoteRight} /></Pressable>
                </View>
            )} */}
            <View style={{ flex: 1 }}>
                <TextInput
                    {...props}
                    style={[
                        { flex: 1, textAlignVertical: 'top' },
                        style
                    ]}
                    value={text}
                    onChangeText={handleTextChange}
                    onSelectionChange={(event) => setCursorPosition(event.nativeEvent.selection.start)}
                    multiline={true}
                    ref={inputRef}
                />
                {showSuggestions && (
                    <View style={styles.suggestionsContainer}>
                        <MentionSuggestion
                            suggestions={suggestions}
                            onSuggestionPress={handleSuggestionPress}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: theme.backgroundSecondary,
        zIndex: 100,
    },
    icon: {
        color: theme.opaqueTextColor,
    },
    suggestionsContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        maxHeight: 150, // Adjust this value as needed
        backgroundColor: theme.backgroundSecondary,
        zIndex: 100,
    },
});




export default EnhancedTextInput;