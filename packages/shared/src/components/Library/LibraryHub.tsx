import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';

import Navbar from '@los/shared/src/sharedComponents/NavBar';
import Card from './components/Card';
import DetailedView from './components/DetailedView';

import MovieSearchModal from './modals/MovieModal';
import BookSearchModal from './modals/BookModal';
import VideoGameSearchModal from './modals/VideoGameModal'
import MusicSearchModal from './modals/MusicModal';
import SeriesSearchModal from './modals/SeriesModal';

import { useThemeStyles } from '../../styles/useThemeStyles';
import { useHomepage } from '../Home/helpers/useHomepage';

let Pager: any
let MediaList: any
let DrawerStateManager: any
if (Platform.OS === 'web') {
	Pager = require('@los/desktop/src/components/Library/components/DesktopPager').default
	MediaList = require('@los/desktop/src/components/Library/components/MediaList').default
	DrawerStateManager = null
} else {
	Pager = require('@los/mobile/src/components/Library/components/MobilePager').default
	MediaList = require('@los/mobile/src/components/Library/components/MediaList').default
	DrawerStateManager = require('@los/mobile/src/components/Contexts/DrawerState').DrawerStateManager;
}

const LibraryHub: React.FC = () => {
	const [pageIndex, setPageIndex] = useState(0); // Use pageIndex as the source of truth
	const [movieModalVisible, setMovieModalVisible] = useState(false);
	const [seriesModalVisible, setSeriesModalVisible] = useState(false);
	const [bookModalVisible, setBookModalVisible] = useState(false);
	const [videogameModalVisible, setVideogameModalVisible] = useState(false);
	const [musicModalVisible, setMusicModalVisible] = useState(false);

	const { themeColors, designs } = useThemeStyles();
	const styles = getStyles(themeColors);
	const { openHomepage } = useHomepage();

	const pagerViewRef = useRef<any>(null);

	useEffect(() => {
		if (DrawerStateManager) {
			DrawerStateManager.disableAllSwipeInteractions();
		}
	
		// Cleanup function to re-enable swipe interactions when component unmounts
		return () => {
			if (DrawerStateManager) {
				DrawerStateManager.enableAllSwipeInteractions();
			}
		};
	}, []); 

	const onPageSelected = (e: any) => {
		const newIndex = e.nativeEvent.position;
		setPageIndex(newIndex); // Update the page index based on swipe
	};

	const openMovieModal = () => setMovieModalVisible(true);
	const openSeriesModal = () => setSeriesModalVisible(true);
	const openBookModal = () => setBookModalVisible(true);
	const openVideogameModal = () => setVideogameModalVisible(true);
	const openMusicModal = () => setMusicModalVisible(true);

	const mediaTypes: Array<{
		type: 'movie' | 'series' | 'book' | 'videogame' | 'music';
		SearchModalComponent: React.ComponentType<any>;
		modalVisible: boolean;
		setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
		openModal: () => void;
	}> = [
		{ type: 'movie', SearchModalComponent: MovieSearchModal, modalVisible: movieModalVisible, setModalVisible: setMovieModalVisible, openModal: openMovieModal },
		{ type: 'series', SearchModalComponent: SeriesSearchModal, modalVisible: seriesModalVisible, setModalVisible: setSeriesModalVisible, openModal: openSeriesModal },
		{ type: 'book', SearchModalComponent: BookSearchModal, modalVisible: bookModalVisible, setModalVisible: setBookModalVisible, openModal: openBookModal },
		{ type: 'videogame', SearchModalComponent: VideoGameSearchModal, modalVisible: videogameModalVisible, setModalVisible: setVideogameModalVisible, openModal: openVideogameModal },
		{ type: 'music', SearchModalComponent: MusicSearchModal, modalVisible: musicModalVisible, setModalVisible: setMusicModalVisible, openModal: openMusicModal },
	];

	const navItems = ['Movies', 'Series', 'Books', 'Videogames', 'Music'].map((title, index) => ({
		label: title,
		onPress: () => {
			setPageIndex(index);
			pagerViewRef.current?.setPage(index);
		},
	}));

	return (
		<View style={styles.mainContainer}>
			<View style={styles.container}>
				<Pager 
					style={styles.pagerView} 
					initialPage={0} 
					onPageSelected={onPageSelected} 
					ref={pagerViewRef}
				>
					{mediaTypes.map((media, index) => (
						<View key={index}>
							<MediaList
								mediaType={media.type}
								CardComponent={Card}
								DetailedViewComponent={DetailedView}
								SearchModalComponent={media.SearchModalComponent}
								modalVisible={media.modalVisible}
								setModalVisible={media.setModalVisible}
							/>
						</View>
					))}
				</Pager>
			</View>
			<Navbar
				items={navItems}
				activeIndex={pageIndex}
				title="Library"
				onBackPress={Platform.OS === 'web' ? openHomepage : undefined}
				screen={mediaTypes[pageIndex].type}
				quickButtonFunction={mediaTypes[pageIndex].openModal}
			/>
		</View>
	);
};


export default LibraryHub;

const getStyles = (theme: any) => {
	const { width, height } = Dimensions.get('window');
	const isSmall = width < 1920;
	const isDesktop = Platform.OS === 'web';

	return StyleSheet.create({
		mainContainer: {
			marginTop: isDesktop ? 0 : 37,
			flex: 1,
			backgroundColor: theme.backgroundColor,
			height: '100%'
		},
		container: {
			flex: 1,
			backgroundColor: theme.backgroundColor,
			height: '100%',
			marginBottom: 80
		},
		button: {
			margin: 10,
			padding: 8,
			backgroundColor: theme.backgroundColor,
			borderRadius: 10,
			alignSelf: 'flex-start' 
		},
		text: {
			color: theme.textColor
		},
		pagerView: {
			flex: 1, // Ensure PagerView takes up the remaining space
		},
	});
}