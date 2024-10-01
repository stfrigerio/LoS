import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface CustomDayProps {
    date?: { day: number; month: number; year: number; timestamp: number; dateString: string };
    marking?: { dots?: Array<{ key: string; color: string }> };
    onPress?: () => void;
    currentMonth: number; // Add this prop
    isToday: boolean; // Add this prop
}

const CustomDay: React.FC<CustomDayProps> = ({ date, marking, onPress, currentMonth, isToday }) => {
    if (!date) {
        return <View />;
    }

    const isCurrentMonth = date.month === currentMonth;
    const textColor = isCurrentMonth ? '#d3c6aa' : '#424242';

    return (
        <Pressable style={styles.container} onPress={onPress}>
            <View style={[styles.contentContainer, isToday && styles.todayContainer]}>
                <Text style={[
                    styles.text, 
                    { color: textColor },
                    isToday && styles.todayText
                ]}>
                    {date.day}
                </Text>
                <View style={styles.dotsContainer}>
                    {marking?.dots ? (
                        marking.dots.map((dot, index) => (
                            <View
                                key={dot.key}
                                style={[styles.dot, { backgroundColor: dot.color }]}
                            />
                        ))
                    ) : (
                        <View style={styles.fakeDot} />
                    )}
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        // borderWidth: 1,
    },
    contentContainer: {
        alignItems: 'center',
    },
    text: {
        fontSize: 14,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 4,
    },
    todayText: {
        fontSize: 16,
        color: '#CBA95F',
        fontFamily: 'serif',
        fontWeight: 'bold'
    },
    todayContainer: {
        width: 32,
        height: 32,
        justifyContent: 'center',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 1,
    },
    fakeDot: {
        width: 4,
        height: 4,
        opacity: 0,
    },
});

export default CustomDay;