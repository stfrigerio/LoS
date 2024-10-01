import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { lightTheme, darkTheme } from './theme';

export interface TextStyles {
  title: ViewStyle;
  input: ViewStyle;
  text: TextStyle;
}

export const textStyles = (themeName: any): TextStyles => {
  const theme = themeName === 'light' ? lightTheme : darkTheme;

  return StyleSheet.create({
    title: {
      marginBottom: 10,
      textAlign: 'center',
      color: theme.textColor,
      fontSize: 20,
      fontWeight: 'bold'
    },
    text: {
      color: theme.textColor
    },
    input: {
      flexDirection: 'row',
      width: '100%',
      marginBottom: 15,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: 5,
      color: theme.textColor,
    },
  });
};