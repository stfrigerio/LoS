import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Platform } from 'react-native';

import EnhancedTextInput from '@los/shared/src/components/@/EnhancedTextInput';
import createTimePicker from '@los/shared/src/sharedComponents/DateTimePicker';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

let useContactModal: any;
if (Platform.OS === 'web') {
    useContactModal = null; //todo Replace with actual import for web
} else {
    useContactModal = require('@los/mobile/src/components/modals/useContactModal').useContactModal;
}

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);
    const { showPicker } = createTimePicker();

    const {
        contact,
        selectedPerson,
        handleDateChange,
        handlePersonSelected,
        handleSave,
    } = useContactModal(onClose);

    const showDatePicker = () => {
        showPicker({
            mode: 'date',
            value: new Date(contact.dateOfContact),
            is24Hour: true,
        }, (selectedDate) => {
            if (selectedDate) {
                handleDateChange(selectedDate);
            }
        });
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isOpen}
            onRequestClose={onClose}
        >
            <Pressable
                style={designs.modal.modalContainer}
                onPressOut={() => onClose()}
            >
                <View style={designs.modal.modalView} onStartShouldSetResponder={() => true} onTouchEnd={(e) => e.stopPropagation()}>
                    <Text style={[designs.text.title, { marginBottom: 30 }]}>🗣️ Add Contact</Text>

                    <View style={{ width: '100%', height: 120 }}>
                        <EnhancedTextInput
                            style={[styles.input, { minHeight: 50 }]}
                            placeholder="Type @ to search"
                            placeholderTextColor='#808080'
                            onMentionAdded={handlePersonSelected}
                            value={selectedPerson ? selectedPerson.name : ''}
                        />
                    </View>

                    <View style={styles.datePickerContainer}>
                        <Text style={{ color: 'gray' }}>Date of Contact:</Text>
                        <Pressable onPress={showDatePicker}>
                            <Text style={designs.text.text}>{new Date(contact.dateOfContact).toLocaleDateString()}</Text>
                        </Pressable>
                    </View>

                    <Pressable onPress={() => handleSave().catch((error: any) => alert(error.message))} style={[designs.button.marzoPrimary, { width: '100%' }]}>
                        <Text style={designs.button.buttonText}>Save Contact</Text>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    datePickerContainer: {
        marginTop: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    dateLabel: {
        marginRight: 10,
    },
    input: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 5,
        padding: 12,
        borderWidth: 1,
        borderColor: theme.borderColor,
        borderRadius: 5,
        color: theme.textColor,
        fontFamily: 'serif',
    },
});

export default ContactModal;