import React, { useState, useEffect } from 'react';
import { View, Pressable, Text, TextInput, ActivityIndicator, StyleSheet, Keyboard } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faServer, faSave, faFileExport, faFileImport, faShareAlt } from '@fortawesome/free-solid-svg-icons';

import AlertModal from '@los/shared/src/components/modals/AlertModal';
import { useNavbarDrawer } from '@los/shared/src/components/Contexts/NavbarContext';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { databaseManagers } from '@los/mobile/src/database/tables';

const ServerSection = () => {
    const [serverURL, setServerURL] = useState('');
    const { themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);
    const { setKeyboardVisible } = useNavbarDrawer();

    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertConfirmAction, setAlertConfirmAction] = useState<() => void>(() => {});
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        fetchServerURL();
    }, []);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, [setKeyboardVisible]);

    const showAlert = (title: string, message: string, onConfirm: () => void) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertConfirmAction(() => onConfirm);
        setAlertModalVisible(true);
    };

    const fetchServerURL = async () => {
        try {
            const setting = await databaseManagers.userSettings.getByKey('serverUrl');
            if (setting) {
                let url = setting.value;
                setServerURL(url);
            }
        } catch (error) {
            console.error('Failed to fetch server URL:', error);
        }
    };
    
    const handleServerURLChange = (text: string) => {
        setServerURL(text);
    };

    const handleServerURLBlur = async () => {
        await saveServerURL();
    };

    const saveServerURL = async () => {
        try {
            let urlToSave = serverURL.trim();
            // Remove any protocol prefix if present
            urlToSave = urlToSave.replace(/^https?:\/\//, '');
            // Remove any port if present
            urlToSave = urlToSave.split(':')[0];

            const existingSetting = await databaseManagers.userSettings.getByKey('serverUrl');

            let newSetting: any = {
                settingKey: 'serverUrl',
                value: urlToSave,
                type: 'appSettings'
            };

            if (existingSetting && existingSetting.uuid) {
                newSetting.uuid = existingSetting.uuid;
            }

            await databaseManagers.userSettings.upsert(newSetting);
            console.log(`Server URL saved successfully: ${urlToSave}`);
        } catch (error) {
            console.error('Failed to save server URL:', error);
        }
    };

    const exportDatabase = async () => {
        try {
            const data: Record<string, any> = {};
            for (const table in databaseManagers) {
            if (Object.prototype.hasOwnProperty.call(databaseManagers, table)) {
                data[table] = await databaseManagers[table as keyof typeof databaseManagers].list();
            }
        }
            const jsonString = JSON.stringify(data);
            const path = FileSystem.documentDirectory + 'database_backup.json';
            await FileSystem.writeAsStringAsync(path, jsonString);
            showAlert('Success', `Database exported to ${path}`, () => {});
        } catch (error) {
            console.error('Failed to export database:', error);
            showAlert('Error', 'Failed to export database.', () => {});
        }
    };
    
    const importDatabase = async () => {
        const path = FileSystem.documentDirectory + 'database_backup.json';
        
        showAlert(
            'Confirm Import',
            `Are you sure you want to import the database from:\n${path}?`,
            async () => {
                setIsImporting(true);
                try {
                    const jsonString = await FileSystem.readAsStringAsync(path);
                    const data = JSON.parse(jsonString);
                    
                    for (const table in data) {
                        for (const item of data[table]) {
                        const manager = databaseManagers[table as keyof typeof databaseManagers];
                        if (manager) {
                            try {
                            if (table === 'userSettings') {
                                const existingItem = await databaseManagers.userSettings.getByKey(item.settingKey);
                                if (existingItem) {
                                continue;
                                } else {
                                await databaseManagers.userSettings.upsert(item);
                                }
                            } else {
                                await manager.upsert(item);
                            }
                            } catch (itemError) {
                                console.warn(`Failed to upsert item in ${table}:`, itemError);
                                // Continue with next item
                            }
                        }
                    }
                }
                    showAlert('Success', 'Database imported successfully', () => {});
                } catch (error) {
                    console.error('Failed to import database:', error);
                    showAlert('Error', 'Failed to import database.', () => {});
                } finally {
                    setIsImporting(false);
                }
            }
        );
    };
    
    const shareBackupFile = async () => {
        const path = FileSystem.documentDirectory + 'database_backup.json';
        
        try {
            const fileExists = await FileSystem.getInfoAsync(path);
            if (!fileExists.exists) {
                showAlert('Error', 'Backup file does not exist. Please export the database first.', () => {});
                return;
            }
        
            // Read the file contents
            const jsonString = await FileSystem.readAsStringAsync(path);
            
            // Parse and re-stringify with formatting
            const formattedJson = JSON.stringify(JSON.parse(jsonString), null, 2);
            
            // Write the formatted JSON back to a temporary file
            const tempPath = FileSystem.documentDirectory + 'formatted_backup.json';
            await FileSystem.writeAsStringAsync(tempPath, formattedJson);
        
            // Share the formatted file
            await Sharing.shareAsync(tempPath, { UTI: '.json', mimeType: 'application/json' });
            
            // Clean up the temporary file
            await FileSystem.deleteAsync(tempPath, { idempotent: true });
        } catch (error) {
            console.error('Failed to share backup file:', error);
            showAlert('Error', 'Failed to share backup file.', () => {});
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <View style={styles.buttonAndLabelContainer}>
                <Text style={styles.buttonLabel}>Export Backup</Text>
                <Pressable style={styles.button} onPress={exportDatabase}>
                    <FontAwesomeIcon icon={faFileExport} size={20} color={'gray'} />
                    {/* <Text style={styles.buttonText}>Export</Text> */}
                </Pressable>
                </View>
        
                <View style={styles.buttonAndLabelContainer}>
                <Text style={styles.buttonLabel}>Import Backup</Text>
                <Pressable 
                    style={styles.button} 
                    onPress={importDatabase}
                    disabled={isImporting}
                >
                    {isImporting ? (
                    <ActivityIndicator color={themeColors.hoverColor} />
                    ) : (
                    <>
                        <FontAwesomeIcon icon={faFileImport} size={20} color={'gray'} />
                        {/* <Text style={styles.buttonText}>Import</Text> */}
                    </>
                    )}
                </Pressable>
                </View>
        
                <View style={styles.buttonAndLabelContainer}>
                <Text style={styles.buttonLabel}>Share Backup</Text>
                <Pressable style={styles.button} onPress={shareBackupFile}>
                    <FontAwesomeIcon icon={faShareAlt} size={20} color={'gray'} />
                    {/* <Text style={styles.buttonText}>Share</Text> */}
                </Pressable>
                </View>
            </View>
            <View style={[styles.buttonContainer, { marginTop: 30 }]}>
                <View style={styles.buttonAndLabelContainer}>
                    <Text style={styles.buttonLabel}>Server URL</Text>
                    <TextInput
                        style={[designs.text.input, { marginBottom: 10 }]}
                        onChangeText={handleServerURLChange}
                        onBlur={handleServerURLBlur}
                        value={serverURL}
                        placeholder="192.168.1.46"
                        placeholderTextColor={'gray'}
                        keyboardType="numeric"
                    />
                </View>
            </View>
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

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        flexWrap: 'wrap',
    },
    buttonAndLabelContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        margin: 5,
    },
    buttonLabel: {
        color: 'gray',
        fontSize: 10,
        marginBottom: 5,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.borderColor,
        padding: 10,
        borderRadius: 10,
        minWidth: 90,
        justifyContent: 'center',
    },
});

export default ServerSection;