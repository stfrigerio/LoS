import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { PillarData } from '@los/shared/src/types/Pillar';

interface AddPillarModalProps {
    isVisible: boolean;
    onClose: () => void;
    onAdd: (pillarData: PillarData) => void;
    initialData?: PillarData;
}

const AddPillarModal: React.FC<AddPillarModalProps> = ({
    isVisible,
    onClose,
    onAdd,
    initialData,
}) => {
    const [pillarData, setPillarData] = useState<PillarData>({
        uuid: '',
        name: '',
        emoji: '',
        description: '',
    });

    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    useEffect(() => {
        if (initialData) {
            setPillarData(initialData);
        } else {
            setPillarData({ uuid: '', name: '', emoji: '', description: '' });
        }
    }, [initialData]);

    const handleAdd = () => {
        if (!pillarData.name) {
        // You might want to show an alert here
        return;
        }
        onAdd(pillarData);
        onClose();
    };

    const updatePillarData = (key: keyof PillarData, value: string) => {
        setPillarData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <Modal visible={isVisible} transparent animationType="fade">
            <View style={designs.modal.modalContainer}>
                <View style={designs.modal.modalView}>
                <Text style={designs.text.title}>
                    {initialData ? 'Edit Pillar' : 'Add New Pillar'}
                </Text>
                <TextInput
                    placeholder="Pillar Name"
                    placeholderTextColor="gray"
                    value={pillarData.name}
                    onChangeText={(text) => updatePillarData('name', text)}
                    style={designs.text.input}
                />
                <TextInput
                    placeholder="Emoji (optional)"
                    placeholderTextColor="gray"
                    value={pillarData.emoji}
                    onChangeText={(emoji) => updatePillarData('emoji', emoji)}
                    style={designs.text.input}
                />
                <TextInput
                    placeholder="Description (optional)"
                    placeholderTextColor="gray"
                    value={pillarData.description}
                    onChangeText={(description) => updatePillarData('description', description)}
                    style={designs.text.input}
                />
                <View style={styles.modalButtonContainer}>
                    <Pressable style={designs.button.marzoPrimary} onPress={onClose}>
                    <Text style={designs.button.buttonText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={designs.button.marzoSecondary} onPress={handleAdd}>
                    <Text style={designs.button.buttonText}>{initialData ? 'Update' : 'Add'} Pillar</Text>
                    </Pressable>
                </View>
                </View>
            </View>
        </Modal>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
});

export default AddPillarModal;