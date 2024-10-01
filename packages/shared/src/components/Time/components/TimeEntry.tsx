import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import EditTimeEntryModal from '../modals/EditModal';

import { TimeData } from '../../../types/Time';
import { useThemeStyles } from '../../../styles/useThemeStyles';

let useColors: any;
if (Platform.OS === 'web') {
    useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
    useColors = require('@los/mobile/src/components/useColors').useColors;
}

interface TimeEntryProps {
    item: TimeData;
    isExpanded: boolean;
    toggleExpand: (id: number) => void;
    onUpdateTimeEntry: (updatedEntry: TimeData) => void;
    deleteTimeEntry: (id: number) => void;
}

const TimeEntry: React.FC<TimeEntryProps> = ({
    item,
    onUpdateTimeEntry,
    deleteTimeEntry,
}) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);
    const { colors: tagColors, loading, error } = useColors();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleDelete = () => {
        if (item.id) {
            Alert.alert(
                'Delete Time Entry',
                'Are you sure you want to delete this time entry?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'OK', onPress: () => deleteTimeEntry(item.id!) },
                ],
                { cancelable: true }
            );
        }
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        return {
            day: d.getDate().toString(),
            month: d.toLocaleString('default', { month: 'short' })
        };
    };

    const handleEditPress = () => {
        console.log('Edit pressed');
        setIsEditModalOpen(true);
    };

    const { day, month } = formatDate(item.date);

    const tagColor = tagColors[item.tag] || 'gray'; // Default to gray if color not found

    return (
        <>
            <View style={styles.container}>
                <Pressable onPress={handleEditPress} style={styles.content}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateDay}>{day}</Text>
                        <Text style={styles.dateMonth}>{month}</Text>
                    </View>
                    <View style={[styles.tag]}>
                        <Text style={[styles.tagText, { color: tagColor }]}>{item.tag}</Text>
                    </View>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={styles.description}>{item.description}</Text>
                    <Text style={styles.duration}>{item.duration || 'No duration'}</Text>
                </Pressable>
                <Pressable onPress={handleDelete} style={styles.actionIcon}>
                    <FontAwesomeIcon icon={faTrash} size={20} color={'gray'}/>
                </Pressable>
            </View>
            {isEditModalOpen && (
                <EditTimeEntryModal
                    isVisible={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={onUpdateTimeEntry}
                    timeEntry={item}
                />
            )}
        </>
    );
};

const getStyles = (themeColors: any, designs: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: themeColors.backgroundSecondary,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateContainer: {
        width: '15%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateDay: {
        ...designs.text.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    dateMonth: {
        ...designs.text.text,
        fontSize: 12,
    },
    tag: {
        width: '30%',
        paddingHorizontal: 8,
        // paddingVertical: 4,
        // borderRadius: 4,
        // marginHorizontal: 5,
    },
    tagText: {
        ...designs.text.text,
        color: themeColors.textColorOnAccent,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    description: {
        ...designs.text.text,
        flex: 1,
        marginHorizontal: 5,
    },
    duration: {
        ...designs.text.text,
        width: '25%',
        textAlign: 'right',
        marginRight: 5,
    },
    actionIcon: {
        padding: 15,
        marginLeft: 10,
        width: '10%',
        alignItems: 'center',
    },

});

export default TimeEntry;