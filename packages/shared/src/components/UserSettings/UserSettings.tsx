import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';

import GeneralSettings from './components/GeneralSettings';
import DefaultTagsAndDescriptions from './components/DefaultTagsAndDescriptions'
import DailyNoteSettings from './components/DailyNoteSettings';
import Database from '../Database/Database';
import Navbar from '@los/shared/src/sharedComponents/NavBar';
import PillarManager from './components/Pillars';
import LibrarySettings from './components/LibrarySettings';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { useHomepage } from '../Home/helpers/useHomepage';

let NotificationManager: any
if (Platform.OS !== 'web') {
  NotificationManager = require('@los/mobile/src/components/UserSettings/components/NotificationManager').default;
}

const UserSettings: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);

  const { themeColors } = useThemeStyles();
  const styles = getStyles(themeColors);
  const { openHomepage } = useHomepage();

  const [screens, setScreens] = useState(['Tags', 'Pillars', 'General Settings', 'Database', 'Daily Settings']);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setScreens(['Tags', 'Pillars', 'General Settings', 'Database', 'Notifications', 'Daily Settings', 'Library Settings']);
    }
  }, []);

  const renderContent = () => {
    switch (pageIndex) {
      case 0:
        return <DefaultTagsAndDescriptions />;
      case 1:
        return <PillarManager />;
      case 2:
        return <GeneralSettings />;
      case 3:
        return <Database />
      case 4:
        return Platform.OS !== 'web' ? <NotificationManager /> : null;
      case 5:
        return <DailyNoteSettings />;
      case 6:
        return Platform.OS !== 'web' ? <LibrarySettings /> : null;
      default:
        return null;
    }
  };

  const navItems = useMemo(() => 
    screens.map((screen, index) => ({
      label: screen,
      onPress: () => setPageIndex(index),
    })),
    [screens]
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.content}>
        {renderContent()}
      </View>
      {navItems.length > 0 && (
        <Navbar
          items={navItems}
          activeIndex={pageIndex}
          title="User Settings"
          onBackPress={Platform.OS === 'web' ? openHomepage : undefined}
          screen="userSettings"
        />
      )}
    </View>
  );
};

const getStyles = (theme: any) => {
  const { width } = Dimensions.get('window');
  const isDesktop = width > 768;

  return StyleSheet.create({
    content: {
      flex: 1,
    },
    mainContainer: {
      marginTop: isDesktop ? 0 : 37,
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    button: {
      margin: 10,
      padding: 8,
      backgroundColor: theme.backgroundColor,
      borderRadius: 10,
      alignSelf: 'flex-start',
    },
    activeButton: {
      backgroundColor: theme.hoverColor,
    },
    text: {
      color: theme.textColor,
    },
    navBar: {
      flexDirection: 'row',
      flexWrap: 'wrap', 
      justifyContent: 'space-around',
      backgroundColor: theme.borderColor
    },
    pagerView: {
      flex: 1,
    },
  });
};

export default UserSettings;