// PeriodicNote.tsx

// Libraries
import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Platform, Text, Dimensions } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@los/mobile/App';
import { startOfWeek, endOfWeek } from 'date-fns';

// Components
import TimeBox from '@los/shared/src/components/PeriodicNote/components/TimeBox'
import DateNavigation from '@los/shared/src/components/PeriodicNote/components/DateNavigation';
import DateHeader from '@los/shared/src/components/DailyNote/components/DateHeader';
import TextLists from './components/TextLists';
import TextInputs from './components/TextInputs';
import SectionSidebar from './components/SectionSidebar';
import { Ionicons } from '@expo/vector-icons'; // Ensure you have an icon library installed

import { ObjectivesSection } from './components/Sections/ObjectivesSection';
import QuantifiableSection from './components/Sections/QuantifiableSection';
import BooleanSection from './components/Sections/BooleanSection';
import MoneySection from './components/Sections/MoneySection';
import TimeSection from './components/Sections/TimeSection';
import SleepSection from './components/Sections/SleepSection';
import MobileNavbar from '../../sharedComponents/NavBar';

// Functions
import { useThemeStyles } from '../../styles/useThemeStyles';
import { useHomepage } from '../Home/helpers/useHomepage';
import { calculatePeriodTypeAndFormatDate } from './helpers/periodCalculation';
import { navigatePeriod } from './helpers/navigatePeriod';
import { 
    getLocalTimeZone, 
    parseDate, // Use UTC parsing
} from '@los/shared/src/utilities/timezoneBullshit';

let ColorfulTimeline: React.ComponentType<any>;
let GPTSection: React.ComponentType<any>;
let useColors: any
if (Platform.OS === 'web') {
	ColorfulTimeline = require('@los/desktop/src/components/DailyNote/components/ColorfulTimeline').default;
	GPTSection = require('@los/desktop/src/components/PeriodicNote/components/GPTSection').default;
	useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
	ColorfulTimeline = require('@los/mobile/src/components/DailyNote/components/ColorfulTimeline').default;
	GPTSection = require('@los/mobile/src/components/PeriodicNote/components/GPTSection').default;
	useColors = require('@los/mobile/src/components/useColors').useColors;
}

type PeriodicNoteRouteProp = RouteProp<RootStackParamList, 'periodicNote'>;

type PeriodicNoteProps = {
	route?: PeriodicNoteRouteProp;
	startDate?: string;
	endDate?: string;
};

const PeriodicNote: React.FC<PeriodicNoteProps> = ({ route, startDate: propStartDate, endDate: propEndDate }) => {
	const renderCountRef = useRef(0);
	const lastRenderTimeRef = useRef(performance.now());

	const { theme, themeColors, designs } = useThemeStyles();
	const styles = getStyles(themeColors);
	const { colors: tagColors} = useColors();
	const [isModalVisible, setIsModalVisible] = React.useState(false);
	const [error, setError] = useState<Error | null>(null);

	const { openHomepage, openCurrentWeek, openToday, openCurrentMonth  } = useHomepage();

	const [dateState, setDateState] = useState(() => {
		const timeZone = getLocalTimeZone();
		const today = new Date();
	
		let startDate = propStartDate ? parseDate(propStartDate, timeZone) : startOfWeek(today, { weekStartsOn: 1 });
		let endDate = propEndDate ? parseDate(propEndDate, timeZone) : endOfWeek(startDate, { weekStartsOn: 1 });

		// For mobile, use route params if available
		if (Platform.OS !== 'web' && route?.params?.startDate && route?.params?.endDate) {
			startDate = parseDate(route.params.startDate, timeZone);
			endDate = parseDate(route.params.endDate, timeZone);
		}
	
		const { periodType, formattedDate } = calculatePeriodTypeAndFormatDate(startDate, endDate);
		
		return { startDate, endDate, periodType, formattedDate };
	});

	// This handles the refresh of the component when navigating to different time ranges
	useEffect(() => {
		const timeZone = getLocalTimeZone();
		const today = new Date();

		let startDate = propStartDate ? parseDate(propStartDate, timeZone) : startOfWeek(today, { weekStartsOn: 1 });
		let endDate = propEndDate ? parseDate(propEndDate, timeZone) : endOfWeek(startDate, { weekStartsOn: 1 });

		// For mobile, use route params if available
		if (Platform.OS !== 'web' && route?.params?.startDate && route?.params?.endDate) {
			startDate = parseDate(route.params.startDate, timeZone);
			endDate = parseDate(route.params.endDate, timeZone);
		}

		const { periodType, formattedDate } = calculatePeriodTypeAndFormatDate(startDate, endDate);

		setDateState({ startDate, endDate, periodType, formattedDate });
		console.log('dateState updated:', { startDate, endDate, periodType, formattedDate });
	}, [propStartDate, propEndDate, route?.params?.startDate, route?.params?.endDate]);
	
	const handleNavigatePeriod = useCallback((direction: 'previous' | 'next' | 'current') => {
		const timeZone = getLocalTimeZone();
		setDateState(prevState => {
			const { newStartDate, newEndDate } = navigatePeriod(direction, prevState.periodType, prevState.startDate, prevState.endDate, timeZone);
			const { periodType, formattedDate } = calculatePeriodTypeAndFormatDate(newStartDate, newEndDate);
			return { startDate: newStartDate, endDate: newEndDate, periodType, formattedDate };
		});
	}, []);

	const sections = useMemo(() => [
		{ id: 'objectives', title: 'Objectives', icon: 'ios-bulb' },
		{ id: 'quantifiable', title: 'Quantifiable', icon: 'ios-stats-chart' },
		{ id: 'boolean', title: 'Boolean', icon: 'ios-checkmark-circle' },
		{ id: 'money', title: 'Money', icon: 'ios-cash' },
		{ id: 'time', title: 'Time', icon: 'ios-time' },
		{ id: 'sleep', title: 'Sleep', icon: 'ios-bed' },
		{ id: 'gpt', title: 'GPT Section', icon: 'ios-chatbubbles' },
		{ id: 'textLists', title: 'Text Lists', icon: 'ios-list' },
		{ id: 'textInputs', title: 'Text Inputs', icon: 'ios-create' },
	], []);
	

	const [activeSection, setActiveSection] = useState<string>('objectives');

	// Function to handle section selection from the sidebar
	const handleSectionSelect = (id: string) => {
		setActiveSection(id);
	};

	//& to see how many times this component re-renders
	// useEffect(() => {
	//   const currentTime = performance.now();
	//   const renderTime = currentTime - lastRenderTimeRef.current;
	//   console.log(`PeriodicNote render ${renderCountRef.current} took ${renderTime.toFixed(2)} ms`);
		
	//   renderCountRef.current += 1;
	//   lastRenderTimeRef.current = currentTime;

	//   return () => {
	//     // This will log the last render time when the component unmounts
	//     const unmountTime = performance.now();
	//     const finalRenderTime = unmountTime - lastRenderTimeRef.current;
	//     console.log(`PeriodicNote final render took ${finalRenderTime.toFixed(2)} ms`);
	//   };
	// });

	const navItems = useMemo(() => [
		{ label: 'Day', onPress: openToday },
		{ label: 'Week', onPress: openCurrentWeek },
		{ label: 'Month', onPress: openCurrentMonth },
	], [openToday, openCurrentWeek, openCurrentMonth]);

	const activeIndex = useMemo(() => {
		switch (dateState.periodType) {
		case 'day':
			return 0;
		case 'week':
			return 1;
		case 'month':
			return 2;
		default:
			return -1;
		}
	}, [dateState.periodType]);

	// Function to render the active section
	const renderActiveSection = () => {
		switch (activeSection) {
		case 'objectives':
			return (
			<ObjectivesSection
				isModalVisible={isModalVisible}
				setIsModalVisible={setIsModalVisible}
				currentDate={dateState.formattedDate}
			/>
			);
		case 'quantifiable':
			return (
			<QuantifiableSection
				startDate={dateState.startDate}
				endDate={dateState.endDate}
				tagColors={tagColors}
				periodType={dateState.periodType}
			/>
			);
		case 'boolean':
			if (dateState.periodType === 'week') return null; // Conditionally render based on periodType
			return (
			<BooleanSection
				startDate={dateState.startDate}
				endDate={dateState.endDate}
				periodType={dateState.periodType}
			/>
			);
		case 'money':
			return (
			<MoneySection
				startDate={dateState.startDate}
				endDate={dateState.endDate}
				tagColors={tagColors}
			/>
			);
		case 'time':
			return (
			<TimeSection
				startDate={dateState.startDate}
				endDate={dateState.endDate}
				tagColors={tagColors}
			/>
			);
		case 'sleep':
			if (dateState.periodType === 'year') return null;
			return (
			<SleepSection
				startDate={dateState.startDate}
				endDate={dateState.endDate}
				periodType={dateState.periodType}
			/>
			);
		case 'gpt':
			if (dateState.periodType !== 'week') return null;
			return (
			<GPTSection
				startDate={dateState.startDate}
				endDate={dateState.endDate}
				currentDate={dateState.formattedDate}
			/>
			);
		case 'textLists':
			if (dateState.periodType !== 'week') return null;
			return (
			<TextLists
				startDate={dateState.startDate}
				endDate={dateState.endDate}
			/>
			);
		case 'textInputs':
			return (
			<TextInputs
				periodType={dateState.periodType}
				startDate={dateState.startDate.toISOString()}
				endDate={dateState.endDate.toISOString()}
			/>
			);
		default:
			return null;
		}
	};

	const renderContent = () => {
		try {
		return (
			<>
			<View style={styles.mainContainer}>
				{/* Render Sidebar for Web */}
				{Platform.OS === 'web' && (
				<SectionSidebar
					sections={sections}
					onSectionSelect={handleSectionSelect}
					activeSection={activeSection}
				/>
				)}

				{/* Main Content Area */}
				<View style={[
				styles.contentContainer,
				Platform.OS === 'web' && { marginLeft: 200 }
				]}>
				<ScrollView style={styles.container}>
					<ColorfulTimeline title={dateState.formattedDate} />

					<View style={styles.periodNote}>
					<DateHeader
						formattedDate={dateState.formattedDate}
						periodType={dateState.periodType}
					/>
					<View style={styles.navigation}>
						<TimeBox
						startDate={dateState.startDate.toISOString()}
						endDate={dateState.endDate.toISOString()}
						currentViewType={dateState.periodType}
						/>
						<DateNavigation
						periodType={dateState.periodType}
						onNavigate={handleNavigatePeriod}
						/>
					</View>
					</View>

					{/* Render Active Section */}
					<View style={styles.activeSectionContainer}>
					{renderActiveSection()}
					</View>
				</ScrollView>
				</View>
			</View>

			{/* Render Sidebar for Mobile (e.g., as a bottom navigation or drawer) */}
			{Platform.OS !== 'web' && (
				<SectionSidebar
				sections={sections}
				onSectionSelect={handleSectionSelect}
				activeSection={activeSection}
				/>
			)}

			{/* Navbar */}
			<View style={{ height: 80 }} />
				<MobileNavbar
					items={navItems}
					activeIndex={activeIndex}
					title="Periodic Note"
					onBackPress={Platform.OS === 'web' ? openHomepage : undefined}
					screen="objectives"
					quickButtonFunction={() => setIsModalVisible(true)}
				/>
			</>
		);
		} catch (err) {
			console.error("PeriodicNote Error:", err);
			setError(err instanceof Error ? err : new Error('An unknown error occurred'));
			return null;
		}
	};

	return (
		<>
			{renderContent()}
		</>
	);
};

const getStyles = (theme: any) => {
	const { width } = Dimensions.get('window');
	const isSmall = width < 1920;
	const isDesktop = Platform.OS === 'web';

	return StyleSheet.create({
		mainContainer: {
			flex: 1,
			marginTop: isDesktop ? 0 : 37,
			position: 'relative',
		},
		container: {
			flex: 1,
			backgroundColor: theme.backgroundColor,
		},
		contentContainer: {
			flex: 1,
			backgroundColor: theme.backgroundColor,
			padding: 20,
		},
		periodNote: {
			padding: 20,
		},
		navigation: {
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 20,
		},
		centerLine: {
			position: 'absolute',
			left: '50%',
			top: 0,
			bottom: 0,
			width: 1,
			// backgroundColor: 'red', //& to see if things are centered
			zIndex: 1000,
		},
		GPTSection: {
			marginTop: 20,
			marginHorizontal: 20
		},    
		activeSectionContainer: {
			marginTop: 20,
			// Additional styling as needed
		  },
	});
};

export default PeriodicNote;