import React, { useEffect } from 'react';
import { View, Switch, Text, StyleSheet, ScrollView } from 'react-native';

import { StepProps } from '../../PersonModal';
import { FormInput, PickerInput } from '../FormComponents';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

const PreferencesStep: React.FC<StepProps> = ({ person, updatePerson }) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    useEffect(() => {
        if (person.notificationEnabled === undefined) {
            updatePerson('notificationEnabled', 'false');
        }
        if (!person.category) {
            updatePerson('category', 'friend');
        }
        if (!person.frequencyOfContact) {
            updatePerson('frequencyOfContact', 'weekly');
        }
    }, []);

    return (
        <ScrollView>
            <PickerInput
                label="Category"
                selectedValue={person.category || 'friend'}
                onValueChange={(value) => updatePerson('category', value)}
                items={[
                    { label: "Friend", value: "friend" },
                    { label: "Partner", value: "partner" },
                    { label: "Relative (close)", value: "closeRelative" },
                    { label: "Relative (extended)", value: "farRelative" },
                    { label: "Acquaintance", value: "acquaintance" },
                    { label: "Colleague", value: "colleague" },
                    { label: "Professional", value: "professional" },
                    { label: "VIP", value: "vip" },
                ]}
            />
            <PickerInput
                label="Frequency of Contact"
                selectedValue={person.frequencyOfContact || 'weekly'}
                onValueChange={(value) => updatePerson('frequencyOfContact', value)}
                items={[
                    { label: "Weekly", value: "weekly" },
                    { label: "Monthly", value: "monthly" },
                    { label: "Yearly", value: "yearly" },
                ]}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={designs.text.text}>Enable notifications</Text>
                <Switch
                    value={person.notificationEnabled === 'true'}
                    onValueChange={(value) => updatePerson('notificationEnabled', value ? 'true' : 'false')}
                />
            </View>
            <FormInput label="Occupation" value={person.occupation || ''} onChangeText={(value) => updatePerson('occupation', value)} />
            <FormInput label="Partner" value={person.partner || ''} onChangeText={(value) => updatePerson('partner', value)} />
            <FormInput label="Likes" value={person.likes || ''} onChangeText={(value) => updatePerson('likes', value)} />
            <FormInput label="Dislikes" value={person.dislikes || ''} onChangeText={(value) => updatePerson('dislikes', value)} />
            <FormInput label="Description" value={person.description || ''} onChangeText={(value) => updatePerson('description', value)} multiline />
        </ScrollView>
    );
};

const getStyles = (theme: any) => StyleSheet.create({

});

export default PreferencesStep;