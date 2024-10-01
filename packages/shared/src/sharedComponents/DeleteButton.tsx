import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface DeleteButtonProps {
  onDelete: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete }) => {
  const styles = getStyles('dark');

  return (
    <Pressable onPress={onDelete} style={styles.deleteButton}>
      <FontAwesomeIcon icon={faTrash} color='gray' />
    </Pressable>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  deleteButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DeleteButton;