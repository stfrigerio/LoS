import React, { useState, useCallback } from 'react';
import { useDrawerStatus } from '@react-navigation/drawer';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import TimeChart from './TimeChart'
import MusicPlayerControls from '../Music/components/MusicPlayerControls';

import { useHomepage } from '@los/shared/src/components/Home/helpers/useHomepage';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

//^ bandaid fix since im bored
type RootStackParamList = {
    time: undefined;
};

export interface SelectionData {
    isTagModalOpen: boolean;
    isDescriptionModalOpen: boolean;
    selectedTag?: string;
    selectedDescription?: string;
    newTagName?: string;
    newDescriptionName?: string;
}

const LeftPanel: React.FC<{ isDrawerOpen: boolean }> = ({ isDrawerOpen }) => {
    const [selectionData, setSelectionData] = useState<SelectionData>({
        isTagModalOpen: false,
        isDescriptionModalOpen: false,
    });
    
    const { openMusic } = useHomepage();

    const drawerStatus = useDrawerStatus();
    const isVisible = drawerStatus === 'open';
    const contentOpacity = isVisible ? 1 : 0;

    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const navigate = useCallback((route: keyof RootStackParamList) => {
        navigation.navigate(route);
    }, [navigation]);

    const handleTimeHubPress = useCallback(() => {
        navigate('time');
    }, [navigate]);
    const dynamicStyle = { ...styles.container, opacity: contentOpacity };

    return (
        <View style={dynamicStyle}>
            <View style={styles.chartContainer}>
                <TimeChart />
            </View>
            <Pressable style={styles.button} onPress={() => {handleTimeHubPress()}}>
                <Text style={styles.buttonText}>Time 🕒</Text>
            </Pressable>
            <View style={styles.separator}/>
            <View style={styles.musicControlsContainer}>
                <MusicPlayerControls />
            </View>
            <Pressable style={styles.button} onPress={openMusic}>
                <Text style={styles.buttonText}>Music 🎧</Text>
            </Pressable>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 50
    },
    chartContainer: {
        borderColor: theme.borderColor,
        borderRadius: 5,
        backgroundColor: 'transparent',
    },
    separator: {
        height: 1,
        backgroundColor: theme.borderColor,
        marginVertical: 20, 
    },
    button: {
        backgroundColor: theme.backgroundColor,
        padding: 10,
        borderWidth: 1,
        borderColor: theme.borderColor,
        borderRadius: 10,
        marginVertical: 4,
    },
    buttonText: {
        alignSelf: 'center',
        color: theme.textColor,
    },
    musicControlsContainer: {
        marginVertical: 10
    }
});

export default LeftPanel;