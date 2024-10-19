// SectionSidebar.tsx

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

import { useThemeStyles } from '../../../styles/useThemeStyles'; 
import Color from 'color'; 

type SidebarVisibility = 'hidden' | 'icons' | 'extended';

type SectionSidebarProps = {
	dateState: { periodType: string };
	onSectionSelect: (id: string) => void;
	activeSection: string;
	visibility: SidebarVisibility;
};

const SectionSidebar: React.FC<SectionSidebarProps> = ({
	dateState,
	onSectionSelect,
	activeSection,
	visibility,
}) => {
	const { themeColors } = useThemeStyles();

	const sidebarWidth = visibility === 'extended' ? 150 : 50; // Adjust width based on visibility
	const curveControlPoint = 10; // Adjust this to control the curve's shape

	const sections = useMemo(() => {
		const colorPalette = [
			'#6a040f', '#9d0208', '#d00000', '#dc2f02', '#e85d04',
			'#f48c06', '#faa307', '#ffba08'
		];
	
		const baseSections = [
			{ id: 'objectives', title: 'Objectives', icon: 'ios-bulb' },
			{ id: 'quantifiable', title: 'Quantifiable', icon: 'ios-stats-chart' },
			{ id: 'money', title: 'Money', icon: 'ios-cash' },
			{ id: 'time', title: 'Time', icon: 'ios-time' },
			{ id: 'gpt', title: 'GPT Section', icon: 'ios-chatbubbles' },
		];
	
		if (dateState.periodType !== 'week') {
			baseSections.splice(2, 0, { id: 'boolean', title: 'Boolean', icon: 'ios-checkmark-circle' });
		}
	
		if (['week', 'month', 'quarter'].includes(dateState.periodType)) {
			baseSections.splice(3, 0, { id: 'sleep', title: 'Sleep', icon: 'ios-bed' });
		}
	
		return baseSections.map((section, index) => ({
			...section,
			color: colorPalette[index % colorPalette.length]
		}));
	}, [dateState.periodType]);

	const itemHeight = 50; // height of each item, adjust as needed
	const totalHeight = sections.length * itemHeight;
	
	const path = `
		M${sidebarWidth},${totalHeight}
		C${sidebarWidth},${totalHeight - 10} ${sidebarWidth - 10},${totalHeight - 10} ${sidebarWidth - curveControlPoint},${totalHeight - 10}
		L${curveControlPoint},${totalHeight - 10}
		Q0,${totalHeight - 10} 0,${totalHeight - 20}
		L0,20
		Q0,10 ${curveControlPoint},10
		L${sidebarWidth - curveControlPoint},10
		C${sidebarWidth - 10},10 ${sidebarWidth},10 ${sidebarWidth},0
		Z
	`;

	const animatedWidth = React.useRef(new Animated.Value(0)).current;
	const animatedOpacity = React.useRef(new Animated.Value(0)).current;

	React.useEffect(() => {
		Animated.parallel([
			Animated.timing(animatedWidth, {
				toValue: visibility === 'hidden' ? 0 : sidebarWidth,
				duration: 300,
				useNativeDriver: false,
			}),
			Animated.timing(animatedOpacity, {
				toValue: visibility === 'hidden' ? 0 : 1,
				duration: 300,
				useNativeDriver: true,
			})
		]).start();
	}, [visibility, sidebarWidth]);
	
	if (visibility === 'hidden') {
		return null;
	}

	let translucentBackgroundColor: any;

	if (visibility !== 'extended') {
		translucentBackgroundColor = Color(themeColors.backgroundSecondary).alpha(0.4).toString();
	} else {
		translucentBackgroundColor = Color(themeColors.backgroundSecondary).alpha(0.9).toString();
	}

	return (
		<Animated.View style={[styles.sidebarContainer, { width: animatedWidth }]}>
			<Svg height={totalHeight} width={sidebarWidth} style={styles.sidebarShape}>
				<Path d={path} fill={translucentBackgroundColor} />
			</Svg>
			<Animated.View style={[styles.sidebarContent, { opacity: animatedOpacity }]}>
				{sections.map((section) => (
					<Pressable
						key={section.id}
						style={[styles.button, visibility === 'extended' && styles.extendedButton]}
						onPress={() => onSectionSelect(section.id)}
					>
						<View style={{ 
							backgroundColor: activeSection === section.id ? themeColors.backgroundSecondary : 'transparent',
							borderRadius: 10
						}}>
							{section.icon && (
								<Ionicons
									name={section.icon as any}
									size={activeSection === section.id ? 28 : 20}
									color={section.color}
								/>
							)}
						</View>
						{visibility === 'extended' && (
							<Text style={[
								styles.buttonText, 
								{ color: section.color }
							]}>
								{section.title}
							</Text>
						)}
					</Pressable>
				))}
			</Animated.View>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	sidebarContainer: {
		position: 'absolute',
		right: 0,
		// top: 240,
		bottom: 80,
		width: 50,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1000,
	},
	sidebarShape: {
		position: 'absolute',
		left: 0,
		top: 0,
	},
	sidebarContent: {
		flex: 1,
		paddingVertical: 20,
		alignItems: 'center',
	},
	button: {
		width: 30,
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 25,
		marginBottom: 15,
	},
	extendedButton: {
		flexDirection: 'row',
		width: 130,
		justifyContent: 'flex-start',
		paddingLeft: 10,
	},
	buttonText: {
		marginLeft: 10,
		fontSize: 14,
	},
});

export default SectionSidebar;