import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faCheckCircle, faTag, faBuildingColumns, faBullseye } from '@fortawesome/free-solid-svg-icons';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';


type GluedQuickbuttonProps = {
    onPress: () => void;
    screen: string;
}

const GluedQuickbutton = ({ onPress, screen }: GluedQuickbuttonProps) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors, designs);

    const getIconForScreen = (screen: string) => {
        switch (screen) {
            case 'generalSettings':
                return faPlus;
            case 'defaultTagsAndDescriptions':
                return faTag;
            case 'checklist':
                return faCheckCircle;
            case 'pillars':
                return faBuildingColumns;
            case 'objectives':
                return faBullseye;
            default:
                return faPlus;
        }
    };

    const icon = getIconForScreen(screen);

    return (
        <Pressable style={styles.floatingButton} onPress={() => onPress()}>
            <FontAwesomeIcon icon={icon} color={themeColors.backgroundColor} size={24} />
        </Pressable>
    );
}

const getStyles = (theme: any, designs: any) => {
    return StyleSheet.create({
        floatingButton: {
            position: 'absolute',
            bottom: 15,
            right: 25,
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#CD535B',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            zIndex: 9999
        }
    });
}

export default GluedQuickbutton;