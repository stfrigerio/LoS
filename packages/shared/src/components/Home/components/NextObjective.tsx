import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { databaseManagers } from '@los/mobile/src/database/tables';
import { getWeekNumber } from '@los/shared/src/utilities/timeUtils';
import { useTimer } from '@los/mobile/src/components/Home/helpers/useTimer';

import { ObjectiveData } from '@los/shared/src/types/Objective';

interface ObjectiveWithPillarEmoji extends ObjectiveData {
    pillarEmoji: string;
}

interface NextObjectiveProps {
    homepageSettings: any;
    fetchNextTask: (setNextTask: (task: string) => void, setTimeLeft: (time: string) => void) => void;
}

const NextObjective: React.FC<NextObjectiveProps> = ({ homepageSettings, fetchNextTask }) => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const [objectives, setObjectives] = useState<ObjectiveWithPillarEmoji[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentSlideAnim] = useState(new Animated.Value(0));
    const [nextSlideAnim] = useState(new Animated.Value(300));
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandAnim] = useState(new Animated.Value(40));

    const [nextTask, setNextTask] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);
    const opacity = useRef(new Animated.Value(1)).current;

    const { timerRunning } = useTimer();

    useEffect(() => {
        fetchWeeklyObjectives();
    }, []);

    const fetchWeeklyObjectives = async () => {
        try {
            const currentWeek = getWeekNumber(new Date());
            const formattedWeek = `2024-W${currentWeek}`;
            const response = await databaseManagers.objectives.getObjectives({ period: formattedWeek });
            const pillars = await databaseManagers.pillars.getPillars();

            const objectivesWithPillarEmoji = response.map(objective => {
                const pillar = pillars.find(p => p.uuid === objective.pillarUuid);
                return {
                    ...objective,
                    pillarEmoji: pillar?.emoji,
                };
            });

            if (objectivesWithPillarEmoji && objectivesWithPillarEmoji.length > 0) {
                setObjectives(objectivesWithPillarEmoji as ObjectiveWithPillarEmoji[]);
            }
        } catch (error) {
            console.error("Error fetching objectives:", error);
        }
    };

    const handleFetchNextTask = () => {
        const animateOpacity = () => {
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.5,
                    duration: 100,
                    useNativeDriver: true
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true
                })
            ]).start();
        };

        if (Platform.OS !== 'web') {
            animateOpacity(); // Trigger animation
            fetchNextTask(setNextTask, setTimeLeft);
        }
    };

    useEffect(() => {
        handleFetchNextTask(); // Initial fetch on component mount
    }, []);

    const animateSlide = () => {
        Animated.parallel([
            Animated.timing(currentSlideAnim, {
                toValue: -300,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(nextSlideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % objectives.length);
            currentSlideAnim.setValue(0);
            nextSlideAnim.setValue(300);
        });
    };

    const showNextObjective = () => {
        if (objectives.length > 1) {
            animateSlide();
        }
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
        Animated.timing(expandAnim, {
            toValue: isExpanded ? 40 : 200, // Adjust this value as needed
            duration: 300,
            useNativeDriver: false,
        }).start();

        // Fetch next task when expanding
        if (!isExpanded) {
            handleFetchNextTask();
        }
    };

    const handlePress = () => {
        showNextObjective();
    };

    const handleLongPress = () => {
        toggleExpand();
    };

    if (objectives.length === 0) {
        return null;
    }

    const renderNextTask = () => {
        return (
            <>
                {nextTask && (
                    <Animated.View style={{ opacity }}>
                        <Pressable onPress={handleFetchNextTask} style={styles.nextTaskContainer}>
                            <Text style={styles.nextTask} numberOfLines={1} ellipsizeMode="tail">"{nextTask}"</Text>
                            <Text style={styles.timeLeft}>{timeLeft}</Text>
                        </Pressable>
                    </Animated.View>
                )}
            </>
        );
    };

    const nextIndex = (currentIndex + 1) % objectives.length;

    return (
        <Animated.View style={
            [
                styles.container, 
                { 
                    height: expandAnim, 
                    backgroundColor: isExpanded ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.05)' 
                }
            ]
        }>
            <Pressable 
                onPress={handlePress}
                onLongPress={handleLongPress}
                style={styles.objectiveWrapper}
            >   
                {isExpanded && (
                    <>
                        <Text style={styles.miniHeader}>Next Objectives</Text>
                        <View style={styles.miniHeaderSeparator} />
                    </>
                )}
                {/* Task nella view */}
                <Animated.View style={[styles.objectiveContainer, { transform: [{ translateX: currentSlideAnim }] }]}>
                    <Text 
                        numberOfLines={isExpanded ? undefined : 1} 
                        ellipsizeMode={isExpanded ? undefined : "tail"} 
                        style={
                            [
                                styles.objectiveText, 
                                { 
                                    fontWeight: isExpanded ? 'bold' : 'normal', 
                                    fontSize: isExpanded ? 14 : 8,
                                    color: isExpanded ? themeColors.textColorBold : themeColors.textColor, 
                                    alignSelf: 'center',
                                    marginTop: isExpanded ? 0 : 5,
                                }
                            ]
                        }
                    >
                        {objectives[currentIndex].pillarEmoji} {objectives[currentIndex].objective}

                    </Text>
                </Animated.View>
                {/* Task che scorre into view */}
                <Animated.View style={[styles.objectiveContainer, { transform: [{ translateX: nextSlideAnim }], position: 'absolute' }]}>
                    <Text 
                        numberOfLines={isExpanded ? undefined : 1} 
                        ellipsizeMode={isExpanded ? undefined : "tail"} 
                        style={
                            [
                                styles.objectiveText, 
                                { 
                                    fontWeight: isExpanded ? 'bold' : 'normal', 
                                    fontSize: isExpanded ? 14 : 8,
                                    color: isExpanded ? themeColors.textColorBold : themeColors.textColor, 
                                    marginTop: isExpanded ? 40 : 5,
                                    alignSelf: 'center'
                                }
                            ]
                        }
                    >
                        {objectives[nextIndex].pillarEmoji} {objectives[nextIndex].objective}
                    </Text>
                </Animated.View>
                {homepageSettings.HideNextTask?.value === "false" && isExpanded && ( 
                    <View style={styles.nextTaskWrapper}>
                        <Text style={styles.miniHeader}>Next Task</Text>
                        <View style={styles.miniHeaderSeparator} />
                        {renderNextTask()}
                    </View>
                )}
            </Pressable>
        </Animated.View>
    );
};

const getStyles = (themeColors: any) => StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 10,
        width: 140,
        height: 50,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 34,
        right: 112,
    },
    objectiveWrapper: {
        flex: 1,
        position: 'relative',
    },
    objectiveContainer: {
        flex: 1,
    },
    objectiveText: {
        fontFamily: 'serif',
        alignSelf: 'center',
    },
    nextButton: {
        padding: 5,
    },
    miniHeader: {
        fontSize: 16,
        color: 'gray',
        fontWeight: 'bold',
        marginBottom: 5,
        alignSelf: 'center',
    },
    miniHeaderSeparator: {
        height: 1,
        width: '100%',
        backgroundColor: 'gray',
        marginBottom: 12,
    },
    nextTaskWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    nextTaskContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextTask: {
        fontSize: 10,
        color: 'gray',
        textAlign: 'center',
    },
    timeLeft: {
        fontSize: 12,
        marginTop: 8,
        color: 'gray',
        fontStyle: 'italic',
    },
});

export default NextObjective;