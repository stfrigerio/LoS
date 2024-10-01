import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { databaseManagers } from './tables';
import { databaseManager} from './databaseManager';

import AlertModal from '@los/shared/src/components/modals/AlertModal';
import { defaultAppSettings } from '@los/shared/src/utilities/constants';
import { UserSettingData } from '@los/shared/src/types/UserSettings';

const DB_INITIALIZED_KEY = 'DB_INITIALIZED';

export const InitializeDatabasesWrapper = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        initializeDatabasesIfNeeded();
    }, []);

    const initializeDatabasesIfNeeded = async () => {
        try {
            const isInitialized = await AsyncStorage.getItem(DB_INITIALIZED_KEY);
            console.log('isInitialized:', isInitialized);

            if (isInitialized !== 'true') {
                try {
                    await databaseManager.initializeDatabase();
                    await Promise.all([
                        databaseManagers.tasks.initialize(),
                        databaseManagers.library.initialize(),
                        databaseManagers.money.initialize(),
                        databaseManagers.time.initialize(),
                        databaseManagers.dailyNotes.initialize(),
                        databaseManagers.userSettings.initialize(),
                        databaseManagers.booleanHabits.initialize(),
                        databaseManagers.quantifiableHabits.initialize(),
                        databaseManagers.mood.initialize(),
                        databaseManagers.text.initialize(),
                        databaseManagers.tags.initialize(),
                        databaseManagers.gpt.initialize(),
                        databaseManagers.journal.initialize(),
                        databaseManagers.people.initialize(),
                        databaseManagers.contact.initialize(),
                        databaseManagers.pillars.initialize(),
                        databaseManagers.objectives.initialize()
                    ]);

                    initializeAppSettings();
                    
                    await AsyncStorage.setItem(DB_INITIALIZED_KEY, 'true');
                    setModalTitle('Initialization Complete');
                    setModalMessage('Databases have been successfully initialized.');
                    setIsModalVisible(true);
                } catch (initError) {
                    console.error('Error during database initialization:', initError);
                    throw initError; // Re-throw to be caught by the outer catch block
                }
            } else {
                console.log('Databases already initialized');
                try {
                    await databaseManager.checkDatabaseConnection();
                    console.log('Database connection and integrity check successful');
                    
                    await AsyncStorage.setItem(DB_INITIALIZED_KEY, 'true');
                    setModalTitle('Initialization Complete');
                    setModalMessage('Databases have been successfully initialized.');
                } catch (checkError) {
                    console.error('Database integrity check failed:', checkError);
                    await AsyncStorage.setItem(DB_INITIALIZED_KEY, 'false');
                    throw new Error('Database integrity check failed after initialization');
                }
            }
        } catch (error) {
            console.error('Error initializing or checking databases:', error);
            await AsyncStorage.setItem(DB_INITIALIZED_KEY, 'false');
            
            try {
                console.log('Attempting to reinitialize databases...');
                await databaseManager.initializeDatabase();
                await Promise.all([
                    databaseManagers.tasks.initialize(),
                    databaseManagers.library.initialize(),
                    databaseManagers.money.initialize(),
                    databaseManagers.time.initialize(),
                    databaseManagers.dailyNotes.initialize(),
                    databaseManagers.userSettings.initialize(),
                    databaseManagers.booleanHabits.initialize(),
                    databaseManagers.quantifiableHabits.initialize(),
                    databaseManagers.mood.initialize(),
                    databaseManagers.text.initialize(),
                    databaseManagers.tags.initialize(),
                    databaseManagers.gpt.initialize(),
                    databaseManagers.journal.initialize(),
                    databaseManagers.people.initialize(),
                    databaseManagers.contact.initialize(),
                    databaseManagers.pillars.initialize(),
                    databaseManagers.objectives.initialize(),
                    databaseManagers.deletionLog.initialize()
                ]);

                initializeAppSettings();
                
                await AsyncStorage.setItem(DB_INITIALIZED_KEY, 'true');
                setModalTitle('Reinitialization Successful');
                setModalMessage('Databases have been successfully reinitialized');
            } catch (reinitError) {
                console.error('Reinitialization failed:', reinitError);
                setModalTitle('Initialization Failed');
                setModalMessage('An error occurred while reinitializing databases. Please restart the app and try again.');
            }

            setIsModalVisible(true);
        }
    };

    const initializeAppSettings = async () => {
        for (const [key, value] of Object.entries(defaultAppSettings)) {
            const existingSetting = await databaseManagers.userSettings.getByKey(key);
            if (!existingSetting) {
                const defaultSetting = {
                    settingKey: key,
                    value: JSON.stringify(value),
                    type: 'appSettings'
                } as UserSettingData;

                await databaseManagers.userSettings.upsert(defaultSetting);
            }
        }
    };

    return (
        <AlertModal
            isVisible={isModalVisible}
            title={modalTitle}
            message={modalMessage}
            onConfirm={() => setIsModalVisible(false)}
            onCancel={() => setIsModalVisible(false)}
        />
    );
};