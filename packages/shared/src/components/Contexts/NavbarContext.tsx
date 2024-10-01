import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Keyboard, Animated } from 'react-native';

interface NavbarContextType {
    isOpen: boolean;
    toggleDrawer: () => void;
    keyboardVisible: boolean;
    setKeyboardVisible: (visible: boolean) => void;
    slideAnim: Animated.Value;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const NavbarDrawerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const slideAnim = useState(new Animated.Value(0))[0];

    const toggleDrawer = () => setIsOpen(!isOpen);

    const handleKeyboardVisibility = useCallback((visible: boolean) => {
        setKeyboardVisible(visible);
    }, []);

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: keyboardVisible ? 100 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [keyboardVisible, slideAnim]);

    return (
        <NavbarContext.Provider value={{ isOpen, toggleDrawer, keyboardVisible, setKeyboardVisible: handleKeyboardVisibility, slideAnim }}>
            {children}
        </NavbarContext.Provider>
    );
};

export const useNavbarDrawer = () => {
    const context = useContext(NavbarContext);
    if (context === undefined) {
        throw new Error('useNavbarDrawer must be used within a NavbarDrawerProvider');
    }
    return context;
};