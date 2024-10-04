import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { UserSettingData } from '../../../../types/UserSettings';

let useColors;
if (Platform.OS === 'web') {
	useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
	useColors = require('@los/mobile/src/components/useColors').useColors;
}

interface LegendProps {
	habits: string[];
	userSettings: UserSettingData[];
	toggleHabit: (habit: string) => void;
	activeHabits: string[];
}

const Legend: React.FC<LegendProps> = ({ habits, userSettings, toggleHabit, activeHabits }) => {
	const { colors: tagColors } = useColors();

	const getEmoji = (habit: string) => {
		if (!userSettings || !Array.isArray(userSettings)) {
			return '📊';
		}
		const setting = userSettings.find(s => s.settingKey === habit);
		return setting ? setting.value : '📊'; // Default emoji if not found
	};

	const getColor = (habit: string) => {
		return tagColors[habit] || '#FFFFFF'; // Default color if not found
	};

	return (
		<View style={styles.legendContainer}>
			{habits.map((habit) => (
				<Pressable
					key={habit}
					style={[
						styles.legendItem,
						!activeHabits.includes(habit) && styles.inactiveItem
					]}
					onPress={() => toggleHabit(habit)}
				>
					<View style={[styles.legendColor, { backgroundColor: getColor(habit) }]} />
					<Text style={[styles.legendText]}>
						{getEmoji(habit)}
					</Text>
				</Pressable>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	legendContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		marginTop: 10,
	},
	legendItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 10,
		marginBottom: 5,
		padding: 5,
	},
	inactiveItem: {
		opacity: 0.5,
	},
	legendColor: {
		width: 10,
		height: 10,
		marginRight: 5,
		borderRadius: 10
	},
	legendText: {
		fontSize: 12,
	},
});

export default Legend;