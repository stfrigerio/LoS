import React from 'react';
import { View, Text as RNText } from 'react-native';
import RNSlider from '@react-native-community/slider';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

interface SliderProps {
    data: any[]; // Add this
    visibleNodes: number;
    setVisibleNodes: (value: number) => void;
}


const Slider: React.FC<SliderProps> = ({ data, visibleNodes, setVisibleNodes }) => {
    const { themeColors } = useThemeStyles();

    return (
        <View style={{ marginHorizontal: 20, marginTop: 10 }}>
            <RNSlider
                style={{width: '100%', height: 40}}
                minimumValue={1}
                maximumValue={data.length}
                step={1}
                value={visibleNodes}
                onValueChange={setVisibleNodes}
                minimumTrackTintColor={themeColors.hoverColor}
                maximumTrackTintColor="#000000"
            />
            <RNText style={{ textAlign: 'center', color: themeColors.textColor }}>
                Visible Nodes: {visibleNodes}
            </RNText>
        </View>
    )
}

export default Slider;