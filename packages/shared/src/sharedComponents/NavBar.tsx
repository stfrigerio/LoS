import React from 'react';
import { View, StyleSheet, Pressable, Dimensions, Platform, Animated } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';    
import { faChevronLeft, faSliders } from '@fortawesome/free-solid-svg-icons';

import DrawerContent from './NavBar/DrawerContent';
import { useNavbarDrawer } from '@los/shared/src/components/Contexts/NavbarContext';
import DrawerIcon from './NavBar/DrawerIcon';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import NavbarQuickButton from './NavBar/NavbarQuickButton';

import { MobileNavbarProps } from './NavBar/NavbarTypes';

const MobileNavbar: React.FC<MobileNavbarProps> = ({ 
    items, 
    activeIndex, 
    title, 
    onBackPress,
    showFilter = false,
    onFilterPress,
    quickButtonFunction,
    screen,
}) => {
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);
    const { slideAnim } = useNavbarDrawer();

    return (
        <>
            <Animated.View style={[styles.navbarContent, { transform: [{ translateY: slideAnim }] }]}>
                {items.length > 0 && (
                    <>
                        <DrawerIcon />
                        <DrawerContent items={items} activeIndex={activeIndex} />
                    </>
                )}
                {Platform.OS === 'web' && onBackPress && (
                    <Pressable style={styles.backIconWrapper} onPress={onBackPress}>
                        <FontAwesomeIcon icon={faChevronLeft} color={'gray'} />
                    </Pressable>
                )}
                {showFilter && (
                    <Pressable style={styles.filterIconWrapper} onPress={onFilterPress}>
                        <FontAwesomeIcon icon={faSliders} color={'gray'} size={24} />
                    </Pressable>
                )}
                {quickButtonFunction && (
                    <View style={styles.quickButtonContainer}>
                        <NavbarQuickButton quickButtonFunction={quickButtonFunction} screen={screen} />
                    </View>
                )}
            </Animated.View>
            <Animated.View style={[styles.coverUp, { transform: [{ translateY: slideAnim }] }]} />
        </>
    );
};

const getStyles = (theme: any) => {
    const { width, height } = Dimensions.get('window');

    return StyleSheet.create({
        navbarContent: {
            height: 70,
            borderTopWidth: 1,
            borderTopColor: theme.textColor,
            backgroundColor: theme.backgroundColor,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 0,
            position: 'absolute',
            bottom: 10,
            left: 0,
            right: 0,
            zIndex: 200,
        },
        backIconWrapper: {
            width: 60,
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1002,
        },
        filterIconWrapper: {
            position: 'absolute',
            right: 100,
            width: 60,
            height: 60,
            bottom: 1,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1002,
        },
        quickButtonContainer: {
            position: 'absolute',
            width: 60,
            height: 60,
            // borderWidth: 1,
            // borderColor: 'gray',
            justifyContent: 'center',
            right: 15,
            bottom: 0, 
        },
        coverUp: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 10,
            backgroundColor: theme.backgroundColor,
        },
    });
};

export default MobileNavbar;