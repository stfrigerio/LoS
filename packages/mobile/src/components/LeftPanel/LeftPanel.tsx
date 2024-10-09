import React, { useMemo } from 'react';
import { View, StyleSheet, } from 'react-native';
import { BlurView } from 'expo-blur';

import TimeChart from './TimeChart'
import MusicPlayerControls from '../Music/components/MusicPlayerControls';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

const LeftPanel: React.FC<{ }> = ({ }) => {
    const { theme, themeColors, designs } = useThemeStyles();

    const styles = useMemo(() => getStyles(themeColors, theme), [themeColors, theme]);

    return (
        <View style={styles.container}>
            <BlurView 
                intensity={60} 
                tint={theme === 'dark' ? 'dark' : 'light'} 
                style={[StyleSheet.absoluteFill, { zIndex: 1 }]} 
            />
            <View style={styles.content}>
                <View style={styles.chartContainer}>
                    <TimeChart />
                </View>

                <View style={styles.musicControlsContainer}>
                    <MusicPlayerControls />
                </View>
            </View>
        </View>
    );
};

const getStyles = (themeColors: any, theme: 'dark' | 'light') => StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        padding: 20,
        paddingTop: 50,
        zIndex: 1000,
    },
    chartContainer: {
        borderColor: 'black',
        borderRadius: 5,
        backgroundColor: 'transparent',
    },
    separator: {
        height: 1,
        backgroundColor: 'black',
        marginVertical: 20, 
    },
    button: {
        padding: 10,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 10,
        marginVertical: 4,
    },
    buttonText: {
        alignSelf: 'center',
        color: themeColors.textColor,
    },
    musicControlsContainer: {
        marginVertical: 10
    }
});

export default LeftPanel;