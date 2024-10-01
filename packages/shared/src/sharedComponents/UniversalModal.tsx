import React from 'react';
import { View, Modal as RNModal, Platform, Pressable, Text, ScrollView } from 'react-native';
import ReactModal from 'react-modal';
import { modalStyles } from '../styles/modal';
import { useThemeStyles } from '../styles/useThemeStyles';

interface UniversalModalProps {
    isVisible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    modalViewStyle?: string;
    hideCloseButton?: boolean;
}

export const UniversalModal: React.FC<UniversalModalProps> = ({
    isVisible,
    onClose,
    children,
    modalViewStyle,
    hideCloseButton = false
}) => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = modalStyles(theme);

    const CloseButton = () => (
        !hideCloseButton && (
            <Pressable style={{ position: 'absolute', top: 10, right: 10, padding: 10, zIndex: 1 }} onPress={onClose}>
                <Text style={{ fontSize: 20, color: 'gray'}}>✕</Text>
            </Pressable>
        )
    );

    if (Platform.OS === 'web') {
        const webStyles = {
            overlay: {
                backgroundColor: modalViewStyle === 'dateTimePicker' ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
                position: 'absolute' as const,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            },
            content: modalViewStyle === 'dateTimePicker' ? 
                {
                    position: 'absolute' as const,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column' as const,
                    alignItems: 'center',
                    justifyContent: 'center',
                }
            : 
                modalViewStyle === 'taller' ? {
                    position: 'absolute' as const,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    borderWidth: 1,
                    borderColor: themeColors.borderColor,
                    padding: 30,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    backgroundColor: themeColors.backgroundColor,
                    borderRadius: 20,
                    maxWidth: '20%',
                    maxHeight: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column' as const,
                    alignItems: 'center',
                    justifyContent: 'center',
                } 
            : {
                position: 'absolute' as const,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                borderWidth: 1,
                borderColor: themeColors.borderColor,
                padding: 30,
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                backgroundColor: themeColors.backgroundColor,
                borderRadius: 20,
                maxWidth: '20%',
                maxHeight: '30%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
            }
        };
    
        return (
            <ReactModal
                isOpen={isVisible}
                onRequestClose={onClose}
                style={webStyles as ReactModal.Styles}
                ariaHideApp={false}
                shouldCloseOnOverlayClick={true}
            >
                {modalViewStyle === 'dateTimePicker' ? null : <CloseButton />}
                {children}
            </ReactModal>
        );
    }

    return (
        <RNModal
            visible={isVisible}
            transparent={true}
            onRequestClose={onClose}
            animationType="fade"
        >
            <Pressable style={
                [
                    styles.modalContainer, 
                    { 
                        // borderWidth: 1, 
                        // borderColor: 'red' 
                    }
                ]} 
                onPress={onClose}
            >
                {/* 
                    This pressable down below is my own way to stop the 
                    interaction with the pressable up top. It's not perfect,
                    maybe some touches in the scrollview will be detected as this 
                    pressable's tap, but who cares. Before it was a View with 
                    onStartShouldSetResponder and onResponderRelease, but that
                    made the ScrollView not respond properly.
                */}
                <Pressable style={
                    [
                        styles.modalView, 
                        { 
                            // borderWidth: 1, 
                            // borderColor: 'blue' 
                        }
                    ]} 
                    // onStartShouldSetResponder={() => true} 
                    // onResponderRelease={(e) => e.stopPropagation()}
                >
                    <CloseButton />
                    <ScrollView 
                        contentContainerStyle={{ flexGrow: 1 }}
                        style={
                            { 
                                width: '100%', 
                                // borderWidth: 1, 
                                // borderColor: 'green',
                                // padding: 20 
                            }
                    }>
                        {children}
                    </ScrollView>
                </Pressable>
            </Pressable>
        </RNModal>
    );
};
