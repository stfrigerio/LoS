import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'react-native-calendars';
import { StyleSheet } from 'react-native';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { darkCalendar, lightCalendar} from '@los/shared/src/styles/theme'; 
import CustomDay from './CustomCalendarDay';

import { databaseManagers } from '../../../database/tables';
import { useChecklist } from '../../Contexts/checklistContext';
import ViewTaskModal from '@los/shared/src/components/Home/modals/ViewTaskModal';

import {
	parseChecklistItems,
	getUpdatedBirthdayDates,
	mergeDates,
	getDayItems,
} from '../hooks/useCalendar';

import { MarkedDateDetails, ExtendedTaskData } from '@los/shared/src/types/Task';

const CustomCalendar = () => {
	const { theme, themeColors, designs } = useThemeStyles();
	const styles = getStyles(themeColors);
	const isDarkMode = theme === 'dark';
	const calendarTheme = isDarkMode ? darkCalendar : lightCalendar;

	const [markedDates, setMarkedDates] = useState<Record<string, MarkedDateDetails>>({});
	const [showModal, setShowModal] = useState(false);
	const [selectedDate, setSelectedDate] = useState('');
	const [checklistItems, setChecklistItems] = useState<ExtendedTaskData[]>([]);

	const { checklistUpdated, resetChecklistUpdate } = useChecklist();

	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth() + 1;
	const currentDay = new Date().getDate();
	
	const fetchMarkedDates = useCallback(async () => {
		const items = await databaseManagers.tasks.list();
		const filteredItems = items.filter((item) => item.type !== 'checklist');
		const tempDueDates = parseChecklistItems(filteredItems);    
		const updatedBirthdayDates = await getUpdatedBirthdayDates(currentYear);
		const dueDates = mergeDates(tempDueDates, updatedBirthdayDates);

		const newMarkedDates: Record<string, MarkedDateDetails> = {};

		Object.entries(dueDates).forEach(([date, details]) => {
			const repeatedTasks = details.tasks?.filter(task => task.type === 'repeatedTask') || [];
			const normalTasks = details.tasks?.filter(task => task.type !== 'repeatedTask') || [];
			
			const allRepeatedCompleted = repeatedTasks.length > 0 && repeatedTasks.every(task => task.completed);
			const allNormalCompleted = normalTasks.length > 0 && normalTasks.every(task => task.completed);
		
			newMarkedDates[date] = {
				...details,
				isRepeated: repeatedTasks.length > 0,
				marked: true,
				dots: [
					details.isBirthday ? { key: 'birthday', color: 'rgba(247, 92, 120, 0.6)' } : null,
					repeatedTasks.length > 0 ? { key: 'repeated', color: allRepeatedCompleted ? 'rgba(61, 247, 52, 0.5)' : 'rgba(136, 30, 217, 1)' } : null,
					normalTasks.length > 0 ? { key: 'normal', color: allNormalCompleted ? 'rgba(61, 247, 52, 0.5)' : '#CBA95F' } : null,
				].filter(Boolean) as Array<{key: string, color: string}>,
			};
		});
	
		setMarkedDates(newMarkedDates);
	}, [currentYear]);

	useEffect(() => {
		fetchMarkedDates();
	}, [fetchMarkedDates]);

	useEffect(() => {
		if (checklistUpdated) {
			fetchMarkedDates();
			resetChecklistUpdate();
		}
	}, [checklistUpdated, fetchMarkedDates, resetChecklistUpdate]);

	const updateChecklistItems = useCallback(async () => {
		if (selectedDate) {
			const startDate = `${selectedDate}T00:00:00.000Z`;
			const endDate = `${selectedDate}T23:59:59.999Z`;
			const items = await databaseManagers.tasks.listByDateRange(startDate, endDate);
			setChecklistItems(items);
		}
		fetchMarkedDates();
	}, [selectedDate, fetchMarkedDates]);

	const fetchDayItems = useCallback(async (date: string) => {
		const displayItems = await getDayItems(date, markedDates);
		const isBirthday = markedDates[date]?.isBirthday || false;
		const birthdayPerson = markedDates[date]?.name || "";
		const birthdayAge = markedDates[date]?.age ?? null;

		return {
			checklistItems: displayItems,
			birthdayDetails: { isBirthday, name: birthdayPerson, age: birthdayAge }
		};
	}, [markedDates]);

	const onDayPress = useCallback((day: any) => {
		setSelectedDate(day.dateString);
		setShowModal(true);
	}, []);

	const toggleItemCompletion = useCallback(async (id: number, completed: boolean) => {
		try {
			const newItem = {
				...checklistItems.find((item) => item.id === id),
				completed: !completed,
			}

			await databaseManagers.tasks.upsert(newItem);
			updateChecklistItems();
		} catch (error) {
			console.error('Error toggling item completion:', error);
		}
	}, [checklistItems, updateChecklistItems]);

	return (
		<>
			<Calendar
				onDayPress={onDayPress}
				firstDay={1}
				showWeekNumbers={true}
				theme={{
					...calendarTheme,
					weekVerticalMargin: 4
				}}
				style={[
					styles.calendar
				]}
				hideExtraDays={false}
				markingType="custom"
				markedDates={markedDates}
				enableSwipeMonths={true}
				dayComponent={({ date, marking }: { date?: any; marking?: any }) => (
					<CustomDay
						date={date}
						marking={marking}
						currentMonth={currentMonth}
						onPress={() => date && onDayPress(date)}
						isToday={date.month === currentMonth && date.day === currentDay}
					/>
				)}
			/>
			{showModal && (
				<ViewTaskModal
					showModal={showModal}
					setShowModal={setShowModal}
					initialDate={selectedDate}
					fetchDayItems={fetchDayItems}
					toggleItemCompletion={toggleItemCompletion}
					updateChecklistItems={updateChecklistItems}
				/>
			)}
		</>
	);
}

const getStyles = (theme: any) => StyleSheet.create({
	calendar: {
		// borderWidth: 1,
		borderColor: theme.borderColor,
		borderRadius: 8,
		color: theme.textColor,
		marginTop: 60
	},
});

export default CustomCalendar;
