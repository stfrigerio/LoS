import React, { useState, useEffect } from 'react';
import { Text, View, Platform, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLaptop, faMobile, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import { SwitchInput } from '@los/shared/src/components/modals/components/FormComponents';
import DatabaseTable from './components/DatabaseTable';
import SyncModal from './modal/SyncModal';

import { useData } from './helpers/useData';
import { sortTableData } from './helpers/sortTableData'
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

import { TableData, Change} from './types/types';

// Conditional imports
let TableSelector: React.ComponentType<any>;
let syncDatabasesMobile: any;
let syncDatabasesDesktop: any;
let prepareMergingMobile: any;
let prepareMergingDesktop: any;
let DrawerStateManager: any;
let DestructionSection: any;
let ServerSection: any;
let deleteStaleEntries: any;
let useDatabaseData: () => { 
	tables: string[]; 
	fetchAllData: () => Promise<TableData>;
	update: (table: string, updatedRowData: any) => Promise<any>; 
	remove: (table: string, rowData: any) => Promise<any>; 
};

if (Platform.OS === 'web') {
	TableSelector = require('@los/desktop/src/components/Database/components/TableSelector').default;
	useDatabaseData = require('@los/desktop/src/components/Database/hooks/useDatabaseData').useDatabaseData;
	syncDatabasesMobile = null
	syncDatabasesDesktop = null
	prepareMergingMobile = null
	prepareMergingDesktop = null
	DrawerStateManager = null
	DestructionSection = null
	ServerSection = null
} else {
	TableSelector = require('@los/mobile/src/components/Database/components/TableSelector').default;
	useDatabaseData = require('@los/mobile/src/components/Database/hooks/useDatabaseData').useDatabaseData;
	syncDatabasesMobile = require('@los/mobile/src/components/Database/helpers/syncDatabases').syncDatabases;
	prepareMergingMobile = require('@los/mobile/src/components/Database/helpers/prepareMerging').prepareMerging;
	syncDatabasesDesktop = require('@los/desktop/src/components/Database/helpers/syncDatabases').syncDatabases;
	prepareMergingDesktop = require('@los/desktop/src/components/Database/helpers/prepareMerging').prepareMerging;
	DrawerStateManager = require('@los/mobile/src/components/Contexts/DrawerState').DrawerStateManager;
	DestructionSection = require('@los/mobile/src/components/UserSettings/components/DatabaseActions/DestructionSection').default
	ServerSection = require('@los/mobile/src/components/UserSettings/components/DatabaseActions/ServerSection').default
	deleteStaleEntries = require('@los/mobile/src/components/Database/hooks/deleteStaleEntries').deleteStaleEntries;
}

const Database: React.FC = () => {
	const [selectedTable, setSelectedTable] = useState<string>('');
	const [syncModalVisible, setSyncModalVisible] = useState(false);
	const [syncInfo, setSyncInfo] = useState<{ [key: string]: { desktop: number, mobile: number, merged: number, change: number } } | null>(null);
	const [mergedData, setMergedData] = useState<TableData | null>(null);
	const [changes, setChanges] = useState<{ [key: string]: Change[] }>({});
	const [syncDirection, setSyncDirection] = useState<'toMobile' | 'toDesktop'>('toMobile');
	const [isSyncing, setIsSyncing] = useState(false);

	const [showServerSection, setShowServerSection] = useState(false);
	const [showDestructionSection, setShowDestructionSection] = useState(false);

	const { themeColors, designs } = useThemeStyles();
	const styles = getStyles(themeColors);

	useEffect(() => {
		if (DrawerStateManager) {
			DrawerStateManager.disableAllSwipeInteractions();
		}

		// Cleanup function to re-enable swipe interactions when component unmounts
		return () => {
			if (DrawerStateManager) {
				DrawerStateManager.enableAllSwipeInteractions();
			}
		};
	}, []); 

	const {
		tableData,
		isLoading,
		error,
		tables,
		handleUpdate,
		handleRemove
	} = useData();
	
	const handleSync = async (direction: 'toMobile' | 'toDesktop') => {
		try {
			setSyncDirection(direction);
			let result;

			// Create a copy of tableData without BooleanHabits and QuantifiableHabits
			const syncTableData = { ...tableData };
			delete syncTableData.BooleanHabits;
			delete syncTableData.QuantifiableHabits;

			const deletionLog = tableData.DeletionLog
			delete syncTableData.DeletionLog

			if (direction === 'toMobile') {
				console.log(Object.keys(tableData))
				result = await prepareMergingMobile(syncTableData);
				
			} else {
				// Delete stale entries on the desktop
				if (deletionLog && deletionLog.length > 0) {
					try {
						await deleteStaleEntries(deletionLog);
						console.log('Stale entries deleted successfully');
					} catch (error) {
						console.error('Error deleting stale entries:', error);
					}
				}

				result = await prepareMergingDesktop(syncTableData);
			}
			if (result.error) {
				console.error(`Sync preparation failed for ${direction}:`, result.error);
				Alert.alert('Sync Error', result.error);
				setSyncInfo(null);
				setChanges({});
			} else {
				setSyncInfo(result.syncInfo);
				setMergedData(result.merged);
				setChanges(result.changes);
				setSyncModalVisible(true);
			}
		} catch (error) {
			console.error(`Sync preparation failed for ${direction}:`, error);
			Alert.alert('Sync Error', 'An unexpected error occurred during sync preparation.');
			setSyncInfo(null);
			setChanges({});
		}
	};

	const handleConfirmSync = async () => {
		if (mergedData) {
			try {
				setIsSyncing(true); // Set loading to true when sync starts
				if (syncDirection === 'toMobile') {
					await syncDatabasesMobile(mergedData);
				} else {
					await syncDatabasesDesktop(mergedData);
				}
				setSyncModalVisible(false);
			} catch (error) {
				console.error(`Sync ${syncDirection} failed:`, error);
				Alert.alert('Sync Error', 'An error occurred during synchronization.');
			} finally {
				setIsSyncing(false); // Set loading to false when sync completes (success or failure)
			}
		}
	};

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={styles.loadingText}>Loading...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>{error}</Text>
			</View>
		);
	}

	const getSortedTableData = (tableName: string, data: any[]) => {
		if (tableName === 'BooleanHabits') {
			return data
		} else {
			return sortTableData(tableName, data);
		}
	};

	const hiddenColumns = {
		common: ['id', 'uuid', 'createdAt', 'updatedAt', 'synced'],
		specific: {
			'DailyNotes': ['booleanHabits', 'quantifiableHabits'],
			'dailyNotes': ['booleanHabits', 'quantifiableHabits'],
			'Library': ['mediaImage', 'finished'],
			'library': ['mediaImage', 'finished']
		}
	};

	const confirmSync = (direction: 'toMobile' | 'toDesktop') => {
		Alert.alert(
			'Confirm Sync',
			`Are you sure you want to sync ${direction === 'toMobile' ? 'to Mobile' : 'to Desktop'}?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{ text: 'Yes', onPress: () => handleSync(direction) }
			]
		);
	};

	return (
		<>
			{Platform.OS !== 'web' && (
				<>
					<View style={styles.switchContainer}>
						<SwitchInput  
							label='Show Server Section'
							value={showServerSection}
							onValueChange={(value) => setShowServerSection(value)}
							trueLabel='Show Server Section'
							falseLabel=''
							leftLabelOff={true}
						/>
						<SwitchInput  
							label='Show Destruction Section'
							value={showDestructionSection}
							onValueChange={(value) => setShowDestructionSection(value)}
							trueLabel='Engage Database Destruction'
							falseLabel=''
							trackColorTrue={themeColors.hoverColor}
							leftLabelOff={true}
						/>
					</View>
				</>
			)}
			{showDestructionSection && (
				<DestructionSection />
			)}
			<ScrollView style={styles.container}>
				<TableSelector
					tables={tables}
					selectedTable={selectedTable}
					onSelectTable={setSelectedTable}
				/>
				{Platform.OS !== 'web' && (
					<>
						{showServerSection && (
							<>
								<View style={styles.syncButtonsContainer}>
									<View style={styles.syncButtonAndLabelContainer}>
										<Text style={styles.syncButtonLabel}>Sync to Mobile</Text>
										<Pressable 
											style={styles.syncButton} 
											onPress={() => confirmSync('toMobile')}
										>
											<FontAwesomeIcon icon={faLaptop} size={24} color={'gray'} />
											<FontAwesomeIcon icon={faArrowRight} size={14} color={'rgba(211, 198, 170, 0.5)'} style={styles.arrowIcon} />
											<FontAwesomeIcon icon={faMobile} size={20} color={'gray'} />
										</Pressable>
									</View>
									<View style={styles.syncButtonAndLabelContainer}>
										<Text style={styles.syncButtonLabel}>Sync to Desktop</Text>
										<Pressable 
											style={styles.syncButton} 
											onPress={() => confirmSync('toDesktop')}
										>
											<FontAwesomeIcon icon={faMobile} size={20} color={'gray'} />
											<FontAwesomeIcon icon={faArrowRight} size={14} color={'rgba(211, 198, 170, 0.5)'} style={styles.arrowIcon} />
											<FontAwesomeIcon icon={faLaptop} size={24} color={'gray'} />
										</Pressable>
									</View>
								</View>
								<ServerSection />
							</>
						)}
					</>
				)}
				{selectedTable && tableData[selectedTable] && (
					<DatabaseTable
						tableData={getSortedTableData(selectedTable, tableData[selectedTable])}
						selectedTable={selectedTable}
						handleUpdate={handleUpdate}
						handleRemove={handleRemove}
						hiddenColumns={hiddenColumns}
					/>
				)}
				<SyncModal
					visible={syncModalVisible}
					syncInfo={syncInfo}
					changes={changes}
					onConfirm={handleConfirmSync}
					onCancel={() => setSyncModalVisible(false)}
					isLoading={isSyncing}
				/>
			</ScrollView>
		</>
	);
};

export default Database;

const getStyles = (theme: any) => StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: theme.backgroundColor,
	},
	loadingContainer: {
		backgroundColor: theme.backgroundColor,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		fontSize: 18,
		color: theme.textColor,
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: theme.backgroundColor,
	},
	errorText: {
		fontSize: 18,
		color: 'red',
		textAlign: 'center',
	},
	syncButtonsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		marginVertical: 10,
		// borderWidth: 1,
		// borderColor: 'red'
	},
	syncButtonLabel: {
		color: 'gray',
		fontSize: 10,
		marginBottom: 5
	},
	syncButtonAndLabelContainer: {
		flexDirection: 'column',
		alignItems: 'center',
	},
	syncButton: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: theme.borderColor,
		padding: 10,
		borderRadius: 10,
	},
	arrowIcon: {
		marginHorizontal: 8,
	},
	switchContainer: {
		marginTop: 20,
		marginLeft: 40,
		flexDirection: 'column',
		alignItems: 'stretch',
		justifyContent: 'flex-start',
		width: '100%'
	},
});

