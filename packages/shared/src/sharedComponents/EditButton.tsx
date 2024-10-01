import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';

interface EditButtonProps {
    onEdit: () => void;
}

const EditButton: React.FC<EditButtonProps> = ({ onEdit }) => {
    const styles = getStyles();

    return (
        <Pressable onPress={onEdit} style={styles.editButton}>
        <FontAwesomeIcon icon={faPencilAlt} color='gray' />
        </Pressable>
    );
};

const getStyles = () => StyleSheet.create({
    editButton: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default EditButton;