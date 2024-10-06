// DebugOverlay.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DayLayout } from './TaskCanvas';

interface DebugOverlayProps {
    dayLayouts: DayLayout[];
}

const DebugOverlay: React.FC<DebugOverlayProps> = ({ dayLayouts }) => {
    return (
        <View style={styles.overlayContainer} pointerEvents="none">
            {dayLayouts.map((day) => (
                <View 
                    key={day.date} 
                    style={[
                        styles.dropZone,
                        {
                            left: day.layout.x,
                            top: day.layout.y,
                            width: day.layout.width + 10, // Increased width for visibility
                            height: day.layout.height + 10, // Increased height for visibility
                        }
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // Temporary background for debugging (set to transparent)
        backgroundColor: 'rgba(0, 0, 0, 0.0)',
        // Ensure it's above other components
        zIndex: 1000,
    },
    dropZone: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: 'red',
        backgroundColor: 'rgba(255,0,0,0.2)', // Semi-transparent red for visibility
    },
});

export default DebugOverlay;
