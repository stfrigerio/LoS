import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Circle, Text, Line, Path } from 'react-native-svg';
import * as d3 from 'd3';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { MoodNoteData } from '../../../types/Mood';
import { moodColorMap } from '../colorMap';

interface MoodChartProps {
  moodData: MoodNoteData[];
  width: number;
  height: number;
}

type ProcessedMoodData = Omit<MoodNoteData, 'date'> & { date: Date };

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
    })) as ProcessedMoodData[];
  }, [moodData]);

  useEffect(() => {
    const x = d3.scaleTime()
      .domain(d3.extent(processedData, d => new Date(d.date)) as [Date, Date])
      .range([0, chartWidth]);
  
    const y = d3.scaleLinear()
      .domain([1, 10])  // Changed to fixed range 1-10
      .range([chartHeight, 0]);
  
    setChartDimensions({ x, y });
  }, [processedData, chartWidth, chartHeight]);

  const line = useMemo(() => {
    return d3.line<ProcessedMoodData>()
      .x(d => chartDimensions?.x(d.date) ?? 0)
      .y(d => chartDimensions?.y(d.rating) ?? 0)
      .defined(d => d.date != null && d.rating != null);
  }, [chartDimensions]);

  const colorScale = useMemo(() => {
    return d3.scaleLinear<string>()
      .domain([1, 5, 10])
      .range(['#FF6B6B', '#FFD93D', '#6BCB77'])
      .clamp(true);
  }, []);

  if (!chartDimensions) return null;

  return (
    <View style={[{ width, height }]}>
      <Svg width={width} height={height}>
        <G transform={`translate(${margin.left},${margin.top})`}>    
          {/* Horizontal grid lines */}
          {chartDimensions.y.ticks(10).map((tick, i) => (
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
          
          {/* Connecting lines between data points */}
          <Path
            d={line(processedData) ?? undefined}
            fill="none"
            stroke={themeColors.textColor}
            strokeWidth={1}
          />
          
          {/* Data points */}
          {processedData.map((mood, index) => (
            <Circle
              key={index}
              cx={chartDimensions.x(mood.date)}
              cy={chartDimensions.y(mood.rating)}
              r={4}
              fill={colorScale(mood.rating)}
            />
          ))}
          
          {/* Y-axis */}
          <Line
            x1={0}
            y1={0}
            x2={0}
            y2={chartHeight}
            stroke={themeColors.borderColor}
          />
          {chartDimensions.y.ticks(10).map((tick, i) => (
            <G key={i} transform={`translate(0,${chartDimensions.y(tick)})`}>
              <Text
                x={-9}
                dy=".32em"
                textAnchor="end"
                fill={themeColors.textColor}
                fontSize={10}
              >
                {tick}
              </Text>
            </G>
          ))}
          
          {/* X-axis (dates) */}
          <G transform={`translate(0,${chartHeight})`}>
            {chartDimensions.x.ticks(10).map((tick, i) => (
              <G key={i} transform={`translate(${chartDimensions.x(tick)},0)`}>
                <Text
                  y={9}
                  dy=".71em"
                  textAnchor="middle"
                  fill={themeColors.textColor}
                  fontSize={8}
                  transform="rotate(45)"
                >
                  {tick.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
                </Text>
              </G>
            ))}
          </G>
        </G>
      </Svg>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({

});

export default MoodChart;