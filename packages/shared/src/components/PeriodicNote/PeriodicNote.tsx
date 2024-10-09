// PeriodicNote.tsx

// Libraries
import React, { useCallback, useState, useMemo } from 'react';
import { ScrollView, View, StyleSheet, Platform, Dimensions, Pressable } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@los/mobile/App';
import { Ionicons } from '@expo/vector-icons';
import { useDateState } from './helpers/useDateState';
import { SectionRenderer } from './components/SectionRenderer';
import { useThemeStyles } from '../../styles/useThemeStyles';
import { useHomepage } from '../Home/helpers/useHomepage';
import { navigatePeriod } from './helpers/navigatePeriod';
import { getLocalTimeZone } from '@los/shared/src/utilities/timezoneBullshit';

// Components
import TimeBox from '@los/shared/src/components/PeriodicNote/components/TimeBox';
import DateNavigation from '@los/shared/src/components/PeriodicNote/components/DateNavigation';
import DateHeader from '@los/shared/src/components/DailyNote/components/DateHeader';
import SectionSidebar from './components/SectionSidebar';
import MobileNavbar from '../../sharedComponents/NavBar';
import { calculatePeriodTypeAndFormatDate } from './helpers/periodCalculation';

let ColorfulTimeline: React.ComponentType<any>;
let useColors: any;
if (Platform.OS === 'web') {
	ColorfulTimeline = require('@los/desktop/src/components/DailyNote/components/ColorfulTimeline').default;
	useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
	ColorfulTimeline = require('@los/mobile/src/components/DailyNote/components/ColorfulTimeline').default;
	useColors = require('@los/mobile/src/components/useColors').useColors;
}

type PeriodicNoteRouteProp = RouteProp<RootStackParamList, 'periodicNote'>;

type PeriodicNoteProps = {
	route?: PeriodicNoteRouteProp;
	startDate?: string;
	endDate?: string;
};

const PeriodicNote: React.FC<PeriodicNoteProps> = ({ route, startDate: propStartDate, endDate: propEndDate }) => {
	const { theme, themeColors } = useThemeStyles();
	const styles = getStyles(themeColors);
	const { colors: tagColors } = useColors();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [sidebarVisibility, setSidebarVisibility] = useState<'hidden' | 'icons' | 'extended'>('extended');
	const [activeSection, setActiveSection] = useState<string>('objectives');

	const { openHomepage, openCurrentWeek, openToday, openCurrentMonth } = useHomepage();

	const [dateState, setDateState] = useDateState(propStartDate, propEndDate, route?.params?.startDate, route?.params?.endDate);

	const handleNavigatePeriod = useCallback((direction: 'previous' | 'next' | 'current') => {
		const timeZone = getLocalTimeZone();
		setDateState(prevState => {
			const { newStartDate, newEndDate } = navigatePeriod(direction, prevState.periodType, prevState.startDate, prevState.endDate, timeZone);
			const { periodType, formattedDate } = calculatePeriodTypeAndFormatDate(newStartDate, newEndDate);
			return { startDate: newStartDate, endDate: newEndDate, periodType, formattedDate };
		});
	}, []);

	const sections = useMemo(() => {
		const baseSections = [
			{ id: 'objectives', title: 'Objectives', icon: 'ios-bulb' },
			{ id: 'quantifiable', title: 'Quantifiable', icon: 'ios-stats-chart' },
			{ id: 'money', title: 'Money', icon: 'ios-cash' },
			{ id: 'time', title: 'Time', icon: 'ios-time' },
			{ id: 'sleep', title: 'Sleep', icon: 'ios-bed' },
			{ id: 'gpt', title: 'GPT Section', icon: 'ios-chatbubbles' },
			{ id: 'text', title: 'Text', icon: 'ios-list' },
		];

		if (dateState.periodType != 'week') {
			baseSections.splice(2, 0, { id: 'boolean', title: 'Boolean', icon: 'ios-checkmark-circle' });
		}

		return baseSections;
	}, [dateState.periodType]);

	const navItems = useMemo(() => [
		{ label: 'Day', onPress: openToday },
		{ label: 'Week', onPress: openCurrentWeek },
		{ label: 'Month', onPress: openCurrentMonth },
	], [openToday, openCurrentWeek, openCurrentMonth]);

	const activeIndex = useMemo(() => {
		switch (dateState.periodType) {
			case 'day': return 0;
			case 'week': return 1;
			case 'month': return 2;
			default: return -1;
		}
	}, [dateState.periodType]);

	const toggleSidebarVisibility = () => {
		setSidebarVisibility(current => current === 'hidden' ? 'icons' : 'hidden');
	};

	const handleLongPress = () => {
		setSidebarVisibility('extended');
	};

	const handlePressOut = () => {
		setSidebarVisibility(current => current === 'extended' ? 'icons' : current);
	};

	return (
		<>
			<View style={styles.mainContainer}>
				<View style={[styles.contentContainer, Platform.OS === 'web' && { marginLeft: 200 }]}>
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

						<View style={styles.activeSectionContainer}>
							<SectionRenderer
								activeSection={activeSection}
								dateState={dateState}
								isModalVisible={isModalVisible}
								setIsModalVisible={setIsModalVisible}
								tagColors={tagColors}
							/>
						</View>
					</ScrollView>
				</View>
			</View>

			<Pressable 
				onPress={toggleSidebarVisibility}
				onLongPress={handleLongPress}
				onPressOut={handlePressOut}
				style={styles.chevronButton}
			>
				<Ionicons 
					name={sidebarVisibility === 'hidden' ? 'chevron-forward' : 'chevron-back'} 
					size={24} 
					color={themeColors.text}
				/>
			</Pressable>
			<SectionSidebar
				sections={sections}
				onSectionSelect={setActiveSection}
				activeSection={activeSection}
				visibility={sidebarVisibility}
			/>

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
		activeSectionContainer: {
			marginTop: 20,
		},
		chevronButton: {
			position: 'absolute',
			bottom: 160,
			left: 0,
			backgroundColor: theme.backgroundSecondary,
			borderTopRightRadius: 15,
			borderBottomRightRadius: 15,
			padding: 5,
			zIndex: 1001,
		},
	});
};

export default PeriodicNote;