import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, Animated, Pressable } from 'react-native';

import quotes from '@los/desktop/python/quotes/quotes.json';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

type QuoteType = {
    content: string;
    author: string;
};

interface QuoteProps {
    isCollapse: boolean;
    isFixed: boolean;
}

const Quote: React.FC<QuoteProps> = ({ isCollapse, isFixed }) => {
    const [quote, setQuote] = useState<QuoteType>({ content: '', author: '' });
    const [expanded, setExpanded] = useState(!isCollapse);

    const fadeAnim = useRef(new Animated.Value(0)).current; // Using useRef to persist the animated value across renders

    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const getRandomQuote = () => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        return quotes[randomIndex];
    };

    const getDailyQuote = () => {
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        return quotes[dayOfYear % quotes.length];
    };

    useEffect(() => {
        const fetchQuote = () => {
            const newQuote = isFixed ? getDailyQuote() : getRandomQuote();
            setQuote(newQuote);
        };

        fetchQuote();
        // If it's not random, set up a daily refresh
        if (isFixed) {
            const now = new Date();
            const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            const timeUntilMidnight = tomorrow.getTime() - now.getTime();

            const refreshTimer = setTimeout(() => {
                fetchQuote();
            }, timeUntilMidnight);

            return () => clearTimeout(refreshTimer);
        }
    }, [isFixed]);

    // Start the animation every time the quote changes
    useEffect(() => {
        fadeAnim.setValue(0); // Reset the opacity to 0
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
        }).start();
    }, [quote, fadeAnim]);

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    return (
        <Pressable onPress={toggleExpanded}>
            <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim }]}>
                {expanded ? (
                    <>
                        <Text style={styles.quoteContent}>{quote.content}</Text>
                        <Text style={styles.quoteAuthor}>- {quote.author}</Text>
                    </>
                ) : (
                    <Text style={styles.quoteAuthor}>- {quote.author}</Text>
                )}
            </Animated.View>
        </Pressable>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    quoteContainer: {
        padding: 20,
        paddingBottom: 5,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.borderColor,
        margin: 10,
        maxWidth: 600,
        alignSelf: 'center',
    },
    quoteContent: {
        lineHeight: 28,
        textAlign: 'center',
        fontStyle: 'italic',
        color: theme.textColor,
        marginBottom: 20,
    },
    quoteAuthor: {
        textAlign: 'right',
        fontFamily: 'serif',
        fontSize: 14,
        marginTop: 5,
        color: 'rgba(212, 212, 212, 0.4)',
        marginBottom: 14
    },
});

export default Quote;