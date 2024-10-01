import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Switch } from 'react-native';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { FormInput } from '../FormComponents';
import { StepProps } from '../../PersonModal';

const ContactInfoStep: React.FC<StepProps> = ({ person, updatePerson }) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);
    const [showState, setShowState] = useState(false);

    return (
        <ScrollView>
            <FormInput label="Email" value={person.email || ''} onChangeText={(value) => updatePerson('email', value)} keyboardType="email-address" />
            <FormInput label="Phone Number" value={person.phoneNumber || ''} onChangeText={(value) => updatePerson('phoneNumber', value)} keyboardType="phone-pad" />
            <FormInput label="Address" value={person.address || ''} onChangeText={(value) => updatePerson('address', value)} />
            <FormInput label="City" value={person.city || ''} onChangeText={(value) => updatePerson('city', value)} />
            <View style={styles.switchContainer}>
                <Text style={designs.text.text}>Include State</Text>
                <Switch
                    value={showState}
                    onValueChange={setShowState}
                    trackColor={{ false: themeColors.textColor, true: themeColors.textColor }}
                    thumbColor={showState ? themeColors.hoverColor : themeColors.textColor}
                />
            </View>
            {showState && <FormInput label="State" value={person.state || ''} onChangeText={(value) => updatePerson('state', value)} />}
            <FormInput label="Country" value={person.country || ''} onChangeText={(value) => updatePerson('country', value)} />
        </ScrollView>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});

export default ContactInfoStep;