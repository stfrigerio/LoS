import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { UniversalModal } from '../../sharedComponents/UniversalModal'; // Adjust the import path as needed
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface AlertModalProps {
    isVisible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
    isVisible,
    title,
    message,
    onConfirm,
    onCancel,
}) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);

    return (
        <UniversalModal isVisible={isVisible} onClose={onCancel} modalViewStyle='default'>
                <Text style={styles.modalTitle}>{title}</Text>
                <Text style={styles.modalText}>{message}</Text>
                <View style={styles.buttonContainer}>
                    <Pressable style={[styles.button, styles.buttonCancel]} onPress={onCancel}>
                        <Text style={styles.textStyle}>Cancel</Text>
                    </Pressable>
                    <Pressable style={[styles.button, styles.buttonConfirm]} onPress={onConfirm}>
                        <Text style={styles.textStyle}>OK</Text>
                    </Pressable>
                </View>
        </UniversalModal>
    );
};

const getStyles = (themeColors: any, designs: any) => StyleSheet.create({
    modalTitle: {
        ...designs.text.title,
        marginBottom: 15,
        textAlign: 'center',
    },
    modalText: {
        ...designs.text.text,
        marginBottom: 15,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        minWidth: 100,
    },
    buttonCancel: {
        backgroundColor: themeColors.redOpacity,
    },
    buttonConfirm: {
        backgroundColor: themeColors.greenOpacity,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default AlertModal;