import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Switch, TextInput } from 'react-native';

import { StepProps } from '../../PersonModal';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { FormInput, PickerInput } from '../FormComponents';

const BasicInfoStep: React.FC<StepProps> = ({ person, updatePerson }) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);
    const [showMiddleName, setShowMiddleName] = useState(false);
    const [birthday, setBirthday] = useState({ year: '', month: '', day: '' });
    const [showAliases, setShowAliases] = useState(false);  // Add this line for the new switch

    useEffect(() => {
        if (person.birthDay) {
            const [year, month, day] = person.birthDay.split('-');
            setBirthday({ 
                year, 
                month: month,
                day: day
            });
        }
    }, [person.birthDay]);

    const updateBirthday = (field: 'year' | 'month' | 'day', value: string) => {
        const updatedBirthday = { ...birthday, [field]: value };
        setBirthday(updatedBirthday);

        const { year, month, day } = updatedBirthday;
        if (year && month && day) {
            const formattedMonth = month;
            const formattedDay = day;
            updatePerson('birthDay', `${year}-${formattedMonth}-${formattedDay}`);
        } else {
            updatePerson('birthDay', '');
        }
    };

    return (
        <ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: -20 }}>
                <View style={{ width: '48%' }}>
                    <FormInput label="Name" value={person.name || ''} onChangeText={(value) => updatePerson('name', value)} />
                </View>
                <View style={{ width: '48%' }}>
                    <FormInput label="Last Name" value={person.lastName || ''} onChangeText={(value) => updatePerson('lastName', value)} />
                </View>
            </View>

            <View style={styles.switchContainer}>
                <Text style={designs.text.text}>Include Middle Name</Text>
                <Switch
                    value={showMiddleName}
                    onValueChange={setShowMiddleName}
                    trackColor={{ false: themeColors.textColor, true: themeColors.textColor }}
                    thumbColor={showMiddleName ? themeColors.hoverColor : themeColors.textColor}
                />
            </View>

            <View style={styles.switchContainer}>
                <Text style={designs.text.text}>Include Aliases</Text>
                <Switch
                    value={showAliases}
                    onValueChange={setShowAliases}
                    trackColor={{ false: themeColors.textColor, true: themeColors.textColor }}
                    thumbColor={showAliases ? themeColors.hoverColor : themeColors.textColor}
                />
            </View>

            {showAliases && (
                <FormInput 
                    label="Aliases" 
                    value={person.aliases || ''} 
                    onChangeText={(value) => updatePerson('aliases', value)} 
                />
            )}

            {showMiddleName && (
                <FormInput 
                    label="Middle Name" 
                    value={person.middleName || ''} 
                    onChangeText={(value) => updatePerson('middleName', value)} 
                />
            )}

            <Text style={styles.birthdayLabel}>Birthday</Text>
            <View style={styles.birthdayContainer}>
                <TextInput
                    style={[styles.birthdayInput, { flex: 2 }]}
                    placeholder="YYYY"
                    placeholderTextColor={'gray'}
                    value={birthday.year}
                    onChangeText={(value) => updateBirthday('year', value)}
                    keyboardType="numeric"
                    maxLength={4}
                />
                <TextInput
                    style={styles.birthdayInput}
                    placeholder="MM"
                    placeholderTextColor={'gray'}
                    value={birthday.month}
                    onChangeText={(value) => {updateBirthday('month', value)}}
                    keyboardType="numeric"
                    maxLength={2}
                />
                <TextInput
                    style={styles.birthdayInput}
                    placeholder="DD"
                    placeholderTextColor={'gray'}
                    value={birthday.day}
                    onChangeText={(value) => {updateBirthday('day', value)}}
                    keyboardType="numeric"
                    maxLength={2}
                />
            </View>

            <PickerInput
                label="Pronouns"
                selectedValue={person.pronouns || 'he/him'}
                onValueChange={(value) => updatePerson('pronouns', value)}
                items={[
                    { label: "He/Him", value: "he/him" },
                    { label: "She/Her", value: "she/her" },
                    { label: "They/Them", value: "they/them" },
                ]}
            />
        </ScrollView>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 5,
        marginBottom: 15,
    },
    birthdayLabel: {
        color: 'gray',
        marginLeft: 5,
        marginBottom: 2,    
    },
    birthdayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    birthdayInput: {
        flex: 1,
        height: 40,
        borderColor: theme.borderColor,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginHorizontal: 5,
        color: theme.textColor,
    },
});

export default BasicInfoStep;

