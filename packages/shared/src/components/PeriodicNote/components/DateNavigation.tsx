import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';

import { useThemeStyles } from '../../../styles/useThemeStyles';

interface DateNavigationProps {
	periodType: string;
	onNavigate: (direction: 'previous' | 'next' | 'current') => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({ onNavigate }) => {
	const { themeColors } = useThemeStyles();
	const styles = getStyles(themeColors);

	return (
		<View style={styles.container}>
			<Pressable style={styles.button} onPress={() => onNavigate('previous')}>
				<Ionicons name="chevron-back" size={24} color={'gray'} />
			</Pressable>
			<Pressable style={styles.button} onPress={() => onNavigate('current')}>
				<Entypo name="address" size={24} color={'gray'} />
			</Pressable>
			<Pressable style={styles.button} onPress={() => onNavigate('next')}>
				<Ionicons name="chevron-forward" size={24} color={'gray'} />
			</Pressable>
		</View>
	);
};  

const getStyles = (themeColors: any) => StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 10,
	},
	button: {
		padding: 10,
		marginHorizontal: 10,
	},
});

export default DateNavigation;