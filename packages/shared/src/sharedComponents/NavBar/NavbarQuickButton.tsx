import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
    faPlus, 
    faCommentDots, 
    faJournalWhills, 
    faUserPlus, 
    faCircleCheck, 
    faClock, 
    faBullseye, 
    faFilm, 
    faBook, 
    faGamepad, 
    faTv,
    faMusic 
} from '@fortawesome/free-solid-svg-icons';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface NavbarQuickButtonProps {
    quickButtonFunction: () => void;
    screen?: string;
}

const NavbarQuickButton: React.FC<NavbarQuickButtonProps> = ({ quickButtonFunction, screen }) => {
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);

    const iconMap = {
        mood: faCommentDots,
        journal: faJournalWhills,
        people: faUserPlus,
        tasks: faCircleCheck,
        time: faClock,
        objectives: faBullseye, 
        movie: faFilm,
        book: faBook,
        videogame: faGamepad,
        series: faTv,
        music: faMusic,
    };

    const selectedIcon = iconMap[screen as keyof typeof iconMap] || faPlus;

    return (
        <Pressable
            style={[styles.floatingButton]}
            onPress={quickButtonFunction}
        >
            <FontAwesomeIcon icon={selectedIcon} size={24} color="#1E2225" />
        </Pressable>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    floatingButton: {
        backgroundColor: '#CD535B',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
});


export default NavbarQuickButton;