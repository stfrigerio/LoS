import React, { FC, useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ImageBackground, ScrollView, Platform, Animated, Dimensions } from 'react-native';
import  { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

import { getWeekNumber } from '@los/shared/src/utilities/timeUtils';
import { useHomepage } from './helpers/useHomepage';

let CustomCalendar: React.ComponentType<any>
let DayNotesStatus: React.ComponentType<any>
let QuickButton: React.ComponentType<any>
let TimerComponent: React.ComponentType<any>
let NextObjective: React.ComponentType<any>
let fetchNextTask: (setNextTask: any, setTimeLeft: any) => Promise<any>;
if (Platform.OS === 'web') {
    CustomCalendar = require('@los/desktop/src/components/Home/components/Calendar').default;
} else {
    CustomCalendar = require('@los/mobile/src/components/Home/components/Calendar').default;
    QuickButton = require('@los/mobile/src/components/Home/components/QuickButton').default;
    DayNotesStatus = require('@los/mobile/src/components/Home/components/DayNotesStatus').default;
    fetchNextTask = require('@los/mobile/src/components/Home/hooks/fetchNextTask').fetchNextTask;
    TimerComponent = require('@los/mobile/src/components/Home/components/TimerComponent').default;
    NextObjective = require('@los/shared/src/components/Home/components/NextObjective').default;
}

// styles
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

const Homepage: FC = () => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);
    const calendarKey = theme;
    const today = new Date().toString();
    const todayFormatted = format(today, 'EEEE, dd MMMM');

    const [isQuickButtonExpanded, setIsQuickButtonExpanded] = useState(false);
    const settingsSlideAnim = useRef(new Animated.Value(0)).current;
    const settingsRotateAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const { 
        openSettings, 
        openToday, 
        openLibrary, 
        openJournalHub,
        openPeople,
        openMoney,
        openMoods,
        openTasks,
        openCurrentWeek,
        homepageSettings
    } = useHomepage();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(settingsSlideAnim, {
                toValue: isQuickButtonExpanded ? -80 : 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(settingsRotateAnim, {
                toValue: isQuickButtonExpanded ? 1 : 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isQuickButtonExpanded]);

    useEffect(() => {
        if (!isQuickButtonExpanded) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [isQuickButtonExpanded, homepageSettings.HideNextObjective]);

    const spin = settingsRotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-240deg']
    });
    
    const getBackgroundImage = () => {
        return require('@los/mobile/src/assets/evening.jpg');
    };

    const shouldShow = (setting?: { value: string }) => {
        return setting === undefined || setting.value !== "true";
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <ImageBackground
                source={getBackgroundImage()}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={styles.content}>
                    {isQuickButtonExpanded && (
                        <Pressable 
                            style={styles.overlay} 
                            onPress={() => setIsQuickButtonExpanded(false)}
                        />
                    )}
                    <CustomCalendar key={calendarKey} />
                    {Platform.OS !== 'web' && shouldShow(homepageSettings.HideDots) && (
                        <DayNotesStatus />
                    )}
                    {!shouldShow(homepageSettings.HideDots) && (
                        <View style={{height: 30}} />
                    )}
                    <View style={styles.buttonContainers}>
                        {Platform.OS !== 'web' ? (
                            <Pressable style={styles.databaseButton} onPress={openToday}>
                                <Text style={styles.buttonText}>{todayFormatted} 🌞</Text>
                            </Pressable>
                        ) : (
                            <Pressable style={styles.databaseButton} onPress={openCurrentWeek}>
                                <Text style={styles.buttonText}>{new Date().getFullYear()}-W{getWeekNumber(new Date())}</Text>
                            </Pressable>
                        )}
                        <View style={styles.navigationContainer}>
                            <View style={styles.notesNavigation}>
                                {shouldShow(homepageSettings.HidePeople) && (
                                    <Pressable style={styles.button} onPress={() => openPeople()}>
                                        <Text style={styles.buttonText}>People 👤</Text>
                                    </Pressable>
                                )}
                                {shouldShow(homepageSettings.HideTasks) && (
                                    <Pressable style={styles.button} onPress={() => openTasks()}>
                                        <Text style={styles.buttonText}>Tasks ✅</Text>
                                    </Pressable>
                                )}
                                {shouldShow(homepageSettings.HideJournal) && (
                                    <Pressable style={styles.button} onPress={openJournalHub}>
                                        <Text style={styles.buttonText}>Journal 📝</Text>
                                    </Pressable>
                                )}
                                {shouldShow(homepageSettings.HideMoods) && (
                                    <Pressable style={styles.button} onPress={() => openMoods()}>
                                        <Text style={styles.buttonText}>Moods 💭</Text>
                                    </Pressable>
                                )}
                                {shouldShow(homepageSettings.HideLibrary) && (
                                    <Pressable style={styles.button} onPress={openLibrary}>
                                        <Text style={styles.buttonText}>Library 📚</Text>
                                    </Pressable>
                                )}
                                {shouldShow(homepageSettings.HideMoney) && (
                                    <Pressable style={styles.button} onPress={() => openMoney()}>
                                        <Text style={styles.buttonText}>Money 💸</Text>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
                {Platform.OS !== 'web' && (
                    <View style={styles.footerActions}>
                        <Animated.View style={{ opacity: fadeAnim }}>
                            <TimerComponent homepageSettings={homepageSettings} />
                        </Animated.View>
                        {shouldShow(homepageSettings.HideNextObjective) && (
                            <Animated.View style={{
                                opacity: fadeAnim,
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                            }}>
                                <NextObjective homepageSettings={homepageSettings} fetchNextTask={fetchNextTask} />
                            </Animated.View>
                        )}
                        <View style={styles.quickButtonContainer}>
                            <QuickButton 
                                isExpanded={isQuickButtonExpanded} 
                                setIsExpanded={setIsQuickButtonExpanded} 
                                homepageSettings={homepageSettings}
                            />
                            <Animated.View style={[
                                styles.settingsButton,
                                { 
                                    transform: [
                                        { translateX: settingsSlideAnim },
                                        { rotate: spin }
                                    ] 
                                }
                            ]}>
                                <Pressable onPress={openSettings}>
                                    <FontAwesomeIcon icon={faCog} size={28} color={'gray'} />
                                </Pressable>
                            </Animated.View>
                        </View>
                    </View>
                )}
            </ImageBackground>
        </ScrollView>
    );
};

const getStyles = (theme: any) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        scrollViewContent: {
            flexGrow: 1,
            backgroundColor: 'transparent'
        },
        backgroundImage: {
            flex: 1,
            width: '100%',
            minHeight: '100%',
        },
        content: {
            flex: 1,
            alignItems: 'center',
        },

        buttonContainers: {
            width: isSmall ? '75%' : '50%',
        },
        navigationContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
        },
        notesNavigation: {
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        button: {
            margin: 10,
            padding: 10,
            flexGrow: 1,
            flexBasis: '40%', // This allows two buttons per row
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: theme.borderColor,
            borderRadius: 10,
        },
        databaseButton: {
            margin: 10,
            padding: 10,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: theme.borderColor,
            borderRadius: 10,
        },
        buttonText: {
            color: theme.textColor,
            textAlign: 'center'
        },
        quickButtonContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        settingsButton: {
            position: 'absolute',
            right: 0,
            padding: 10,
            zIndex: 1,
        },
        footerActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            zIndex: 1
        },
    });
};

export default Homepage;