// Pagination.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PaginationProps {
	dotsLength: number;
	activeDotIndex: number;
	dotStyle: object;
	inactiveDotStyle: object;
	containerStyle?: object;
}

const Pagination: React.FC<PaginationProps> = ({
	dotsLength,
	activeDotIndex,
	dotStyle,
	inactiveDotStyle,
	containerStyle,
}) => {
	return (
		<View style={[styles.container, containerStyle]}>
			{Array.from({ length: dotsLength }).map((_, index) => (
				<View
					key={`pagination-dot-${index}`}
					style={[
						styles.dot,
						index === activeDotIndex ? dotStyle : inactiveDotStyle,
					]}
				/>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 10,
	},
	dot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginHorizontal: 5,
	},
});

export default Pagination;
