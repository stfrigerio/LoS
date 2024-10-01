import React from 'react';
import { View } from 'react-native';
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
  gpt: 'GPT',
  journal: 'Journal',
  userSettings: 'UserSettings',
  tags: 'Tags',
};

const TableSelector: React.FC<TableSelectorProps> = ({ tables, selectedTable, onSelectTable }) => {
  const { themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);

  return (
    <View style={styles.container}>
      <select
        value={selectedTable}
        onChange={(e) => onSelectTable(e.target.value)}
        style={styles.picker}
      >
        <option value="" style={styles.pickerItem}>Select a table</option>
        {tables.map(table => (
          <option key={table} value={table} style={styles.pickerItem}>
            {tableDisplayNames[table] || table}
          </option>
        ))}
      </select>
    </View>
  );
};

const getStyles = (theme: any) => ({
  container: {
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    borderRadius: 10,
    borderColor: theme.borderColor,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  pickerItem: {
    fontSize: 18,
    marginBottom: 10
  },
});

export default TableSelector;