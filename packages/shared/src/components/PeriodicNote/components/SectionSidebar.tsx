// SectionSidebar.tsx

import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useThemeStyles } from '../../../styles/useThemeStyles'; // Adjust the import path as necessary

type SectionSidebarProps = {
	sections: { id: string; title: string; icon?: string }[];
	onSectionSelect: (id: string) => void;
	activeSection: string;
};

const SectionSidebar: React.FC<SectionSidebarProps> = ({ sections, onSectionSelect, activeSection }) => {
	const { themeColors } = useThemeStyles();
	let { height } = Dimensions.get('window');
	height = height - 240;

	const sidebarWidth = 50;
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

	return (
		<View style={styles.sidebarContainer}>
			<Svg height={height} width={sidebarWidth} style={styles.sidebarShape}>
				<Path d={path} fill={themeColors.backgroundSecondary} />
			</Svg>
			<View style={styles.sidebarContent}>
				{sections.map((section) => (
					<Pressable
						key={section.id}
						style={[
							styles.button,
						]}
						onPress={() => onSectionSelect(section.id)}
					>
						{section.icon && (
						<Ionicons
							name={section.icon as any}
							size={24}
							color={activeSection === section.id ? themeColors.hoverColor : 'black'}
						/>
						)}
					</Pressable>
				))}
			</View>
		</View>
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
});

export default SectionSidebar;