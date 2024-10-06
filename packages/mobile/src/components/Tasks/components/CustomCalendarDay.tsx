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
                const handle = findNodeHandle(dayRef.current);
                if (handle) {
                    UIManager.measureInWindow(handle, (x, y, width, height) => {
                        onLayoutDay(date.dateString, {x, y, width, height});
                        console.log(`Measured Day ${date.dateString}: x=${x}, y=${y}, width=${width}, height=${height}`);
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
            {/* Render dots or other markings based on `marking` prop */}
            {marking && marking.dots && marking.dots.map((dot: any) => (
                <View key={dot.key} style={[styles.dot, { backgroundColor: dot.color }]} />
            ))}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 40, // Fixed width for uniformity
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
});

export default CustomDay;
