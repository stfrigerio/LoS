// SectionSidebar.tsx

import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

import { useThemeStyles } from '../../../styles/useThemeStyles'; 
import Color from 'color'; 

type SidebarVisibility = 'hidden' | 'icons' | 'extended';

type SectionSidebarProps = {
	sections: { id: string; title: string; icon?: string }[];
	onSectionSelect: (id: string) => void;
	activeSection: string;
	visibility: SidebarVisibility;
};

const SectionSidebar: React.FC<SectionSidebarProps> = ({ sections, onSectionSelect, activeSection, visibility }) => {
	const { themeColors } = useThemeStyles();
	let { height } = Dimensions.get('window');
	height = height - 300;

	const sidebarWidth = visibility === 'extended' ? 150 : 50; // Adjust width based on visibility
	const curveControlPoint = 10; // Adjust this to control the curve's shape

	const path = `
		M0,${height}
		C0,${height - 10} 10,${height - 10} ${curveControlPoint},${height - 10}
		L${sidebarWidth - curveControlPoint},${height - 10}
		Q${sidebarWidth},${height - 10} ${sidebarWidth},${height - 20}
		L${sidebarWidth},20
		Q${sidebarWidth},10 ${sidebarWidth - curveControlPoint},10
		L${curveControlPoint},10
		C10,10 0,10 0,0
		Z
	`;

	const animatedWidth = React.useRef(new Animated.Value(0)).current;

	React.useEffect(() => {
		Animated.timing(animatedWidth, {
			toValue: visibility === 'hidden' ? 0 : sidebarWidth,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [visibility, sidebarWidth]);
	
	if (visibility === 'hidden') {
		return null;
	}

	const translucentBackgroundColor = Color(themeColors.backgroundSecondary).alpha(0.4).toString();

	return (
		<Animated.View style={[styles.sidebarContainer, { width: animatedWidth }]}>
			<Svg height={height} width={sidebarWidth} style={styles.sidebarShape}>
				<Path d={path} fill={translucentBackgroundColor} />
			</Svg>
			<View style={styles.sidebarContent}>
				{sections.map((section) => (
					<Pressable
						key={section.id}
						style={[styles.button, visibility === 'extended' && styles.extendedButton]}
						onPress={() => onSectionSelect(section.id)}
					>
						{section.icon && (
							<Ionicons
								name={section.icon as any}
								size={24}
								color={activeSection === section.id ? themeColors.hoverColor : 'black'}
							/>
						)}
						{visibility === 'extended' && (
							<Text style={[
								styles.buttonText, 
								{ color: activeSection === section.id ? themeColors.hoverColor : 'black' }
							]}>
								{section.title}
							</Text>
						)}
					</Pressable>
				))}
			</View>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	sidebarContainer: {
		position: 'absolute',
		left: 0,
		top: 140,
		bottom: 0,
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
		marginTop: 20,
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