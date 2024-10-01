import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Linking } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLocationDot, faMapLocation } from '@fortawesome/free-solid-svg-icons';


import { UniversalModal } from '@los/shared/src/sharedComponents/UniversalModal';
import { FormInput } from '@los/shared/src/components/modals/components/FormComponents';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface CarLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CarLocationModal: React.FC<CarLocationModalProps> = ({ isOpen, onClose }) => {
    const [location, setLocation] = useState<string | null>(null);
    const { theme, themeColors, designs } = useThemeStyles();
    const styles = getStyles(themeColors);

    useEffect(() => {
        if (isOpen) {
            getCarLocation();
        }
    }, [isOpen]);

    const saveCarLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access location was denied');
            return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        const locationString = `${currentLocation.coords.latitude},${currentLocation.coords.longitude}`;
        await AsyncStorage.setItem('@car_location', locationString);
        setLocation(locationString);
    };

    const getCarLocation = async () => {
        const savedLocation = await AsyncStorage.getItem('@car_location');
        if (savedLocation) {
            setLocation(savedLocation);
        } else {
            setLocation(null);
        }
    };

    const openInMaps = () => {
        if (location) {
            const url = Platform.select({
                ios: `maps:0,0?q=${location}`,
                android: `geo:0,0?q=${location}`,
                web: `https://www.google.com/maps/search/?api=1&query=${location}`
            });
            if (url) {
                Linking.openURL(url);
            }
        }
    };

    let parsedLocation = null;
    if (location) {
        const [lat, lng] = location.split(',').map(Number);
        parsedLocation = `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
    }

    const modalContent = (
        <View>
            <Text style={[designs.text.title, styles.title]}>🚗 Car Location</Text>
            
            <FormInput
                label="Saved Location"
                value={parsedLocation || 'No location saved'}
                editable={false}
            />
            
            <View style={styles.buttonContainer}>
                <Pressable style={[styles.button]} onPress={saveCarLocation}>
                    <FontAwesomeIcon icon={faMapLocation} size={20} color={themeColors.hoverColor} style={{ marginRight: 15 }} />
                    <Text style={designs.text.text}>Save Current Location</Text>
                </Pressable>
                {location && (
                    <Pressable style={[styles.button]} onPress={openInMaps}>
                        <FontAwesomeIcon icon={faLocationDot} size={20} color={themeColors.hoverColor} style={{ marginRight: 15 }} />
                        <Text style={designs.text.text}>Open in Maps</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );

    return (
        <UniversalModal isVisible={isOpen} onClose={onClose} modalViewStyle='default'>
            {modalContent}
        </UniversalModal>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    title: {
        marginBottom: 30,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        marginTop: 20,
        borderWidth: 0.2,
        borderColor: theme.textColor,
        borderRadius: 5,
        padding: 10,
    },
});

export default CarLocationModal;