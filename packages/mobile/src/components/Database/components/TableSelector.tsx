import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface TableSelectorProps {
  tables: string[];
  selectedTable: string;
  onSelectTable: (table: string) => void;
}

const tableDisplayNames: { [key: string]: string } = {
  dailyNote: 'Daily Note',
  time: 'Time',
  library: 'Library',
  tasks: 'Tasks',
  money: 'Money',
  text: 'Text',
  mood: 'Mood',
  userSettings: 'User Settings',
  tags: 'Tags'
};

const TableSelector: React.FC<TableSelectorProps> = ({ tables, selectedTable, onSelectTable }) => {
  const { themeColors } = useThemeStyles();
  const styles = getStyles(themeColors);

  if (!tables || tables.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No tables available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
      <Picker
          selectedValue={selectedTable}
          onValueChange={(itemValue) => onSelectTable(itemValue)}
          style={styles.picker}
          dropdownIconColor={themeColors.textColor}
          mode="dropdown"
          itemStyle={styles.pickerItemStyle}
        >
          <Picker.Item label="Select a table" value="" style={styles.pickerItemStyle}/>
          {tables.map((table) => (
            <Picker.Item
              key={table}
              label={tableDisplayNames[table] || table}
              value={table}
              style={styles.pickerItemStyle}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: 20,
    marginTop: 0,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  picker: {
    height: 50,
    flex: 1,
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
  },
  pickerItemStyle: {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    fontSize: 16,
  },
  errorText: {
    color: theme.errorColor,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TableSelector;