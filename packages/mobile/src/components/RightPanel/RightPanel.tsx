import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { format } from 'date-fns';

import DailyNote from '@los/shared/src/components/DailyNote/DailyNote';
import PeriodicNote from '@los/shared/src/components/PeriodicNote/PeriodicNote';
import Money from '@los/shared/src/components/Money/Money';
import Task from '@los/shared/src/components/Tasks/Tasks';

import { databaseManagers } from '../../database/tables';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { startOfPeriod, formatDate } from '@los/shared/src/utilities/timezoneBullshit';

const RightPanel: React.FC<DrawerContentComponentProps> = (props) => {
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);
    const [rightPanelView, setRightPanelView] = useState<string>('DailyNote');

    useEffect(() => {
        databaseManagers.userSettings.getByKey('RightPanelView').then(setting => {
            if (setting) setRightPanelView(setting.value);
        });
    }, []);

    const getComponentByView = () => {
        const today = new Date();
        
        switch (rightPanelView) {
            case 'Money':
                return <Money />;
            case 'Task':
                return <Task />;
            case 'WeeklyNote':
                const startOfWeek = startOfPeriod(today, 'week');
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
            
                return (
                    <PeriodicNote
                        startDate={formatDate(startOfWeek, 'yyyy-MM-dd')}
                        endDate={formatDate(endOfWeek, 'yyyy-MM-dd')}
                    />
                );
            case 'DailyNote':
            default:
                return <DailyNote date={format(today, 'yyyy-MM-dd')} />;
        }
    };

    return (
        <View style={styles.container}>
            {getComponentByView()}
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.backgroundColor,
    },
    scrollContent: {
        flexGrow: 1,
    },
});

export default RightPanel;