import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Platform, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';

import MobileNavbar from '@los/shared/src/sharedComponents/NavBar';
import MoodEntry from './components/MoodEntry';
import MoodModal from '@los/shared/src/components/modals/MoodModal';
import GraphView from './components/GraphView';

import { useThemeStyles } from '../../styles/useThemeStyles';
import { useHomepage } from '../Home/helpers/useHomepage';

import { MoodNoteData } from '../../types/Mood';

let useMoodData: any
if (Platform.OS === 'web') {
    useMoodData = require('@los/desktop/src/components/Mood/hooks/useMoodData').useMoodData;
} else {
    useMoodData = require('@los/mobile/src/components/Mood/hooks/useMoodData').useMoodData;
}

const Moods: React.FC = () => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);
    const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
    const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);

    const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());

    const { entries, isLoading, error, deleteMood, refreshMoods } = useMoodData();
    const { openHomepage } = useHomepage();

    const sortedEntries = React.useMemo(() => {
        return [...entries].sort((a: MoodNoteData, b: MoodNoteData) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [entries]);
    
    const toggleExpand = (id: number) => {
        setExpandedEntries(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const renderMoodEntry = React.useCallback(({ item }: { item: MoodNoteData }) => (
        <MoodEntry
            item={item}
            isExpanded={expandedEntries.has(item.id!)}
            toggleExpand={toggleExpand}
            deleteMood={deleteMood}
            refreshMoods={refreshMoods}
        />
    ), [expandedEntries, toggleExpand]);

    const navItems = [
        { label: 'List View', onPress: () => setViewMode('list') },
        { label: 'Graph View', onPress: () => setViewMode('graph') },
    ];

    const handleMoodModalClose = useCallback(() => {
        setIsMoodModalOpen(false);
        refreshMoods();
    }, [refreshMoods]);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {viewMode === 'list' ? (
                    <FlatList
                        data={sortedEntries}
                        renderItem={renderMoodEntry}
                        keyExtractor={(item) => item.id!.toString()}
                        style={styles.list}
                        initialNumToRender={10}
                        maxToRenderPerBatch={20}
                        windowSize={21}
                    />
                ) : (
                    <GraphView moodData={sortedEntries} />
                )}
                {isMoodModalOpen && (
                    <MoodModal
                        isOpen={isMoodModalOpen}
                        closeMoodModal={handleMoodModalClose}
                    />
                )}
            </View>
            <MobileNavbar 
                items={navItems} 
                activeIndex={viewMode === 'list' ? 0 : 1} 
                title="Mood Entries"
                onBackPress={openHomepage}
                quickButtonFunction={() => setIsMoodModalOpen(true)}
                screen="mood"
            />
        </View>
    );
};


const getStyles = (themeColors: any, designs: any) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: themeColors.backgroundColor,
            paddingHorizontal: 10,
            marginTop: isDesktop ? 0 : 37,
        },
        content: {
            flex: 1,
            padding: 20,
        },
        viewToggle: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 20,
        },
        chartIcon: {
            marginLeft: 15,
        },
        list: {
            flex: 1,
        },
        graphPlaceholder: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
};

export default Moods;