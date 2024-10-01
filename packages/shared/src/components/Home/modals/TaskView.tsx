import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash, faEdit, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';

import { ExtendedTaskData } from '@los/shared/src/types/Task';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface TaskViewProps {
    item: ExtendedTaskData;
    toggleItemCompletion: (id: number, completed: boolean) => Promise<void>;
    onDelete: (uuid: string) => void;
    isLast: boolean;
    onLongPress: () => void;
    onPostpone: (task: ExtendedTaskData) => void;
}

const TaskView: React.FC<TaskViewProps> = ({
    item,
    toggleItemCompletion,
    onDelete,
    isLast,
    onLongPress,
    onPostpone,
}) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    const formatDateTimeDisplay = (isoString: string) => {
        const date = new Date(isoString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    const handlePress = () => {
        toggleItemCompletion(item.id!, item.completed);
    };

    return (
        <View style={styles.container}>
            <Pressable 
                onPress={handlePress}
                onLongPress={onLongPress}
                delayLongPress={500} // Adjust this value as needed
                style={styles.contentContainer}
            >
                <View style={[styles.circle, item.completed ? styles.completedCircle : null]} />
                <View style={styles.dueHourContainer}>
                    <Text style={[item.completed ? styles.completedText : designs.text.text, { fontSize: 12 }]}>
                        {item.due
                            ? formatDateTimeDisplay(item.due).split(' ')[1].split(':').slice(0, 2).join(':')
                            : 'No due'
                        }
                    </Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.textContainer}>
                    <Text style={[item.completed ? styles.completedText : designs.text.text, { fontSize: 12 }]} numberOfLines={1} ellipsizeMode="tail">
                        {item.text}
                    </Text>
                </View>
            </Pressable>
            {!item.completed ? (
                <Pressable onPress={() => onPostpone(item)} style={styles.iconButton}>
                    <FontAwesomeIcon icon={faRotateRight} color={'gray'} size={15} />
                </Pressable>
            ) : (
                <View style={[styles.iconButton, { marginRight: 15 }]} />
            )}
            <Pressable onPress={() => onDelete(item.uuid!)} style={styles.iconButton}>
                <FontAwesomeIcon icon={faTrash} color={'gray'} size={15} />
            </Pressable>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderWidth: 1, 
        // borderColor: 'red',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    circle: {
        height: 12,
        width: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.borderColor,
    },
    completedCircle: {
        backgroundColor: theme.greenOpacity,
    },
    dueHourContainer: {
        width: '20%',
        alignItems: 'center',
        marginLeft: 5,
    },
    separator: {
        width: 1,
        height: 40,
        backgroundColor: theme.borderColor,
        marginHorizontal: 6,
    },
    textContainer: {
        flex: 1,
    },
    deleteIcon: {
        padding: 10,
    },
    iconButton: {
        padding: 10,
    },
    completedText: {
        color: 'gray',
        textDecorationLine: 'line-through',
    },
});

export default TaskView;