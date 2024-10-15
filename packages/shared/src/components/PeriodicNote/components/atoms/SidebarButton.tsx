import React, { useRef, useEffect } from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Color from 'color';
import { useThemeStyles } from '../../../../styles/useThemeStyles';

type SidebarButtonProps = {
	sidebarVisibility: 'hidden' | 'icons' | 'extended';
	toggleSidebarVisibility: (newVisibility?: 'hidden' | 'icons' | 'extended') => void;
};

const SidebarButton: React.FC<SidebarButtonProps> = ({
	sidebarVisibility,
	toggleSidebarVisibility
}) => {
	const { themeColors } = useThemeStyles();
	const rotateAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.timing(rotateAnim, {
		toValue: sidebarVisibility === 'hidden' ? 0 : 1,
		duration: 300,
		useNativeDriver: true,
		}).start();
	}, [sidebarVisibility]);

	const translucentBackgroundColor = Color(themeColors.backgroundSecondary).alpha(0.3).toString();

	return (
		<Animated.View style={[styles.chevronButton, { backgroundColor: translucentBackgroundColor }]}>
			<Animated.View
				style={{
				transform: [{
						rotate: rotateAnim.interpolate({
						inputRange: [0, 1],
						outputRange: ['0deg', '180deg']
					})
				}]
				}}
			>
				<Pressable 
					onPress={() => toggleSidebarVisibility()}
					onLongPress={() => toggleSidebarVisibility('extended')}
				>
					<Ionicons 
						name={'chevron-back'} 
						size={28} 
						color={'gray'}
					/>
				</Pressable>
			</Animated.View>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	chevronButton: {
		position: 'absolute',
		bottom: 40,
		right: 0,
		borderTopLeftRadius: 15,
		borderBottomLeftRadius: 15,
		padding: 5,
		zIndex: 1001,
	},
});

export default SidebarButton;
