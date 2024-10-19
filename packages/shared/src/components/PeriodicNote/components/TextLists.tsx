// Libraries
import React, { useCallback, useMemo, useState } from 'react';
import {
	Platform,
	View,
	Text,
	StyleSheet,
	Dimensions,
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { format, eachWeekOfInterval, isSameWeek, addDays } from 'date-fns';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { DailyTextData } from '@los/shared/src/types/TextNotes';
import Pagination from './atoms/TextPagination'; // Adjust the path as necessary

// Dynamic import based on platform
let usePeriodicData: any;
if (Platform.OS === 'web') {
	usePeriodicData = require('@los/desktop/src/components/PeriodicNote/hooks/usePeriodicData').usePeriodicData;
} else {
	usePeriodicData = require('@los/mobile/src/components/PeriodicNote/hooks/usePeriodicData').usePeriodicData;
}

// Interface for grouped weekly data
interface WeeklyData {
	weekStartDate: Date;
	weekDays: DailyTextData[];
}

interface TextListsProps {
	startDate: string | Date;
	endDate: string | Date;
}

const TextLists: React.FC<TextListsProps> = ({ startDate, endDate }) => {
	const { theme, themeColors } = useThemeStyles();
	const styles = getStyles(themeColors);
	const [activeSlide, setActiveSlide] = useState(0);
	const { width: windowWidth } = useWindowDimensions();

	const { current: { dailyTextData } } = usePeriodicData(startDate, endDate);

	// Utility to format date with day name
	const formatDateWithDay = (dateString: string) => {
		const date = new Date(dateString);
		return `${format(date, 'EEEE, MMM d')}`;
	};

	const renderWeekCard = useCallback(({ item }: { item: WeeklyData }) => (
		<View style={styles.weekCard}>
			<View style={styles.gridContainer}>
				{/* Week number card */}
				<View style={[styles.dayCard, styles.weekNumberCard]}>
					<Text style={styles.weekNumberText}>
						Week {format(item.weekStartDate, 'w')}
					</Text>
				</View>
				{item.weekDays.map((note, index) => (
					<View key={`${item.weekStartDate}-day-${index}`} style={styles.dayCard}>
						<Text style={styles.dateText}>{formatDateWithDay(note.date)}</Text>
						<View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
							<Text style={styles.label}>Success:</Text>	
							<Text style={styles.listItem}>{note.success || 'N/A'}</Text>
						</View>
						<View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
							<Text style={styles.label}>Improvement:</Text>
							<Text style={styles.listItem}>{note.beBetter || 'N/A'}</Text>
						</View>
					</View>
				))}
			</View>
		</View>
	), [styles.weekCard, styles.gridContainer, styles.dayCard, styles.dateText, styles.listItem, formatDateWithDay]);

	// Modify groupByWeek function
	const groupByWeek = useCallback((data: DailyTextData[]): WeeklyData[] => {
		const weeks: WeeklyData[] = [];
		if (data.length === 0) return weeks;

		const start = new Date(startDate);
		const end = new Date(endDate);

		// Get all week start dates in the range
		const weekStarts = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });

		weekStarts.forEach((weekStart) => {
			const weekDays: any[] = Array(7).fill(null).map((_, index) => {
				const currentDate = addDays(weekStart, index);
				const noteForDay = data.find(note => isSameWeek(new Date(note.date), weekStart, { weekStartsOn: 1 }) && 
					format(new Date(note.date), 'EEEE') === format(currentDate, 'EEEE'));
				return noteForDay || { date: format(currentDate, 'yyyy-MM-dd'), success: '', beBetter: '' };
			});

			weeks.push({
				weekStartDate: weekStart,
				weekDays,
			});
		});

		return weeks;
	}, [startDate, endDate]);

	// Modify viewMode and groupedData
	const groupedData = useMemo(() => groupByWeek(dailyTextData), [groupByWeek, dailyTextData]);

	// Modify the render section
	return (
		<View style={styles.container}>
			{groupedData.length > 0 ? (
                <>
					{groupedData.length === 1 ? (
						// Render a single week without Carousel
						renderWeekCard({ item: groupedData[0] })
					) : (
						// Render Carousel for multiple weeks
						<Carousel
							width={windowWidth - 40}
							height={650} // Adjust as needed
							data={groupedData}
							scrollAnimationDuration={1000}
							onSnapToItem={(index) => setActiveSlide(index)}
							renderItem={renderWeekCard}
							mode="parallax"
							panGestureHandlerProps={{
								activeOffsetX: [-10, 10],
							}}
						/>
					)}
					{groupedData.length > 1 && (
						<Pagination
							dotsLength={groupedData.length}
							activeDotIndex={activeSlide}
							dotStyle={styles.activeDot}
							inactiveDotStyle={styles.inactiveDot}
							containerStyle={styles.paginationContainer}
						/>
					)}
				</>
			) : (
				<Text style={styles.noDataText}>No data available for this period.</Text>
			)}
		</View>
	);
};
// Styles
const getStyles = (theme: any) => {
	const { width } = Dimensions.get('window');
	const isSmall = width < 768; // Adjust breakpoint as needed
	const isDesktop = Platform.OS === 'web';

	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.backgroundColor,
		},
		paginationContainer: {
			backgroundColor: 'transparent',
			paddingVertical: 10,
		},
		activeDot: {
			width: 10,
			height: 10,
			borderRadius: 5,
			backgroundColor: theme.textColorBold,
		},
		inactiveDot: {
			backgroundColor: theme.opaqueTextColor,
		},
		weekNumberCard: {
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: theme.backgroundColor, // Use an accent color for visibility
		},
		weekNumberText: {
			fontWeight: 'bold',
			fontSize: 16,
			color: theme.hoverColor, // Use a contrasting color
		},
		weekCard: {
			backgroundColor: theme.backgroundSecondary,
			borderRadius: 10,
			padding: 10,
			marginVertical: 10,
			shadowColor: theme.textColor,
			elevation: 5,
			alignSelf: 'center',
		},
		gridContainer: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'space-between',
		},
		dayCard: {
			backgroundColor: theme.backgroundColor,
			borderRadius: 8,
			padding: 6,
			marginBottom: 10,
			shadowColor: theme.textColor,
			elevation: 3,
			width: '48%', // Adjust this value to control card width
		},
		dateText: {
			fontWeight: 'bold',
			fontSize: 14,
			marginBottom: 10,
			color: theme.textColorBold,
		},
		listItem: {
			fontSize: 14,
			color: theme.textColor,
			marginBottom: 5,
		},
		label: {
			fontSize: 12,
			marginBottom: 5,
			color: 'gray',
		},
		noDataText: {
			textAlign: 'center',
			color: theme.opaqueTextColor,
			marginTop: 20,
			fontSize: 16,
		},
	});
};

export default TextLists;
