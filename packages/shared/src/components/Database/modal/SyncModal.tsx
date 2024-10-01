import React from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { Change } from '../types/types';

interface SyncModalProps {
  visible: boolean;
  syncInfo: { [key: string]: { desktop: number; mobile: number; merged: number } } | null;
  changes: { [key: string]: Change[] };
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean; 
}

const SyncModal: React.FC<SyncModalProps> = ({ visible, syncInfo, changes, onConfirm, onCancel, isLoading }) => {
  const { themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);

  const getTotalChanges = (tableChanges: Change[]) => {
    return tableChanges.reduce((acc, change) => {
      acc[change.type] = (acc[change.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const renderTableSummary = (tableName: string) => {
    if (!syncInfo || !syncInfo[tableName]) return null;

    const { desktop, mobile, merged } = syncInfo[tableName];
    const tableChanges = changes[tableName] || [];
    const totalChanges = getTotalChanges(tableChanges);

    return (
      <View key={tableName} style={styles.tableSummary}>
        <Text style={styles.tableTitle}>{tableName}</Text>
        <Text style={styles.infoText}>Desktop: {desktop} | Mobile: {mobile} | Merged: {merged}</Text>
        <Text style={styles.changesTitle}>Changes:</Text>
        <Text style={styles.changeText}>Added: {totalChanges.added || 0}</Text>
        <Text style={styles.changeText}>Modified: {totalChanges.modified || 0}</Text>
        <Text style={styles.changeText}>Duplicated: {totalChanges.duplicated || 0}</Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Sync Summary</Text>
          <ScrollView style={styles.scrollView}>
            {syncInfo && Object.keys(syncInfo).map(renderTableSummary)}
          </ScrollView>
          <View style={styles.buttonContainer}>
            {isLoading ? (
                <ActivityIndicator size="large" color={themeColors.hoverColor} />
              ) : (
                <>
                  <Pressable style={[designs.button.marzoPrimary, styles.button]} onPress={onConfirm}>
                    <Text style={designs.button.buttonText}>Confirm Sync</Text>
                  </Pressable>
                  <Pressable style={[designs.button.marzoSecondary, styles.button]} onPress={onCancel}>
                    <Text style={designs.button.buttonText}>Cancel</Text>
                  </Pressable>
                </>
              )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: theme.backgroundColor,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  scrollView: {
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: theme.textColor,
  },
  tableSummary: {
    marginBottom: 20,
    width: '100%',
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: theme.textColor,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: theme.textColor,
  },
  changesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 5,
    color: theme.textColor,
  },
  changeText: {
    fontSize: 14,
    color: theme.textColor,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    minWidth: 120,
  },
});

export default SyncModal;