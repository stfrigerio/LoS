import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet } from 'react-native';

import DeleteButton from '@los/shared/src/sharedComponents/DeleteButton';
import HeaderCell from './HeaderCell';
import TableCell from './TableCell';

import { calculateDuration } from '../../../utilities/timeUtils';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { formatValue, getInputType, formatDateForDisplay, formatDateTimeForDisplay } from '../helpers/helper';


interface RowData {
  [key: string]: any;
}

interface TableViewProps {
  tableData: any[];
  selectedTable: string;
  handleUpdate: (table: string, rowData: any, field: string, value: any) => void;
  handleRemove: (table: string, rowData: any) => void;
  currentPage: number;
  itemsPerPage: number;
  visibleColumns: string[] | null;
}

const TableView: React.FC<TableViewProps> = ({
  tableData,
  selectedTable,
  handleUpdate,
  handleRemove,
  currentPage,
  itemsPerPage,
  visibleColumns
}) => {
  const { themeColors } = useThemeStyles();
  const styles = getStyles(themeColors);

  const columns = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];
    const allColumns = Object.keys(tableData[0]);
    return visibleColumns || allColumns;
  }, [tableData, visibleColumns]);

  const cellWidths = useMemo(() => {
    if (!tableData || tableData.length === 0) return {};
    const maxWidth = 100;
    return columns.reduce((acc, column) => {
      const contentWidth = Math.max(
        column.length,
        ...tableData.map(row => String(row[column]).length)
      ) * 10;
      acc[column] = Math.min(maxWidth, Math.max(100, contentWidth));
      return acc;
    }, {} as { [key: string]: number });
  }, [columns, tableData]);

  const paginatedData = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return tableData.slice(startIndex, startIndex + itemsPerPage);
  }, [tableData, currentPage, itemsPerPage]);

  const dateColumns = ['date', 'dueDate'];
  const dateTimeColumns = ['due', 'startTime', 'endTime'];

  const formatCellValue = useCallback((value: any, column: string) => {
    if (dateColumns.includes(column)) {
      return formatDateForDisplay(value);
    } else if (dateTimeColumns.includes(column)) {
      return formatDateTimeForDisplay(value);
    } else {
      return formatValue(value);
    }
  }, []);

  const renderCell = useCallback((rowData: any, column: string, isHeader: boolean = false) => (
    <View key={column} style={[styles.cell, { width: cellWidths[column] }]}>
      {isHeader ? (
        <HeaderCell value={column} />
      ) : (
        <TableCell
          displayValue={formatCellValue(rowData[column], column)}
          tableName={selectedTable}
          columnName={column}
          rowData={rowData}
        />
      )}
    </View>
  ), [cellWidths, formatCellValue, selectedTable]);

  const renderRow = useCallback(({ item }: { item: RowData }) => (
    <View style={styles.row}>
      {columns.map(column => renderCell(item, column))}
      <DeleteButton onDelete={() => handleRemove(selectedTable, item)} />
    </View>
  ), [columns, renderCell, handleRemove, selectedTable, styles.row]);

  const keyExtractor = useCallback((item: RowData, index: number) => 
    `${selectedTable}-${index}-${item.id || index}`, [selectedTable]);

  if (!tableData || tableData.length === 0) {
    return <Text style={styles.noData}>No data available</Text>;
  }

  return (
    <View style={styles.tableContainer}>
      <ScrollView horizontal>
        <View>
          <View style={[styles.row, styles.headerRow]}>
            {columns.map(column => renderCell(column, column, true))}
          </View>
          <FlatList
            data={paginatedData}
            renderItem={renderRow}
            keyExtractor={keyExtractor}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  tableContainer: {
    flex: 1,
  },
  headerRow: {
    backgroundColor: '#1f1e1e',
    borderBottomWidth: 1,
    borderBottomColor: theme.opaqueTextColor,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    maxHeight: 40,
    borderBottomColor: theme.borderColor,
  },
  cell: {
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: theme.borderColor,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    color: theme.textColor,
  },
});

export default TableView;