import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarDay, faCalendarWeek, faCalendar, faChartPie } from '@fortawesome/free-solid-svg-icons';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { ChartToggleProps } from '../types/types';

const ChartToggle: React.FC<ChartToggleProps> = ({ 
	availableViewTypes, 
	viewType, 
	setViewType, 
}) => {
	const { themeColors } = useThemeStyles();
	const styles = getStyles(themeColors);

	return (
		<View style={styles.chartToggle}>
			{availableViewTypes.map((type) => (
				<Pressable
					key={type}
					style={[styles.chartButton]}
					onPress={() => setViewType(type)}
				>
					<FontAwesomeIcon 
						icon={
							type === 'daily' ? faCalendarDay :
							type === 'weekly' ? faCalendarWeek :
							type === 'monthly' ? faCalendar :
							faChartPie
						}
						color={viewType === type ? themeColors.hoverColor : themeColors.textColor}
					/>
					<Text style={[styles.chartButtonText, viewType === type && styles.activeChartButtonText]}>
						{type.charAt(0).toUpperCase() + type.slice(1)}
					</Text>
				</Pressable>
			))}
		</View>
	);
};

const getStyles = (theme: any) => {
	const { width } = Dimensions.get('window');
	const isDesktop = width > 768;

	return StyleSheet.create({
		chartToggle: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'center',
			marginBottom: 10,
			marginLeft: 10
		},
		chartButton: {
			flexDirection: 'row',
			alignItems: 'center',
			padding: 8,
			borderRadius: 5,
			// borderWidth: 1
		},
		chartButtonText: {
			marginLeft: 10,
			fontSize: 12,
			color: theme.textColor
		},
		activeChartButtonText: {
			color: 'gray',
		},
	});
};

export default ChartToggle;