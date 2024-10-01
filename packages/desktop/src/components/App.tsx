import React from 'react';
import { View, StyleSheet } from 'react-native';

import ElectronContext from './contexts/ElectronContext';
import useDebugContexts from '../electron/useDebugContexts'
import { NavbarDrawerProvider } from '@los/shared/src/components/Contexts/NavbarContext';

import AppRouter from './AppRouter';

import { ThemeProvider } from '@los/shared/src/styles/ThemeContext';
import { enableDebugContext } from '../electron/main/logger';

import '../styles/main.css';

function App() {
  useDebugContexts(enableDebugContext);

  return (
    <View style={styles.container}>
      <ElectronContext.Provider value={window.electron}>
        <ThemeProvider>
          <NavbarDrawerProvider>
            <AppRouter />
          </NavbarDrawerProvider>
        </ThemeProvider>
      </ElectronContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
});

export default App;
