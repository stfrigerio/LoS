import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface ActionButtonsProps {
  isConfirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ isConfirming, onConfirm, onCancel }) => {
  const { themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);

  return (
    <View style={styles.actionButtons}>
      <Pressable 
        style={[designs.button.marzoPrimary, isConfirming && styles.disabledButton]} 
        onPress={onConfirm}
        disabled={isConfirming}
      >
        {isConfirming ? (
          <ActivityIndicator color={themeColors.text} />
        ) : (
          <Text style={designs.button.buttonText}>Confirm Sync</Text>
        )}
      </Pressable>
      <Pressable style={designs.button.marzoSecondary} onPress={onCancel}>
        <Text style={designs.button.buttonText}>Cancel</Text>
      </Pressable>
    </View>
  );
};

export default ActionButtons;

const getStyles = (theme: any) => StyleSheet.create({
    disabledButton: {
        opacity: 0.5,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});