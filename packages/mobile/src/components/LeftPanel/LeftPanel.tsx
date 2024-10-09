import React, { useCallback } from 'react';
import { useDrawerStatus } from '@react-navigation/drawer';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

import TimeChart from './TimeChart'
import MusicPlayerControls from '../Music/components/MusicPlayerControls';

import { useHomepage } from '@los/shared/src/components/Home/helpers/useHomepage';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

type RootStackParamList = {
    time: undefined;
};

const LeftPanel: React.FC<{ isDrawerOpen: boolean }> = ({ isDrawerOpen }) => {
    const { openMusic } = useHomepage();
    const { theme, themeColors, designs } = useThemeStyles();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const navigate = useCallback((route: keyof RootStackParamList) => {
        navigation.navigate(route);
    }, [navigation]);

    const handleTimeHubPress = useCallback(() => {
        navigate('time');
    }, [navigate]);

    const styles = getStyles(themeColors, theme);

    return (
        <View style={styles.container}>
            <BlurView 
                intensity={80} 
                tint={theme === 'dark' ? 'dark' : 'light'} 
                style={StyleSheet.absoluteFill} 
            />
            <View style={styles.content}>
                <View style={styles.chartContainer}>
                    <TimeChart />
                </View>
                <Pressable style={styles.button} onPress={handleTimeHubPress}>
                    <Text style={styles.buttonText}>Time 🕒</Text>
                </Pressable>
                <View style={styles.separator}/>
                <Pressable style={styles.button} onPress={openMusic}>
                    <Text style={styles.buttonText}>Music 🎧</Text>
                </Pressable>
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
        overflow: 'hidden', // Ensure blur doesn't extend beyond container
    },
    content: {
        flex: 1,
        padding: 20,
        paddingTop: 50,
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