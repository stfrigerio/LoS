// CustomCalendarDay.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, findNodeHandle, UIManager } from 'react-native';

interface CustomDayProps {
    date: any;
    marking: any;
    currentMonth: number;
    onPress: () => void;
    isToday: boolean;
    onLayoutDay: (date: string, layout: {x: number, y: number, width: number, height: number}) => void;
}

const CustomDay: React.FC<CustomDayProps> = ({ date, marking, onPress, isToday, onLayoutDay, currentMonth }) => {
    const dayRef = useRef<TouchableOpacity>(null);

    useEffect(() => {
        const measureDay = () => {
            if (dayRef.current) {
                const node = findNodeHandle(dayRef.current);
                if (node) {
                    dayRef.current.measure((x, y, width, height, pageX, pageY) => {
                        onLayoutDay(date.dateString, {x: pageX - 20, y: pageY - 56, width, height});
                        // console.log(`Measured Day ${date.dateString}: x=${pageX}, y=${pageY}, width=${width}, height=${height}`);
                    });
                }
            }
        };
    
        // Use requestAnimationFrame to ensure measurement after layout
        const requestId = requestAnimationFrame(measureDay);

        return () => {
            cancelAnimationFrame(requestId);
        };
    }, [date.dateString]);

    return (
        <TouchableOpacity 
            ref={dayRef} 
            onPress={onPress} 
            style={styles.container}
            activeOpacity={0.7}
        >
            <Text style={[styles.text, isToday && styles.todayText]}>
                {date.day}
            </Text>
            <View style={styles.markingsContainer}>
                {marking && marking.dots && marking.dots.map((dot: any) => (
                    <View key={dot.key} style={[styles.dot, { backgroundColor: dot.color }]} />
                ))}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 30, // Fixed width for uniformity
        height: 40, // Fixed height for uniformity
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
    },
    text: {
        fontSize: 14,
        color: '#000',
    },
    todayText: {
        fontWeight: 'bold',
        color: 'blue',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 2,
    },
    markingsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default React.memo(CustomDay);
