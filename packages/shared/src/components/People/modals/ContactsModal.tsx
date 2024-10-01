import React from 'react';
import { View, Text, Modal, ScrollView, Pressable, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

import { ContactData } from '../../../types/Contact';
import { useThemeStyles } from '../../../styles/useThemeStyles';

interface ContactsModalProps {
    isVisible: boolean;
    onClose: () => void;
    personName: string;
    contacts: ContactData[];
}

const ContactsModal: React.FC<ContactsModalProps> = ({ isVisible, onClose, personName, contacts }) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={designs.modal.modalContainer}>
                <View style={designs.modal.modalView}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Contacts for {personName}</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <FontAwesomeIcon icon={faTimes} color={themeColors.textColor} size={20} />
                        </Pressable>
                    </View>
                    <ScrollView style={{ width: '100%' }}>
                        {contacts.length > 0 ? (
                            contacts.map((contact, index) => (
                                <View key={index} style={styles.contactItem}>
                                    <Text style={styles.contactDate}>
                                        {moment(contact.dateOfContact).format('MMMM D, YYYY')}
                                    </Text>
                                    <Text style={styles.contactSource}> - {contact.source}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noContacts}>No contacts recorded</Text>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const getStyles = (themeColors: any, designs: any) => StyleSheet.create({
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
    },
    modalTitle: {
        ...designs.text.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    contactItem: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.borderColor,
        paddingBottom: 10,
        flexDirection: 'row',
    },
    contactDate: {
        ...designs.text.text,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    contactSource: {
        ...designs.text.text,
        marginBottom: 5,
        color: 'gray'
    },
    contactNotes: {
        ...designs.text.text,
        fontStyle: 'italic',
    },
    noContacts: {
        ...designs.text.text,
        textAlign: 'center',
        marginTop: 20,
    },
});



export default ContactsModal;