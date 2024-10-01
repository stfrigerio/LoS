import React, { useMemo } from 'react';
import { View, Dimensions, Text, Platform } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

let useColors: any;
if (Platform.OS === 'web') {
    useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
    useColors = require('@los/mobile/src/components/useColors').useColors;
}


interface HeatmapChartProps {
    data: { [date: string]: boolean };
    width?: number;
    height?: number;
    habitName: string;
    isYearView?: boolean;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BooleansHeatmap: React.FC<HeatmapChartProps> = ({ 
    data, 
    habitName,
    width, 
    height,
}) => {
    const { themeColors } = useThemeStyles();
    const windowDimensions = Dimensions.get('window');
    const chartWidth = width || windowDimensions.width;
    const chartHeight = height || 200;
    const { colors: tagColors } = useColors();

    const trueColor = tagColors[habitName] || themeColors.hoverColor;
    const falseColor = themeColors.borderColor;
    const noDataColor = themeColors.backgroundColor;

    const { startDate, endDate, daysToShow, weeksToShow, startDayOffset } = useMemo(() => {
        const dates = Object.keys(data).sort();
        const start = new Date(dates[0]);
        const end = new Date(dates[dates.length - 1]);
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const weeksDiff = Math.ceil(daysDiff / 7);
        const startDayOffset = start.getDay(); // 0 for Sunday, 1 for Monday, etc.
        return { 
            startDate: start, 
            endDate: end, 
            daysToShow: daysDiff, 
            weeksToShow: weeksDiff,
            startDayOffset: (startDayOffset + 6) % 7 // Adjust so Monday is 0, Sunday is 6
        };
    }, [data]);

    const cellSize = Math.min(Math.floor(chartHeight / 7) - 1, Math.floor((chartWidth - 30) / weeksToShow) - 1);
    const cellGap = 1;
    const monthLabelWidth = 20;

    return (
        <View style={{ width: chartWidth, height: chartHeight + 30, marginVertical: 20 }}>
            <Svg width={chartWidth} height={chartHeight + 40}>
            {MONTHS.map((month, index) => {
                    const firstDayOfMonth = new Date(startDate.getFullYear(), index, 1);
                    const weekIndex = Math.floor((firstDayOfMonth.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
                    return (
                        <SvgText
                            key={month}
                            x={weekIndex * (cellSize + cellGap) + 45 + cellSize / 2}
                            y={0}
                            fontSize={10}
                            fill={themeColors.textColor}
                        >
                            {month}
                        </SvgText>
                    );
                })}
                {DAYS_OF_WEEK.map((day, index) => (
                    <SvgText
                        key={day}
                        x={25}
                        y={(cellSize + cellGap) * index + cellSize / 2 + monthLabelWidth}
                        fontSize={10}
                        fill={themeColors.textColor}
                        textAnchor="end"
                        alignmentBaseline="middle"
                    >
                        {day}
                    </SvgText>
                ))}

                {Array.from({ length: daysToShow }).map((_, index) => {
                    const date = new Date(startDate);
                    date.setDate(date.getDate() + index);
                    const dateString = date.toISOString().split('T')[0];
                    const dayOfWeek = (startDayOffset + index) % 7;
                    const weekIndex = Math.floor((startDayOffset + index) / 7);

                    const hasData = dateString in data;
                    const isTrue = hasData && data[dateString];
                    const fillColor = hasData ? (isTrue ? trueColor : falseColor) : noDataColor;

                    return (
                        <Rect
                            key={dateString}
                            x={weekIndex * (cellSize + cellGap) + 30}
                            y={dayOfWeek * (cellSize + cellGap) + monthLabelWidth}
                            width={cellSize - 4}
                            height={cellSize - 4}
                            fill={fillColor}
                            stroke={'transparent'}
                            rx={4}
                            ry={4}
                            strokeWidth={0.5}
                        />
                    );
                })}
            </Svg>
        </View>
    );
};

export default BooleansHeatmap;