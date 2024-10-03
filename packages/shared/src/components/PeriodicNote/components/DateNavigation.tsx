import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';

import { useThemeStyles } from '../../../styles/useThemeStyles';

interface DateNavigationProps {
	periodType: string;
	onNavigate: (direction: 'previous' | 'next' | 'current') => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({ periodType, onNavigate }) => {
	const { themeColors } = useThemeStyles();
	const styles = getStyles(themeColors);

	const getPeriodLabel = () => {
		switch (periodType.toLowerCase()) {
			case 'day':
				return { previous: 'Previous Day', current: 'Today', next: 'Next Day' };
			case 'week':
				return { previous: 'Previous Week', current: 'This Week', next: 'Next Week' };
			case 'month':
				return { previous: 'Previous Month', current: 'This Month', next: 'Next Month' };
			default:
				return { previous: 'Previous', current: 'Current', next: 'Next' };
		}
	};

	const labels = getPeriodLabel();

	return (
		<>
			<View style={styles.container}>
				<Pressable style={styles.button} onPress={() => onNavigate('previous')}>
					<Text style={styles.buttonText}>{labels.previous}</Text>
				</Pressable>
				<View style={{marginHorizontal: 15}}/>
				<Pressable style={styles.button} onPress={() => onNavigate('next')}>
					<Text style={styles.buttonText}>{labels.next}</Text>
				</Pressable>
			</View>
			<View style={{marginHorizontal: 15}}>
				<Pressable 
					style={styles.button} 
					onPress={() => {
						onNavigate('current');
					}}
				>
					<Text style={styles.buttonText}>{labels.current}</Text>
				</Pressable>
			</View>
		</>
	);
};  

const getStyles = (themeColors: any) => StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 10,
	},
	button: {
		backgroundColor: 'transparent',
		paddingBottom: 8,
	},
	buttonText: {
		color: 'gray',
		fontFamily: 'serif',
		fontSize: 16,
		lineHeight: 24,
	},
	arrow: {
		marginHorizontal: 5,
	},
});

export default DateNavigation;