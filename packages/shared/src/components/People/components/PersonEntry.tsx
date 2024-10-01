import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash, faPencil, faAddressBook, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

import AddPersonModal from '@los/shared/src/components/modals/PersonModal';
import ContactsModal from '../modals/ContactsModal';

import { useThemeStyles } from '../../../styles/useThemeStyles';
import { PersonData } from '../../../types/People';
import { ContactData } from '../../../types/Contact';

interface PersonEntryProps {
    person: PersonData;
    contacts: ContactData[];
    deletePerson: (id: string) => void;
    refreshPeople: () => void;
}

const PersonEntry: React.FC<PersonEntryProps> = ({ 
    person, 
    contacts,
    deletePerson,
    refreshPeople,
}) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);
    const [isExpanded, setIsExpanded] = useState(false); // State to toggle expanded view
    const [showContacts, setShowContacts] = useState(false);

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const handleEdit = () => {
        setIsEditModalVisible(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalVisible(false);
        refreshPeople()
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Person',
            'Are you sure you want to delete this person?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', onPress: () => deletePerson(person.id) },
            ],
            { cancelable: true }
        );
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleShowContacts = () => {
        setShowContacts(!showContacts);
    };

    const personAge = moment().diff(person.birthDay, 'years');

    return (
        <View style={styles.container}>
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{`${person.name} ${person.middleName ? person.middleName + ' ' : ''}${person.lastName} ${person.aliases ? `(${person.aliases})` : ''}`}</Text>
                {isExpanded && (
                    <>
                        {person.birthDay && <Text style={styles.details}>Birthday: {person.birthDay}</Text>}
                        {person.birthDay &&personAge && <Text style={styles.details}>Age: {personAge}</Text>}
                        {person.category && <Text style={styles.details}>Category: {person.category}</Text>}
                        {person.address && <Text style={styles.details}>Address: {person.address}</Text>}
                        {person.city && <Text style={styles.details}>City: {person.city}</Text>}
                        {person.state && <Text style={styles.details}>State: {person.state}</Text>}
                        {person.country && <Text style={styles.details}>Country: {person.country}</Text>}
                        {person.pronouns && <Text style={styles.details}>Pronouns: {person.pronouns}</Text>}
                        {person.notificationEnabled && <Text style={styles.details}>Notification Enabled: {person.notificationEnabled}</Text>}
                        {person.frequencyOfContact && <Text style={styles.details}>Frequency of Contact: {person.frequencyOfContact}</Text>}
                        {person.occupation && <Text style={styles.details}>Occupation: {person.occupation}</Text>}
                        {person.email && <Text style={styles.details}>Email: {person.email}</Text>}
                        {person.phoneNumber && <Text style={styles.details}>Phone Number: {person.phoneNumber}</Text>}
                        {person.partner && <Text style={styles.details}>Partner: {person.partner}</Text>}
                        {person.likes && <Text style={styles.details}>Likes: {person.likes}</Text>}
                        {person.dislikes && <Text style={styles.details}>Dislikes: {person.dislikes}</Text>}
                        {person.description && <Text style={styles.details}>Description: {person.description}</Text>}
                    </>
                )}
            </View>
            <View style={styles.actions}>
                <Pressable onPress={handleShowContacts} style={styles.actionButton}>
                    <FontAwesomeIcon icon={faAddressBook} color={'gray'} size={20} />
                </Pressable>
                <Pressable onPress={toggleExpand} style={styles.actionButton}>
                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} color={'gray'} size={20} />
                </Pressable>
                <Pressable onPress={handleEdit} style={{ padding: 5 }}>
                    <FontAwesomeIcon icon={faPencil} color={'gray'} size={20} />
                </Pressable>
                <Pressable onPress={handleDelete} style={styles.actionButton}>
                    <FontAwesomeIcon icon={faTrash} color={'gray'} size={20} />
                </Pressable>
            </View>
            {isEditModalVisible && (
                <AddPersonModal
                    isOpen={isEditModalVisible}
                    onClose={handleCloseEditModal}
                    initialPerson={person}
                />
            )}
            {showContacts && (
                <ContactsModal
                    isVisible={showContacts}
                    onClose={() => setShowContacts(false)}
                    personName={person.name}
                    contacts={contacts}
                />
            )}
        </View>
    );
};

const getStyles = (themeColors: any, designs: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: themeColors.backgroundSecondary,
        borderRadius: 8,
        marginBottom: 10,
        padding: 12,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        ...designs.text.text,
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'serif',
    },
    details: {
        ...designs.text.text,
        color: 'gray',
        marginBottom: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: 15,
    },
    actionButton: {
        padding: 5,
    },
});

export default PersonEntry;