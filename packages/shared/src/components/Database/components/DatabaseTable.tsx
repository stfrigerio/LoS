import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, Switch, useWindowDimensions } from 'react-native';

import TableView from './TableView';
import Pagination from './Pagination';
import { TableData } from '../types/types';
import { useThemeStyles } from '../../../styles/useThemeStyles';

interface HiddenColumns {
  common: string[];
  specific: {
    [key: string]: string[];
  };
}

interface DatabaseTableProps {
  tableData: TableData[string];
  selectedTable: string;
  handleUpdate: (table: string, rowData: any, field: string, value: any) => Promise<void>;
  handleRemove: (table: string, rowData: any) => Promise<void>;
  hiddenColumns: HiddenColumns
}

const DatabaseTable: React.FC<DatabaseTableProps> = ({
  tableData,
  selectedTable,
  handleUpdate,
  handleRemove,
  hiddenColumns,
}) => {
  const { themeColors } = useThemeStyles();
  const styles = getStyles(themeColors);
  const { width: screenWidth } = useWindowDimensions();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const memoizedTableData = useMemo(() => tableData, [tableData]);
  const [showAllColumns, setShowAllColumns] = useState(false);

  const visibleColumns = useMemo(() => {
    if (showAllColumns) return null;
    const allColumns = tableData.length > 0 ? Object.keys(tableData[0]) : [];
    const hiddenForThisTable = [
      ...hiddenColumns.common,
      ...(hiddenColumns.specific[selectedTable] || [])
    ];
    return allColumns.filter(col => !hiddenForThisTable.includes(col));
  }, [showAllColumns, tableData, selectedTable, hiddenColumns]);

  useEffect(() => {
      setCurrentPage(1);
  }, [selectedTable]);

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleText}>Show all columns</Text>
        <Switch
          value={showAllColumns}
          onValueChange={setShowAllColumns}
        />
      </View>
      <View style={[styles.tableWrapper, { width: screenWidth - 40 }]}>
        <TableView
          tableData={memoizedTableData}
          selectedTable={selectedTable}
          handleUpdate={handleUpdate}
          handleRemove={handleRemove}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          visibleColumns={visibleColumns}
        />
      </View>
      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalItems={tableData?.length || 0}
        itemsPerPage={itemsPerPage}
      />
    </View>
  );
};

export default DatabaseTable;

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 100,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  toggleText: {
    marginRight: 10,
    color: 'gray',
  },
  tableWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 5,
    overflow: 'hidden',
  },
});