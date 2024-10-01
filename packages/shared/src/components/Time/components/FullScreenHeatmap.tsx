import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, Pressable, Text, Dimensions, ScrollView } from 'react-native';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import TimeHeatmap from '../../Charts/Heatmaps/TimeHeatmap/TimeHeatmap';
import { ProcessedHourData } from '@los/shared/src/components/Charts/Sunburst/dataProcessing';
import * as ScreenOrientation from 'expo-screen-orientation';

interface FullScreenHeatmapProps {
    isVisible: boolean;
    onClose: () => void;
    data: ProcessedHourData[];
}

const FullScreenHeatmap: React.FC<FullScreenHeatmapProps> = ({ isVisible, onClose, data }) => {
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);

    const [dimensions, setDimensions] = useState(Dimensions.get('window'));
    const [isRotated, setIsRotated] = useState(false);

    useEffect(() => {
        const orientationChange = async () => {
            if (isVisible) {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
                setIsRotated(true);
            } else {
                await ScreenOrientation.unlockAsync();
                setIsRotated(false);
            }
        };

        orientationChange();

        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });

        return () => {
            subscription.remove();
            ScreenOrientation.unlockAsync();
        };
    }, [isVisible]);

    const handleClose = async () => {
        await ScreenOrientation.unlockAsync();
        setIsRotated(false);
        onClose();
    };

    const chartWidth = dimensions.width;
    const chartHeight = dimensions.height - 50; // Subtracting 50 for the close button

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={isVisible}
            onRequestClose={handleClose}
        >
            <View style={styles.container}>
                <ScrollView>
                    <Pressable style={styles.closeButton} onPress={handleClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </Pressable>
                    <View style={{ height: 50 }}/>
                    {isRotated && (
                        <TimeHeatmap
                            data={data}
                            width={chartWidth}
                            height={chartHeight}
                            fullScreen={true}
                        />
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
};

const getStyles = (themeColors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColors.backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 10,
        zIndex: 1,
    },
    closeButtonText: {
        color: themeColors.textColor,
        fontSize: 16,
    },
});

export default FullScreenHeatmap;