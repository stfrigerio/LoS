import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Platform} from 'react-native';

import Navbar from '@los/shared/src/sharedComponents/NavBar';
import TimeList from './components/TimeList';
import TimeGraphs from './components/TimeGraphs';
import EditTimeEntryModal from './modals/EditModal';

import { useThemeStyles } from '../../styles/useThemeStyles';
import { useHomepage } from '../Home/helpers/useHomepage';

import { TimeData } from '../../types/Time';

let useTimeData: any
if (Platform.OS === 'web') {
    useTimeData = null;
} else {
    useTimeData = require('@los/mobile/src/components/Time/hooks/useTimeData').useTimeData;
}

const TimeHub: React.FC = () => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);
    const [showFilter, setShowFilter] = useState(false);
    const [activeView, setActiveView] = useState('List');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const closeAddModal = () => setIsAddModalOpen(false);
    const openAddModal = () => setIsAddModalOpen(true);
    const { openHomepage } = useHomepage();

    const { entries, isLoading, error, deleteTimeEntry, editTimeEntry, addTimeEntry } = useTimeData();
    

    const handleAddNewTimer = (newEntry: TimeData) => {
        addTimeEntry(newEntry);
        closeAddModal();
    };

    const toggleFilter = () => {
        setShowFilter(!showFilter);
    };

    const navItems = [
        { label: 'List', onPress: () => setActiveView('List') },
        { label: 'Graph', onPress: () => setActiveView('Graph') }
    ];

    return (
        <View style={styles.container}>
            {activeView === 'List' && (
                <TimeList 
                    entries={entries}
                    isLoading={isLoading}
                    error={error}
                    deleteTimeEntry={deleteTimeEntry}
                    editTimeEntry={editTimeEntry}
                    showFilter={showFilter}
                />
            )}
            {activeView === 'Graph' && (
                <TimeGraphs entries={entries} />
            )}
            <Navbar
                items={navItems} 
                activeIndex={navItems.findIndex(item => item.label === activeView)} 
                title="Time"
                onBackPress={Platform.OS === 'web' ? openHomepage : undefined}
                showFilter={activeView === 'List' ? true : false}
                onFilterPress={toggleFilter}
                quickButtonFunction={openAddModal}
                screen="time"
            />
            {isAddModalOpen && (
                <EditTimeEntryModal
                    isVisible={isAddModalOpen}
                    onClose={closeAddModal}
                    onSave={handleAddNewTimer}
                    timeEntry={{
                        date: new Date().toISOString(),
                        startTime: new Date().toISOString(),
                        endTime: new Date().toISOString(),
                        duration: '00:00:00',
                        tag: '',
                        description: '',
                    }}
                />
            )}
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
            padding: 20,
            marginTop: isDesktop ? 0 : 37,
        },
        header: {
            alignItems: 'center',
            marginBottom: 10,
            fontFamily: 'serif',
        },
        headerText: {
            ...designs.text.title,
            fontSize: 24,
            fontFamily: 'serif',
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
        floatingButton: {
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: themeColors.hoverColor,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
        },
        timeList: {
            flex: 1,
            marginTop: 30,
        },
    });
};

export default TimeHub;