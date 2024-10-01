import React, { useEffect, useState } from 'react';
import { View, Platform, StyleSheet, LayoutAnimation, ViewStyle, Animated } from 'react-native';

interface CollapsibleProps {
  children: React.ReactNode;
  collapsed: boolean;
  style?: ViewStyle;
}

const Collapsible: React.FC<CollapsibleProps> = ({ children, collapsed, style }) => {
  const [height] = useState(new Animated.Value(collapsed ? 0 : 1));
  const [measured, setMeasured] = useState(false);

  useEffect(() => {
    if (measured) {
      Animated.timing(height, {
        toValue: collapsed ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [collapsed, measured]);

  const onLayout = (event: any) => {
    if (!measured) {
      height.setValue(collapsed ? 0 : 1);
      setMeasured(true);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <div style={{ 
        maxHeight: collapsed ? 0 : 1000,
        opacity: collapsed ? 0 : 1,
        overflow: 'hidden',
        transition: 'all 300ms ease-in-out',
        ...(style as React.CSSProperties)
      }}>
        {children}
      </div>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          maxHeight: height.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1000]
          }),
          opacity: height
        }, 
        style
      ]}
      onLayout={onLayout}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default Collapsible;