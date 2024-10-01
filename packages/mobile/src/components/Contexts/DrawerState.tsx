import React, { createContext, useState, useContext, useCallback } from 'react';

interface DrawerStateContextType {
  isLeftDrawerSwipeEnabled: boolean;
  isRightDrawerSwipeEnabled: boolean;
  setIsLeftDrawerSwipeEnabled: (enabled: boolean) => void;
  setIsRightDrawerSwipeEnabled: (enabled: boolean) => void;
  disableAllSwipeInteractions: () => void;
  enableAllSwipeInteractions: () => void;
}

const defaultDrawerState: DrawerStateContextType = {
  isLeftDrawerSwipeEnabled: true,
  isRightDrawerSwipeEnabled: true,
  setIsLeftDrawerSwipeEnabled: () => {},
  setIsRightDrawerSwipeEnabled: () => {},
  disableAllSwipeInteractions: () => {},
  enableAllSwipeInteractions: () => {},
};

export const DrawerStateContext = createContext<DrawerStateContextType>(defaultDrawerState);

export const DrawerStateManager = {
  disableAllSwipeInteractions: () => {},
  enableAllSwipeInteractions: () => {},
};

export const DrawerStateProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isLeftDrawerSwipeEnabled, setIsLeftDrawerSwipeEnabled] = useState(true);
  const [isRightDrawerSwipeEnabled, setIsRightDrawerSwipeEnabled] = useState(true);

  const disableAllSwipeInteractions = useCallback(() => {
    setIsLeftDrawerSwipeEnabled(false);
    setIsRightDrawerSwipeEnabled(false);
  }, []);

  const enableAllSwipeInteractions = useCallback(() => {
    setIsLeftDrawerSwipeEnabled(true);
    setIsRightDrawerSwipeEnabled(true);
  }, []);

  // Update the static manager with the current functions
  DrawerStateManager.disableAllSwipeInteractions = disableAllSwipeInteractions;
  DrawerStateManager.enableAllSwipeInteractions = enableAllSwipeInteractions;

  return (
    <DrawerStateContext.Provider 
      value={{ 
        isLeftDrawerSwipeEnabled, 
        isRightDrawerSwipeEnabled,
        setIsLeftDrawerSwipeEnabled, 
        setIsRightDrawerSwipeEnabled,
        disableAllSwipeInteractions,
        enableAllSwipeInteractions
      }}
    >
      {children}
    </DrawerStateContext.Provider>
  );
};

export const useDrawerState = () => useContext(DrawerStateContext);