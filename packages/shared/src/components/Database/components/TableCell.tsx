import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface TableCellProps {
  displayValue: string;
  tableName: string;
  columnName: string;
  rowData: any;
}

const TableCell: React.FC<TableCellProps> = ({ displayValue, tableName, columnName }) => {
  const { themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);

  const renderEditableContent = () => {
    if (tableName.toLowerCase() === 'time') {
      if (columnName === 'duration') {
        return (
          <Text style={styles.rowText} numberOfLines={2}>
            {displayValue}
          </Text>
        );
      }
      if (columnName === 'start_time' || columnName === 'end_time') {
        return (
            <Text style={styles.rowText} numberOfLines={2}>
              {displayValue}
            </Text>
        );
      }
    }

    return (
        <Text style={styles.rowText} numberOfLines={2}>
          {displayValue}
        </Text>
    );
  };

  return (
    <>
      {renderEditableContent()}
    </>
  );
};


const getStyles = (theme: any) => StyleSheet.create({
  textContainer: {
    justifyContent: 'center',
    minHeight: 40,
  },
  rowText: {
    color: theme.textColor,
    fontSize: 12,
  }
});

export default TableCell;