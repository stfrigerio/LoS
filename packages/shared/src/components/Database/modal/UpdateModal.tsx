import React, { useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Modal, Dimensions } from 'react-native';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface UpdateModalProps {
  isVisible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
  type: string;
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  isVisible,
  value,
  onChangeText,
  onSave,
  onCancel,
  type,
}) => {
  const { themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);

  const handleModalPress = (e: any) => {
    e.stopPropagation();
  };

  const handleTextInputFocus = () => {
  };

  const handleTextInputBlur = () => {
  };

  const handleSavePress = () => {
    onSave();
  };

  const handleCancelPress = () => {
    onCancel();
  };

  return (
    <Modal 
      visible={isVisible} 
      transparent={true} 
      animationType="fade"
      onRequestClose={() => {
        onCancel();
      }}
    >
      <View style={[designs.modal.modalContainer]}>
        <Pressable style={designs.modal.modalView} onPress={handleModalPress}>
          <TextInput
            value={value}
            onChangeText={(text) => {
              onChangeText(text);
            }}
            keyboardType={type === 'number' ? 'numeric' : 'default'}
            style={styles.input}
            multiline={true}
            autoFocus={true}
            onFocus={handleTextInputFocus}
            onBlur={handleTextInputBlur}
          />
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, designs.button.marzoSecondary]} onPress={handleSavePress}>
              <Text style={designs.button.buttonText}>Save</Text>
            </Pressable>
            <Pressable style={[styles.button, designs.button.marzoPrimary]} onPress={handleCancelPress}>
              <Text style={designs.button.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any) => {
  const { width, height } = Dimensions.get('window');
  const isDesktop = width > 768;

  return StyleSheet.create({
    modalContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalView: {
      width: isDesktop ? '50%' : '90%',
      maxWidth: 600,
      maxHeight: isDesktop ? '80%' : '90%',
    },
    input: {
      width: '100%',
      minHeight: isDesktop ? 250 : 100,
      maxHeight: isDesktop ? 500 : 300,
      borderColor: theme.borderColor,
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      marginBottom: 20,
      color: theme.textColor,
      fontSize: 16,
    },
    button: {
      maxWidth: isDesktop ? '50%' : '100%',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });
};

export default UpdateModal;