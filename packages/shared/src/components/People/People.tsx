import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Platform, Switch, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

import PersonEntry from './components/PersonEntry';
import MobileNavbar from '@los/shared/src/sharedComponents/NavBar';
import AddPersonModal from '@los/shared/src/components/modals/PersonModal';
import PeopleNetworkChart from '@los/shared/src/components/Charts/PeopleNetworkChart/PeopleNetworkChart';
import AnimatedPeopleNetworkChart from '@los/shared/src/components/Charts/PeopleNetworkChart/AnimatedPeopleNetworkChart';

import { useThemeStyles } from '../../styles/useThemeStyles';
import { useHomepage } from '../Home/helpers/useHomepage';

import { PersonData } from '../../types/People';
import { ContactData } from '../../types/Contact';

let usePeopleData: any;
let useContactData: any;
if (Platform.OS === 'web') {
    const { usePeopleData: webUsePeopleData } = require('@los/desktop/src/components/People/hooks/usePeopleData');
    usePeopleData = webUsePeopleData;
    const { useContactData: webUseContactData } = require('@los/desktop/src/components/People/hooks/useContactData');
    useContactData = webUseContactData;
} else {
    const { usePeopleData: mobileUsePeopleData } = require('@los/mobile/src/components/People/hooks/usePeopleData');
    usePeopleData = mobileUsePeopleData;
    const { useContactData: mobileUseContactData } = require('@los/mobile/src/components/People/hooks/useContactData');
    useContactData = mobileUseContactData;
}

const PeopleHub: React.FC = () => {
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = React.useMemo(() => getStyles(themeColors, designs), [themeColors, designs]);
    const [activeView, setActiveView] = useState('List');
    const [isAnimated, setIsAnimated] = useState(true);

    const { openHomepage } = useHomepage();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { 
        people, 
        isLoading: isPeopleLoading, 
        error: peopleError, 
        deletePerson,
        refreshPeople 
    } = usePeopleData();

    const {
        contacts,
        isLoading: isContactsLoading,
        error: contactsError,
    } = useContactData();

    // Process contact data for the chart
    const chartData = useMemo(() => {
        if (!contacts || contacts.length === 0) return [];

        const contactCounts = contacts.reduce((acc: Record<number, number>, contact: ContactData) => {
            acc[contact.personId] = (acc[contact.personId] || 0) + 1;
            return acc;
        }, {});

        const nodes = people.map((person: PersonData) => ({
            id: person.id,
            name: person.name,
            contacts: contactCounts[person.id] || 0
        }));

        // Add "You" node
        nodes.unshift({
            id: 0,
            name: "You",
            contacts: contacts.length
        });

        return nodes;
    }, [contacts, people]);

    // Filter and sort the people
    const filteredAndSortedPeople = useMemo(() => {
        return people
            .sort((a: PersonData, b: PersonData) => a.name.localeCompare(b.name));
    }, [people]);

    // Process contact data for each person
    const peopleWithContacts = useMemo(() => {
        return filteredAndSortedPeople.map((person: PersonData) => ({
            ...person,
            contacts: contacts.filter((contact: ContactData) => Number(contact.personId) === Number(person.id))
        }));
    }, [filteredAndSortedPeople, contacts]);

    const renderItem = ({ item }: { item: PersonData & { contacts: ContactData[] } }) => (
        <PersonEntry
            person={item}
            contacts={contacts}
            deletePerson={deletePerson}
            refreshPeople={refreshPeople}
        />
    );

    const navItems = [
        { label: 'List', onPress: () => setActiveView('List') },
        { label: 'Graph', onPress: () => setActiveView('Graph') }
    ];

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        refreshPeople();
    };

    return (
        <View style={styles.container}>
            {activeView === 'List' && (
                <>
                    <FlatList
                        data={filteredAndSortedPeople}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        style={styles.list}
                    />
                    {isAddModalOpen && (
                        <AddPersonModal
                            isOpen={isAddModalOpen}
                            onClose={handleCloseModal}
                        />
                    )}
                </>
            )}
            {activeView === 'Graph' && (
                <View style={styles.graphContainer}>
                    <View style={styles.switchContainer}>
                        <Text style={[styles.switchLabel, { color: themeColors.textColor }]}>Static</Text>
                        <Switch
                            value={isAnimated}
                            onValueChange={setIsAnimated}
                            trackColor={{ false: themeColors.borderColor, true: themeColors.borderColor }}
                            thumbColor={isAnimated ? themeColors.hoverColor : themeColors.backgroundColor}
                        />
                        <Text style={[styles.switchLabel, { color: themeColors.textColor }]}>Animated</Text>
                    </View>
                    {isContactsLoading || isPeopleLoading ? (
                        <Text style={styles.centeredText}>Loading...</Text>
                    ) : contactsError || peopleError ? (
                        <Text style={styles.centeredText}>Error loading data</Text>
                    ) : (
                        <View style={styles.graphWrapper}>
                            {isAnimated ? (
                                <AnimatedPeopleNetworkChart data={chartData} />
                            ) : (
                                <PeopleNetworkChart data={chartData} />
                            )}
                        </View>
                    )}
                </View>
            )}
            <MobileNavbar 
                items={navItems} 
                activeIndex={navItems.findIndex(item => item.label === activeView)} 
                title="People" 
                onBackPress={openHomepage} 
                quickButtonFunction={() => setIsAddModalOpen(true)}
                screen="people"
            />
        </View>
    );
};

export default PeopleHub;

const getStyles = (themeColors: any, designs: any) => {
    const { width } = Dimensions.get('window');
    const isSmall = width < 1920;
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: themeColors.backgroundColor,
            paddingHorizontal: 10,
            marginTop: isDesktop ? 0 : 37,
        },
        filterContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        filterIcon: {
            marginHorizontal: 15,
            padding: 5,
        },
        list: {
            marginTop: 30,
            flex: 1,
        },
        switchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
        },
        switchLabel: {
            marginHorizontal: 10,
            fontSize: 16,
        },
        floatingButton: {
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: themeColors.hoverColor, 
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
        },
        graphContainer: {
            flex: 1,
        },
        graphWrapper: {
            flex: 1,
            width: '100%',
            alignItems: 'center',
        },
        centeredText: {
            textAlign: 'center',
            color: themeColors.textColor,
        },
    });
};