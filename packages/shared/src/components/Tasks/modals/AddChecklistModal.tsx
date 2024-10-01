import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Modal, Platform } from 'react-native';
import { useThemeStyles } from '../../../styles/useThemeStyles';
import { UniversalModal } from '../../../sharedComponents/UniversalModal';

let ColorPicker: any;
if (Platform.OS !== 'web') {
    ColorPicker = require('../../UserSettings/components/modals/components/ColorPicker').default;
}

interface AddChecklistModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (name: string, color: string) => void;
    initialChecklist?: { name: string; color: string } | null;
}

const AddChecklistModal: React.FC<AddChecklistModalProps> = ({ visible, onClose, onAdd, initialChecklist }) => {
    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors, designs);
    const [checklistName, setChecklistName] = useState('');
    const [checklistColor, setChecklistColor] = useState('#FFFFFF');

    useEffect(() => {
        if (initialChecklist) {
            setChecklistName(initialChecklist.name);
            setChecklistColor(initialChecklist.color);
        } else {
            setChecklistName('');
            setChecklistColor('#FFFFFF');
        }
    }, [initialChecklist]);

    const handleAddChecklist = () => {
        if (checklistName.trim()) {
        onAdd(checklistName.trim(), checklistColor);
        setChecklistName('');
        setChecklistColor('#FFFFFF');
        onClose();
        }
    };

    return (
        <>
            <UniversalModal isVisible={visible} onClose={onClose}>
                <View style={styles.modalContent}>
                <Text style={designs.text.title}>{initialChecklist ? 'Edit Checklist' : 'Add New Checklist'}</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setChecklistName}
                    value={checklistName}
                    placeholder="Checklist name"
                    placeholderTextColor='#969DA3'
                />
                <Pressable
                    style={[designs.button.marzoSecondary, {width: '90%', marginTop: 20}]}
                    onPress={handleAddChecklist}
                >
                    <Text style={designs.button.buttonText}>{initialChecklist ? 'Update Checklist' : 'Add Checklist'}</Text>
                </Pressable>
                </View>
            </UniversalModal>
        </>
    );
};

const getStyles = (themeColors: any, designs: any) => StyleSheet.create({
    modalContent: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    input: {
        fontSize: 14,
        marginTop: 20,
        alignSelf: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: themeColors.borderColor,
        paddingHorizontal: 18,
        width: '100%',
        color: themeColors.textColor,
        height: 60
    },
    colorPickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    colorDot: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: themeColors.borderColor,
        marginRight: 10,
    },
    colorPickerButtonText: {
        color: themeColors.textColor,
    },
    colorPickerContent: {
        backgroundColor: themeColors.backgroundColor,
        borderRadius: 10,
        padding: 20,
        width: '90%',
        height: 400,
    },
    colorPickerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginLeft: -40
    },
});

export default AddChecklistModal;