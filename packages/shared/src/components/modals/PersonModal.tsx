import React, { useEffect } from 'react';
import { View, Modal, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';

import BasicInfoStep from '@los/shared/src/components/modals/components/PersonModal/BasicInfoStep';
import ContactInfoStep from '@los/shared/src/components/modals/components/PersonModal/ContactInfoStep';
import PreferencesStep from '@los/shared/src/components/modals/components/PersonModal/PreferencesStep';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

import { PersonData } from '@los/shared/src/types/People';

let usePersonModal: any
if (Platform.OS === 'web') {
    usePersonModal = require('@los/desktop/src/components/modals/usePersonModal').usePersonModal;
} else {
    usePersonModal = require('@los/mobile/src/components/modals/usePersonModal').usePersonModal;
}

interface AddPersonModalProps {
    isOpen: boolean;
    initialPerson?: PersonData;
    onClose: () => void;
}

export interface StepProps {
    person: Partial<PersonData>;
    updatePerson: (key: keyof PersonData, value: any) => void;
    resetStep: () => void;
}

const AddPersonModal: React.FC<AddPersonModalProps> = ({ isOpen, onClose, initialPerson }) => {
    const { designs } = useThemeStyles();

    const { step, person, setPerson, handleNext, handleBack, resetForm, updatePerson } = usePersonModal(onClose, initialPerson);

    useEffect(() => {
        if (initialPerson) {
            setPerson(initialPerson);
        }
    }, [initialPerson, setPerson]);

    const steps: { title: string; component: React.FC<StepProps> }[] = [
        { title: 'Basic Info', component: BasicInfoStep },
        { title: 'Contact Info', component: ContactInfoStep },
        { title: 'Preferences', component: PreferencesStep },
    ];

    const CurrentStepComponent = steps[step].component;

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true}>
            <Pressable style={designs.modal.modalContainer} onPress={onClose}>
                <View style={[designs.modal.modalView, { width: '90%' }]} onStartShouldSetResponder={() => true} onTouchEnd={(e) => e.stopPropagation()}>
                    <Text style={designs.text.title}>{steps[step].title}</Text>
                    
                    <CurrentStepComponent
                        person={person}
                        updatePerson={updatePerson}
                        resetStep={resetForm}
                    />

                    <View style={styles.buttonContainer}>
                        <Pressable style={[designs.button.marzoPrimary, { width: '48%' }]} onPress={handleBack}>
                            <Text style={designs.button.buttonText}>{step === 0 ? 'Cancel' : 'Back'}</Text>
                        </Pressable>
                        <Pressable style={[designs.button.marzoSecondary, { width: '48%' }]} onPress={handleNext}>
                            <Text style={designs.button.buttonText}>{step === steps.length - 1 ? 'Save' : 'Next'}</Text>
                        </Pressable>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
});

export default AddPersonModal;