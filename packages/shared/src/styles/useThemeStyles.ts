import { useTheme } from '@los/shared/src/styles/ThemeContext';
import { lightTheme, darkTheme, markdownStyles as createMarkdownStyles } from '@los/shared/src/styles/theme';
import { buttonStyles, ButtonStyles } from '@los/shared/src/styles/button';
import { modalStyles, ModalStyles } from '@los/shared/src/styles/modal';
import { textStyles, TextStyles } from '@los/shared/src/styles/text';
import { StyleSheet, TextStyle } from 'react-native';

type StylesType = {
  button: ButtonStyles;
  modal: ModalStyles;
  text: TextStyles;
};

type MarkdownStylesType = {
  body: TextStyle;
  heading1: TextStyle;
  heading2: TextStyle;
};

export const useThemeStyles = () => {
  const themeContext = useTheme();
  const theme = themeContext?.theme || 'dark';
  const isDark = theme === 'dark';
  const themeColors = isDark ? darkTheme : lightTheme;

  const designs: StylesType = {
    button: buttonStyles(isDark ? 'dark' : 'light'),
    modal: modalStyles(isDark ? 'dark' : 'light'),
    text: textStyles(isDark ? 'dark' : 'light'),
  };

  const markdownStyles = StyleSheet.create<MarkdownStylesType>(
    createMarkdownStyles(themeColors) as MarkdownStylesType
  );
  
  return {
    theme,
    themeColors,
    designs,
    markdownStyles
  };
};
