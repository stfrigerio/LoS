// Libraries
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Dimensions } from 'react-native';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

// Components
import AddHabitModal from './modals/AddHabitModal';
import HabitRow from './atoms/HabitRow'
import AppSettingRow from './atoms/AppSettingRow';
import GluedQuickbutton from '@los/shared/src/sharedComponents/NavBar/GluedQuickbutton';
import Collapsible from '@los/shared/src/sharedComponents/Collapsible';
import { PickerInput } from '../../modals/components/FormComponents';

import { UseSettingsType } from './types/DailyNote';
import { UserSettingData } from '../../../types/UserSettings';

let useSettings: UseSettingsType;
if (Platform.OS === 'web') {
    useSettings = require('@los/desktop/src/components/UserSettings/hooks/useSettings').useSettings;
} else {
    useSettings = require('@los/mobile/src/components/UserSettings/hooks/useSettings').useSettings;
}

const DailyNoteSettings: React.FC = () => {
    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors, designs);

    const [expandedSections, setExpandedSections] = useState({
        dailyNoteSettings: false,
        switchHabits: false,
        countableHabits: false,
    });

    const { settings, deleteRecord, updateSetting, fetchSettings } = useSettings();
    const [isModalVisible, setIsModalVisible] = useState(false);
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleModalClose = () => {
        setIsModalVisible(false);
        fetchSettings(); // refresh the data
    };

    const toggleSection = (section: 'dailyNoteSettings' | 'countableHabits' | 'switchHabits') => {
        setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section],
        }));
    };

    const renderHabitRow = (key: string, setting: UserSettingData) => (
        <View style={styles.habitRow} key={key}>
        <HabitRow
            habitName={key}
            setting={setting}
            updateSetting={updateSetting}
            deleteRecord={deleteRecord}
        />
        </View>
    );

    const renderSectionHeader = (title: string, section: 'dailyNoteSettings' | 'countableHabits' | 'switchHabits') => {
        const isSubheader = title.includes('Habits');
        const isDailyNoteSettings = section === 'dailyNoteSettings';

        return (
            <Pressable 
                onPress={() => toggleSection(section)} 
                style={[
                    styles.sectionHeader,
                    isSubheader && styles.subheaderStyle
                ]}
            >
                <Text style={[
                    designs.text.title,
                    isSubheader && styles.subheaderText
                ]}>
                    {title}
                </Text>
                {!isDailyNoteSettings && (
                    <Text style={[
                        styles.arrow,
                        expandedSections[section] && styles.arrowExpanded,
                        isSubheader && styles.subheaderArrow
                    ]}>
                        ▼
                    </Text>
                )}
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
            >
                {renderSectionHeader('Daily Note Settings', 'dailyNoteSettings')}
                <Text style={styles.explainerText}>Customize the appearance and behavior of your daily note.</Text>
                <AppSettingRow
                    settingKey="QuoteCollapse"
                    label="Auto Collapse Quote"
                    type="appSettings"
                    settings={settings}
                    updateSetting={updateSetting}
                    explainerText="If enabled, the quote will be automatically collapsed when the daily note is opened."
                />
                <AppSettingRow
                    settingKey="HideQuote"
                    label="Hide Quote"
                    type="appSettings"
                    settings={settings}
                    updateSetting={updateSetting}
                    explainerText="If enabled, the quote will be hidden from the daily note."
                />
                <AppSettingRow
                    settingKey="FixedQuote"
                    label="Fixed Daily Quote"
                    type="appSettings"
                    settings={settings}
                    updateSetting={updateSetting}
                    explainerText="If enabled, the quote won't change each time the daily note is opened."
                />
                <AppSettingRow
                    settingKey="BooleanHabitsName"
                    label="Toggle Switch Habits Name"
                    type="appSettings"
                    settings={settings}
                    updateSetting={updateSetting}
                    explainerText="If enabled, the switch habits will be shown with their names."
                />
                <View style={{height: 40}} />

                {renderSectionHeader('Switch Habits', 'switchHabits')}
                <Collapsible collapsed={!expandedSections.switchHabits}>
                    <Text style={styles.explainerText}>
                        Switch habits are simple yes/no activities you typically do once a day. 
                        For example, "Did you exercise?" or "Did you read today?". 
                        Your progress will be shown in a colorful calendar view, making it easy to see your consistency over time.
                    </Text>
                    {Object.entries(settings).filter(([, setting]) => setting.type === 'booleanHabits').map(([key, setting]) => renderHabitRow(key, setting))}
                </Collapsible>
                <View style={{height: 40}} />

                {renderSectionHeader('Countable Habits', 'countableHabits')}
                <Collapsible collapsed={!expandedSections.countableHabits}>
                    <Text style={styles.explainerText}>
                        Track habits with numerical goals or counts. For example, "How many glasses of water did you drink?" or "How many cigarettes did you smoke?". 
                        Your progress will be shown as simple line charts, allowing you to see trends over time.
                    </Text>
                    {Object.entries(settings).filter(([, setting]) => setting.type === 'quantifiableHabits').map(([key, setting]) => renderHabitRow(key, setting))}
                    <View style={{height: 40}} />
                </Collapsible>
                <View style={{height: 40}} />

            </ScrollView>
            {isModalVisible && (
                <AddHabitModal
                    visible={isModalVisible}
                    onClose={() => handleModalClose()}
                    onUpdate={updateSetting}
                />
            )}
            <View style={styles.quickButtonContainer}>
                <GluedQuickbutton screen="generalSettings" onPress={() => setIsModalVisible(true)} />
            </View>
        </View>
    );
};

const getStyles = (theme: any, designs: any) => {
    const { width, height } = Dimensions.get('window');
    const isDesktop = width > 768;

    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            marginTop: 10,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
        },
        arrow: {
            fontSize: designs.text.title.fontSize,
            color: theme.textColor,
            transform: [{ rotate: '0deg' }],
            marginBottom: 15
        },
        arrowExpanded: {
            transform: [{ rotate: '180deg' }],
            marginBottom: 0
        },
        habitRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        subheaderStyle: {
            marginLeft: 20,
        },
        subheaderText: {
            fontSize: designs.text.title.fontSize * 0.8, // 80% of the original size
        },
        subheaderArrow: {
            fontSize: designs.text.title.fontSize * 0.8, // 80% of the original size
        },
        scrollView: {
            flex: 1,
        },
        scrollViewContent: {
            padding: 20,
            paddingBottom: 100, // Extra padding at the bottom
        },
        bottomPadding: {
            height: 60, // Adjust this value based on your GluedQuickbutton height
        },
        quickButtonContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
        },
        explainerText: {
            color: 'gray',
            marginBottom: 10,
            marginLeft: 5,
        },
    });
};

export default DailyNoteSettings;