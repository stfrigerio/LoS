import React, { useState } from 'react';
import { View, Pressable, Text } from 'react-native';

import { PickerInput } from '@los/shared/src/components/modals/components/FormComponents';
import AlertModal from '@los/shared/src/components/modals/AlertModal';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { databaseManagers } from '@los/mobile/src/database/tables';
import { databaseManager } from '@los/mobile/src/database/databaseManager';

const DestructionSection = () => {
  const [selectedTable, setSelectedTable] = useState('');
  const { themeColors, designs } = useThemeStyles();

  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertConfirmAction, setAlertConfirmAction] = useState<() => void>(() => {});

  const showAlert = (title: string, message: string, onConfirm: () => void) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertConfirmAction(() => onConfirm);
    setAlertModalVisible(true);
  };

  const dropDatabases = async (dropAll: boolean) => {
    const message = dropAll
      ? "Are you sure you want to delete the database? This action cannot be undone."
      : `Are you sure you want to delete the ${selectedTable} table? This action cannot be undone.`;

    showAlert(
      "Confirm Delete",
      message,
      () => dropAll ? performDatabaseDrop() : performDatabaseDropByTable()
    );
  };

  const performDatabaseDrop = async () => {
    try {
      await databaseManager.dropAllTables();
      showAlert('Success', 'Database deleted successfully', () => {});
    } catch (error) {
      console.error("Failed to delete database:", error);
      showAlert('Error', 'Failed to delete database', () => {});
    }
  };

  const performDatabaseDropByTable = async () => {
    if (!selectedTable) {
      showAlert('Error', 'Please select a table to drop.', () => {});
      return;
    }
    try {
      await databaseManager.dropTable(selectedTable);
      showAlert('Success', `Table ${selectedTable} deleted successfully`, () => {});
    } catch (error) {
      console.error(`Failed to delete table ${selectedTable}:`, error);
      showAlert('Error', `Failed to delete table ${selectedTable}`, () => {});
    }
  };

  return (
    <View style={{ marginTop: 10, marginHorizontal: 50 }}>
      <PickerInput
        label="Select a table to destroy"
        selectedValue={selectedTable}
        onValueChange={(itemValue) => setSelectedTable(itemValue)}
        items={[
          { label: 'None', value: '' },
          ...Object.keys(databaseManagers).map((table) => ({ label: table, value: table }))
        ]}
      />
      <Pressable 
        style={[designs.button.marzoPrimary, {marginLeft: 0}]} 
        onPress={() => dropDatabases(false)}
      >
        <Text style={designs.button.buttonText}>⚠️DELETE selected table⚠️</Text>
      </Pressable>
      <Pressable style={[designs.button.marzoPrimary, {marginLeft: 0}]} onPress={() => dropDatabases(true)}>
        <Text style={designs.button.buttonText}>💥NUKE DATABASE💥</Text>
      </Pressable>
      {alertModalVisible && (
        <AlertModal
          isVisible={alertModalVisible}
          title={alertTitle}
          message={alertMessage}
          onConfirm={() => {
            setAlertModalVisible(false);
            alertConfirmAction();
          }}
          onCancel={() => setAlertModalVisible(false)}
        />
      )}
    </View>
  );
};

export default DestructionSection;