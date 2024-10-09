// PeriodicNote.tsx

// Libraries
import React, { useCallback, useState, useMemo, useRef } from 'react';
import { ScrollView, View, StyleSheet, Platform, Dimensions, Pressable, Animated } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@los/mobile/App';
import Color from 'color';

// Components
import TimeBox from '@los/shared/src/components/PeriodicNote/components/atoms/TimeBox';
import DateNavigation from '@los/shared/src/components/PeriodicNote/components/DateNavigation';
import DateHeader from '@los/shared/src/components/DailyNote/components/DateHeader';
import { SectionRenderer } from './components/SectionRenderer';
import SectionSidebar from './components/SectionSidebar';
import SidebarButton from './components/atoms/SidebarButton';

import { calculatePeriodTypeAndFormatDate } from './helpers/periodCalculation';
import { useDateState } from './helpers/useDateState';
import { useThemeStyles } from '../../styles/useThemeStyles';
import { navigatePeriod } from './helpers/navigatePeriod';
import { getLocalTimeZone } from '@los/shared/src/utilities/timezoneBullshit';

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
	const { themeColors } = useThemeStyles();
	const styles = getStyles(themeColors);
	const { colors: tagColors } = useColors();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [sidebarVisibility, setSidebarVisibility] = useState<'hidden' | 'icons' | 'extended'>('hidden');
	const [activeSection, setActiveSection] = useState<string>('objectives');

	const [dateState, setDateState] = useDateState(propStartDate, propEndDate, route?.params?.startDate, route?.params?.endDate);

	const handleNavigatePeriod = useCallback((direction: 'previous' | 'next' | 'current') => {
		const timeZone = getLocalTimeZone();
		setDateState(prevState => {
			const { newStartDate, newEndDate } = navigatePeriod(direction, prevState.periodType, prevState.startDate, prevState.endDate, timeZone);
			const { periodType, formattedDate } = calculatePeriodTypeAndFormatDate(newStartDate, newEndDate);
			return { startDate: newStartDate, endDate: newEndDate, periodType, formattedDate };
		});
	}, []);
	
	const toggleSidebarVisibility = (newVisibility?: 'hidden' | 'icons' | 'extended') => {
		setSidebarVisibility(current => newVisibility ?? (current === 'hidden' ? 'icons' : 'hidden'));
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

			<SidebarButton
				sidebarVisibility={sidebarVisibility}
				toggleSidebarVisibility={toggleSidebarVisibility}
			/>
			<SectionSidebar
				dateState={dateState}
				onSectionSelect={setActiveSection}
				activeSection={activeSection}
				visibility={sidebarVisibility}
				setSidebarVisibility={setSidebarVisibility}
			/>
		</>
	);
};

const getStyles = (theme: any) => {
	const { width } = Dimensions.get('window');
	const isSmall = width < 1920;
	const isDesktop = Platform.OS === 'web';

	const translucentBackgroundColor = Color(theme.backgroundSecondary).alpha(0.3).toString();

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
			top: 140,
			left: 0,
			backgroundColor: translucentBackgroundColor,
			borderTopRightRadius: 15,
			borderBottomRightRadius: 15,
			padding: 5,
			zIndex: 1001,
		},
	});
};

export default PeriodicNote;