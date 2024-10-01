import { StyleSheet } from 'react-native';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

export const getStyles = (themeName: any) => {
    const { themeColors } = useThemeStyles();
    return StyleSheet.create({
        MorningContainer: {
            padding: 15,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderRadius: 25,
            marginTop: 10,
            borderColor: themeColors.borderColor
        },
        EveningContainer: {
            padding: 15,
            borderBottomWidth: 1,
            borderRadius: 25,
            marginTop: 10,
            marginBottom: 20,
            borderColor: themeColors.borderColor
        },
        inputGroup: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 5,
        },
        label: {
            width: 120,
            color: themeColors.textColor
        },
        input: {
            borderWidth: 1,
            borderColor: themeColors.borderColor,
            borderRadius: 5,
            padding: 5,
            flex: 1,
            marginLeft: 10,
            color: themeColors.textColor
        },
        timeInputContainer: {
            flexDirection: 'column',
        },
        timeInputWrapper: {
            position: 'relative',
        },
        timePickerWrapper: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        },
    });
}