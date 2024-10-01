import React, { useMemo, useState } from 'react';
import { View, Dimensions, Platform, StyleSheet } from 'react-native';
import Svg, { Rect, Text, G } from 'react-native-svg';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { ProcessedHourData } from '@los/shared/src/components/Charts/Sunburst/dataProcessing';

let useColors: any;
if (Platform.OS === 'web') {
    useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
    useColors = require('@los/mobile/src/components/useColors').useColors;
}

interface HeatmapChartProps {
    data: ProcessedHourData[];
    width?: number;
    height?: number;
    fullScreen?: boolean;
}

const TimeHeatmap: React.FC<HeatmapChartProps> = ({ data, width, height, fullScreen = false }) => {
    const { themeColors } = useThemeStyles();
    const { colors: tagColors} = useColors();
    const styles = getStyles(themeColors);

    const [selectedCells, setSelectedCells] = useState<Array<{ day: string; hour: number }>>([]);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

    const windowDimensions = Dimensions.get('window');
    const chartWidth = width || windowDimensions.width;
    const chartHeight = height || 300;

    const days = useMemo(() => [...new Set(data.map(d => d.date))].sort(), [data]);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Calculate dimensions based on data size
    const cellWidth = Math.max(chartWidth / (hours.length + 2), 10);
    const cellHeight = Math.max(chartHeight / (days.length + 3), 5);
    const rowGap = 2; // Adjust this value to control the gap between rows
    const hourLabelYPosition = (cellHeight + rowGap) * days.length + 10; // 20 is a fixed offset
    const processedChartHeight = (cellHeight + rowGap) * days.length + 20;

    // Group data by date for faster lookup
    const dataByDate = useMemo(() => {
        return data.reduce((acc, item) => {
            if (!acc[item.date]) acc[item.date] = {};
            acc[item.date][item.hour] = item;
            return acc;
        }, {} as Record<string, Record<number, ProcessedHourData>>);
    }, [data]);

    const handleCellPress = (day: string, hour: number, x: number, y: number) => {
        const cellData = dataByDate[day]?.[hour];
        if (!cellData) return;

        const selectedTag = cellData.dominantTag;
        if (!selectedTag) return;

        const adjacentCells = [{ day, hour }];
        
        // Check left
        for (let h = hour - 1; h >= 0; h--) {
            if (dataByDate[day]?.[h]?.dominantTag === selectedTag) {
                adjacentCells.push({ day, hour: h });
            } else {
                break;
            }
        }
        
        // Check right
        for (let h = hour + 1; h < 24; h++) {
            if (dataByDate[day]?.[h]?.dominantTag === selectedTag) {
                adjacentCells.push({ day, hour: h });
            } else {
                break;
            }
        }

        setSelectedCells(adjacentCells);

        // Calculate tooltip position
        const tooltipWidth = 160;
        const tooltipHeight = 50;
        const spaceAbove = y;
        const spaceBelow = processedChartHeight - y - cellHeight;
        const spaceLeft = x;
        const spaceRight = chartWidth - x - cellWidth;
        
        let tooltipX, tooltipY;
        if (spaceAbove >= tooltipHeight || spaceAbove > spaceBelow) {
            // Position tooltip above
            tooltipY = y - tooltipHeight - 20;
        } else {
            // Position tooltip below
            tooltipY = y + cellHeight + 10;
        }

        // Horizontal positioning
        if (spaceLeft >= tooltipWidth / 2 && spaceRight >= tooltipWidth / 2) {
            // Center the tooltip horizontally
            tooltipX = x + cellWidth / 2;
        } else if (spaceLeft < tooltipWidth / 2) {
            // Align tooltip to the left edge of the chart with a small margin
            tooltipX = tooltipWidth / 2 + 10;
        } else {
            // Align tooltip to the right edge of the chart with a small margin
            tooltipX = chartWidth - tooltipWidth / 2 - 10;
        }

        setTooltipPosition({ x: tooltipX, y: tooltipY });
    };

    const formatDuration = (durationInHours: number) => {
        const hours = Math.floor(durationInHours);
        const minutes = Math.round((durationInHours - hours) * 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <View style={[{ width: chartWidth, height: processedChartHeight, marginVertical: 20 }, styles.container]}>
            <Svg width={chartWidth} height={processedChartHeight} style={{ marginTop: 0 }}>
                {/* Day labels and heatmap cells */}
                {days.map((day, dayIndex) => (
                    <G key={day} transform={`translate(4, ${(cellHeight + rowGap) * dayIndex})`}>
                        <Text
                            x={cellWidth / 2}
                            y={cellHeight / 3.3}
                            fontSize={6}
                            fill={'gray'}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                        >
                            {(() => {
                                const date = new Date(day);
                                const dayOfMonth = date.getDate();
                                if (dayOfMonth === 1) {
                                    // If it's the first day of the month, show month abbreviation and day
                                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                }
                                return dayOfMonth;
                            })()}
                        </Text>
                        {hours.map(hour => {
                            const cellData = dataByDate[day]?.[hour];
                            const cellColor = cellData && cellData.dominantTag 
                                ? tagColors[cellData.dominantTag] || themeColors.backgroundColor
                                : themeColors.backgroundColor;
                            const opacity = cellData ? 1 : 0.1;
                            const isSelected = selectedCells.some(cell => cell.day === day && cell.hour === hour);
                            return (
                                <G key={`${day}-${hour}`}>
                                    <Rect
                                        x={cellWidth * (hour + 1.5)}
                                        y={0}
                                        width={cellWidth - 1}
                                        height={cellHeight - 1}
                                        fill={cellColor}
                                        stroke={isSelected ? themeColors.hoverColor : themeColors.borderColor}
                                        strokeWidth={isSelected ? 2 : 0.5}
                                        opacity={opacity}
                                        rx={Math.min(cellWidth / 4, 2)}
                                        ry={Math.min(cellHeight / 4, 2)}
                                        onPress={() => handleCellPress(day, hour, cellWidth * (hour + 1.5), (cellHeight + rowGap) * dayIndex)}
                                    />
                                    {fullScreen && cellData && cellData.dominantTag && cellWidth > 15 && (
                                        <Text
                                            x={cellWidth * (hour + 2)}
                                            y={cellHeight / 2}
                                            fontSize={4}
                                            fontWeight={'bold'}
                                            fill={'black'}
                                            textAnchor="middle"
                                            alignmentBaseline="middle"
                                        >
                                            {cellData.dominantDescription}
                                        </Text>
                                    )}
                                </G>
                            );
                        })}
                    </G>
                ))}
                {/* Hour labels */}
                {hours.map(hour => (
                    <Text
                        key={`hour-${hour}`}
                        x={cellWidth * (hour + 2.3)}
                        y={hourLabelYPosition}
                        fontSize={6}
                        fill="gray"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                    >
                        {hour.toString().padStart(2, '0')}
                    </Text>
                ))}
                {/* Tooltip */}
                {selectedCells.length > 0 && tooltipPosition && (
                    <G>
                        <Rect
                            x={tooltipPosition.x - 160 / 2}
                            y={tooltipPosition.y}
                            width={140}
                            height={60}
                            fill={themeColors.backgroundColor}
                            stroke={themeColors.textColor}
                            strokeWidth={0.4}
                            rx={4}
                            ry={4}
                        />
                        <Text
                            x={tooltipPosition.x - 10}
                            y={tooltipPosition.y + 15}
                            fontSize={10}
                            fontWeight="bold"
                            fill={themeColors.textColor}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                        >
                            {selectedCells[0] && dataByDate[selectedCells[0].day]?.[selectedCells[0].hour]?.dominantTag || 'No data'}
                        </Text>
                        <Text
                            x={tooltipPosition.x - 10}
                            y={tooltipPosition.y + 30}
                            fontSize={8}
                            fill={themeColors.textColor}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                        >
                            {selectedCells[0] && dataByDate[selectedCells[0].day]?.[selectedCells[0].hour]?.dominantDescription || ''}
                        </Text>
                        <Text
                            x={tooltipPosition.x - 10}
                            y={tooltipPosition.y + 45}
                            fontSize={8}
                            fill={themeColors.textColor}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                        >
                            {(() => {
                                const totalDuration = selectedCells.reduce((total, cell) => {
                                    const cellDuration = dataByDate[cell.day]?.[cell.hour]?.totalDuration || 0;
                                    return total + cellDuration;
                                }, 0);
                                return `Total Duration: ${formatDuration(totalDuration)}`;
                            })()}
                        </Text>
                    </G>
                )}
            </Svg>
        </View>
    );
};

const getStyles = (theme: any) => {
    const { width } = Dimensions.get('window');
    const isDesktop = Platform.OS === 'web';

    return StyleSheet.create({
        container: {
            // borderWidth: 1,
            // borderColor: 'red',
        },
    });
};

export default TimeHeatmap;

