import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Circle, Text, Line } from 'react-native-svg';
import * as d3 from 'd3';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { MoodNoteData } from '../../../types/Mood';
import { moodColorMap } from '../colorMap';

interface MoodChartProps {
    moodData: MoodNoteData[];
    width: number;
    height: number;
}

const MoodChart: React.FC<MoodChartProps> = ({ moodData, width, height }) => {
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);
    const [chartDimensions, setChartDimensions] = useState<{
        x: d3.ScaleTime<number, number>;
        y: d3.ScaleLinear<number, number>;
    } | null>(null);

    const margin = { top: 20, right: 20, bottom: 30, left: 20 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const processedData = useMemo(() => {
        return moodData.map(mood => ({
        ...mood,
        date: new Date(mood.date),
        tag: mood.tag || 'untagged'
        }));
    }, [moodData]);

    useEffect(() => {
        const x = d3.scaleTime()
        .domain(d3.extent(processedData, d => new Date(d.date)) as [Date, Date])
        .range([0, chartWidth]);
    
        const y = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.rating) || 0])
        .range([chartHeight, 0]);
    
        setChartDimensions({ x, y });
    }, [processedData, chartWidth, chartHeight]);

    if (!chartDimensions) return null;

    return (
        <View style={[{ width, height }]}>
        <Svg width={width} height={height}>
            <G transform={`translate(${margin.left},${margin.top})`}>    
            {chartDimensions.x.ticks(5).map((tick, i) => (
                <Line
                key={`gridX-${i}`}
                x1={chartDimensions.x(tick)}
                y1={0}
                x2={chartDimensions.x(tick)}
                y2={chartHeight}
                stroke={themeColors.textColor}
                strokeOpacity={0.1}
                />
            ))}
            {chartDimensions.y.ticks(5).map((tick, i) => (
                <Line
                key={`gridY-${i}`}
                x1={0}
                y1={chartDimensions.y(tick)}
                x2={chartWidth}
                y2={chartDimensions.y(tick)}
                stroke={themeColors.textColor}
                strokeOpacity={0.1}
                />
            ))}        
            {processedData.map((mood, index) => (
                <Circle
                key={index}
                cx={chartDimensions.x(new Date(mood.date))}
                cy={chartDimensions.y(mood.rating)}
                r={mood.rating}
                fill={moodColorMap[mood.tag]}
                />
            ))}
            {/* X-axis */}
            <Line
                x1={0}
                y1={chartHeight}
                x2={chartWidth}
                y2={chartHeight}
                stroke={themeColors.borderColor}
            />
            <G transform={`translate(0,${chartHeight})`}>
                {chartDimensions.x.ticks(5).map((tick, i) => (
                <G key={i} transform={`translate(${chartDimensions.x(tick)},0)`}>
                <Line y2={6} stroke={'gray'} />
                <Text
                    y={9}
                    dy=".71em"
                    textAnchor="middle"
                    fill={'gray'}
                    fontSize={10}
                >
                    {tick.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
                </Text>
                </G>
                ))}
            </G>
            {/* Y-axis */}
            <Line
                x1={0}
                y1={0}
                x2={0}
                y2={chartHeight}
                stroke={themeColors.borderColor}
            />
            {chartDimensions.y.ticks(5).map((tick, i) => (
                <G key={i} transform={`translate(0,${chartDimensions.y(tick)})`}>
                <Line x2={-6} stroke={'gray'} />
                <Text
                x={-9}
                dy=".32em"
                textAnchor="end"
                fill={'gray'}
                fontSize={10}
                >
                {tick}
                </Text>
                </G>
            ))}
            </G>
        </Svg>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({

});

export default MoodChart;