import React, { useState, forwardRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

import ViewTaskModal from '@los/shared/src/components/Home/modals/ViewTaskModal';

import { databaseManagers } from '../../../database/tables';
import {
    parseChecklistItems,
    getUpdatedBirthdayDates,
    mergeDates,
    getDayItems,
} from '@los/mobile/src/components/Home/hooks/useCalendar';
import { useChecklist } from '../../Contexts/checklistContext';

import { darkCalendar, lightCalendar} from '@los/shared/src/styles/theme'; 
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

import { ExtendedTaskData } from '@los/shared/src/types/task';

interface DraggableCalendarProps {
    onLayoutUpdate: (layouts: any[]) => void;
    height: number;
    onRefresh: () => void;
}

const DraggableCalendar = forwardRef<View, DraggableCalendarProps>(
    ({ onLayoutUpdate, height, onRefresh, ...calendarProps }, ref) => {
        const { theme, themeColors, designs } = useThemeStyles();
        const styles = getStyles(themeColors);
        const isDarkMode = theme === 'dark';
        const calendarTheme = isDarkMode ? darkCalendar : lightCalendar;
        const [calendarLayout, setCalendarLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
        const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM-DD'));
        const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
        const [showModal, setShowModal] = useState(false);
        const [selectedDate, setSelectedDate] = useState('');
        const [checklistItems, setChecklistItems] = useState<ExtendedTaskData[]>([]);
        const { checklistUpdated, resetChecklistUpdate } = useChecklist();
        const [birthdayDetails, setBirthdayDetails] = useState({ isBirthday: false, name: "", age: null as number | null });
        const currentYear = new Date().getFullYear();

        async function fetchMarkedDates() {
            const items = await databaseManagers.tasks.list();
            const filteredItems = items.filter((item) => item.type !== 'checklist');
            const tempDueDates = parseChecklistItems(filteredItems);    
            const updatedBirthdayDates = await getUpdatedBirthdayDates(currentYear);
            const dueDates = mergeDates(tempDueDates, updatedBirthdayDates);
            setMarkedDates(dueDates);
            onRefresh();
        }

        useEffect(() => {
            fetchMarkedDates()
        
            if (checklistUpdated) {
                fetchMarkedDates();
                resetChecklistUpdate();
            }
        }, [checklistUpdated]);

        const onDayPress = async (day: any) => {
            console.log('onDayPress', day);
            const formattedDate = day.dateString;
            const displayItems = await getDayItems(formattedDate, markedDates);          
            const isBirthday = markedDates[formattedDate]?.isBirthday || false;
            const birthdayPerson = markedDates[formattedDate]?.name || "";
            const birthdayAge = markedDates[formattedDate]?.age ?? null;

            setSelectedDate(formattedDate);
            setChecklistItems(displayItems);
            setShowModal(true);
            setBirthdayDetails({ isBirthday, name: birthdayPerson, age: birthdayAge });
        };
        
        const toggleItemCompletion = async (id: number, completed: boolean) => {
            try {
                const newItem = {
                    ...checklistItems.find((item) => item.id === id),
                    completed: !completed,
                }
        
                await databaseManagers.tasks.upsert(newItem);
                fetchMarkedDates();
                if (selectedDate) {
                    const startDate = `${selectedDate}T00:00:00.000Z`;
                    const endDate = `${selectedDate}T23:59:59.999Z`;
                    const items = await databaseManagers.tasks.listByDateRange(startDate, endDate);
            
                    setChecklistItems(items);
                }
            } catch (error) {
                console.error('Error toggling item completion:', error);
            }
        };

        const onMonthChange = (month: any) => {
            setCurrentMonth(month.dateString);
        };

        useEffect(() => {
            if (calendarLayout.width > 0 && calendarLayout.height > 0) {
                const dayWidth = calendarLayout.width / 7;
                const dayHeight = calendarLayout.height / 6;
                const layouts = [];

                const startOfMonth = moment(currentMonth).startOf('month');
                const endOfMonth = moment(currentMonth).endOf('month');
                const startOfCalendar = startOfMonth.clone().startOf('week');
                const endOfCalendar = endOfMonth.clone().endOf('week');

                let currentDate = startOfCalendar.clone();
                let week = 0;
        
                while (currentDate.isSameOrBefore(endOfCalendar)) {
                    for (let day = 0; day < 7; day++) {
                        layouts.push({
                        date: currentDate.format('YYYY-MM-DD'),
                        layout: {
                            x: day * dayWidth,
                            y: week * dayHeight,
                            width: dayWidth,
                            height: dayHeight,
                        },
                        });
                        currentDate.add(1, 'day');
                    }
                    week++;
                }
        
                onLayoutUpdate(layouts);
            }
        }, [calendarLayout, onLayoutUpdate, currentMonth]);

        const deleteTask = async (uuid: string) => {
            await databaseManagers.tasks.removeByUuid(uuid);
            fetchMarkedDates();
        }

        return (
            <View
                ref={ref}
                style={[styles.container, { height }]}
                onLayout={(event) => setCalendarLayout(event.nativeEvent.layout)}
            >
                <Calendar
                    onDayPress={onDayPress}
                    onMonthChange={onMonthChange}
                    theme={{
                        ...calendarTheme,
                    }}
                    markedDates={markedDates}
                    {...calendarProps}
                    style={styles.calendar}
                    enableSwipeMonths={true} 
                />
                {showModal && (
                    <ViewTaskModal
                        showModal={showModal}
                        setShowModal={setShowModal}
                        selectedDate={selectedDate}
                        checklistItems={checklistItems}
                        toggleItemCompletion={toggleItemCompletion}
                        isBirthday={birthdayDetails.isBirthday}
                        birthdayPerson={birthdayDetails.name}
                        birthdayAge={birthdayDetails.age}
                        deleteTask={deleteTask}
                    />
                )}
            </View>
        );
    }
);

const getStyles = (themeColors: any) => {
    const { width } = Dimensions.get('window');

    return StyleSheet.create({
        container: {
            width: '100%',
        },
        calendar: {
            // borderWidth: 1,
            // borderColor: 'purple',
            borderRadius: 8,
        },
    });
};

export default DraggableCalendar;