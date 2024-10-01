import { StyleSheet, ViewStyle } from 'react-native';
import { lightTheme, darkTheme } from './theme';
import { Platform, Dimensions } from 'react-native';

export interface ModalStyles {
  modalContainer: ViewStyle;
  modalView: ViewStyle;
  tagsDescriptionModalView: ViewStyle;
}

export const modalStyles = (themeName: 'light' | 'dark'): ModalStyles => {
  const theme = themeName === 'light' ? lightTheme : darkTheme;
  const isDektop = Platform.OS === 'web'

  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      maxHeight: '80%',
      width: isDektop ? null : '80%',  
      backgroundColor: theme.backgroundColor,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.borderColor,
      padding: 30,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      overflow: 'scroll',
    },
    tagsDescriptionModalView: {
      flex: 1,
      maxHeight: '90%',
      width: '80%',  
      backgroundColor: theme.backgroundColor,
      borderRadius: 20,
      borderWidth: 1,
      padding: 30,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  });
};