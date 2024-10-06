import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ExtendedTaskData } from '@los/shared/src/types/Task';

interface DraggableTaskProps {
    task: ExtendedTaskData;
    onDeletePress: () => void;
    onDragEnd: (x: number, y: number) => void;
    onDragStart: () => void;
    isDragging: Animated.SharedValue<number>;
    themeColors: any;
    styles: any;
}

export const DraggableTask: React.FC<DraggableTaskProps> = ({
    task,
    onDeletePress,
    onDragEnd,
    onDragStart,
    isDragging,
    themeColors,
    styles,
}) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    const panGesture = useAnimatedGestureHandler({
        onStart: (_, ctx: any) => {
            ctx.startX = translateX.value;
            ctx.startY = translateY.value;
            scale.value = 1.1;
            runOnJS(onDragStart)();
            isDragging.value = 1;
        },
        onActive: (event, ctx: any) => {
            translateX.value = ctx.startX + event.translationX;
            translateY.value = ctx.startY + event.translationY;
        },
        onEnd: (event) => {
            runOnJS(onDragEnd)(event.absoluteX, event.absoluteY);
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            scale.value = withSpring(1);
            isDragging.value = 0;
        },
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <View style={styles.taskWrapper}>
            <PanGestureHandler onGestureEvent={panGesture}>
                <Animated.View style={[styles.taskItem, animatedStyle]}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.taskText}>{task.text}</Text>
                </Animated.View>
            </PanGestureHandler>
            <Pressable onPress={onDeletePress} style={styles.deleteIcon}>
                <FontAwesomeIcon icon={faTrash} color={themeColors.textColor} size={14} />
            </Pressable>
        </View>
    );
};