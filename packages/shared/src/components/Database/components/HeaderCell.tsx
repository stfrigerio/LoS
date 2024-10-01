import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

const HeaderCell: React.FC<{ value: string }> = ({ value }) => {
  const { themeColors } = useThemeStyles();
  const styles = getStyles(themeColors);

  return (
    <View>
      <View style={styles.headerCellContent}>
        <Text style={styles.headerText}>{value}</Text>
      </View>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  headerCellContent: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: 40, // Match the height of EditableField
  },
  headerText: {
    fontWeight: 'bold',
    color: 'gray',
    fontSize: 12, // Match the font size of EditableField
  },
});
export default HeaderCell;