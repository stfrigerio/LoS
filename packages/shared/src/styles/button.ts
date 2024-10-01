import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { lightTheme, darkTheme } from './theme';

export interface ButtonStyles {
  homepage: ViewStyle;
  primaryButton: ViewStyle;
  marzoPrimary: ViewStyle;
  marzoSecondary: ViewStyle;
  buttonText: TextStyle;
  buttonDefaultText: TextStyle;
}

export const buttonStyles = (themeName: any): ButtonStyles => {
  const theme = themeName === 'light' ? lightTheme : darkTheme;

  return StyleSheet.create({
    homepage: {
      margin: 10,
      padding: 10,
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.borderColor,
      borderRadius: 10,
    },
    primaryButton: {
      margin: 10,
      padding: 10,
      backgroundColor: theme.backgroundColor,
      borderWidth: 2,
      borderColor: theme.borderColor,
      borderRadius: 10,
      alignItems: 'center',
    },
    marzoPrimary: {
      margin: 10,
      padding: 10,
      backgroundColor: '#CC5359',
      borderWidth: 2,
      borderColor: theme.borderColor,
      borderRadius: 10,
    },
    marzoSecondary: {
      margin: 10,
      padding: 10,
      backgroundColor: '#D3C7B1',
      borderWidth: 2,
      borderColor: theme.borderColor,
      borderRadius: 10,
    },
    buttonText: {
      color: '#1E2225',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold'
    },
    buttonDefaultText: {
      color: theme.textColor,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold'
    }
  });
};