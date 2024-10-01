import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface NavigationButtonsProps {
  viewMode: 'table' | 'changes';
  onBack: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ viewMode, onBack }) => {
  const { themeColors } = useThemeStyles();
  const styles = getStyles(themeColors);

  if (viewMode === 'table') return null;

  return (
    <View style={styles.navigationButtons}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text>⬅️</Text>
        <Text style={styles.backButtonText}>Back to Tables</Text>
      </Pressable>
    </View>
  );
};

export default NavigationButtons;

const getStyles = (theme: any) => StyleSheet.create({
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.textColor,
    marginLeft: 5,
    fontSize: 18,
  },
});