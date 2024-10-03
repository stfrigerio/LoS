import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import * as d3 from 'd3';

import Axes from './components/Axes';
import Legend from './components/Legend';
import ChartToggle from './components/ChartToggle'

import { renderChart } from './renderChart';
import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { getRgbaOpacity, hexToRgba, isRgba } from '../colorMap';

import { QuantifiableHabitsChartProps, ChartData, ViewType } from './types/types';

let useColors: any;
if (Platform.OS === 'web') {
  useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
  useColors = require('@los/mobile/src/components/useColors').useColors;
}

type CircleData = {
  x: number;
  y: number;
  // color: string;
  habit: string;
};

const MemoizedChartToggle = React.memo(ChartToggle);
const MemoizedLegend = React.memo(Legend);
const MemoizedAxes = React.memo(Axes);

const QuantifiableHabitsChart: React.FC<QuantifiableHabitsChartProps> = ({ 
  data, 
  userSettings,
  onOpenNote,
  onOpenPeriodNote,
  defaultViewType = 'daily',
  periodType,
  width,
  height
}) => {
  const { themeColors, designs } = useThemeStyles();
  const styles = useMemo(() => getStyles(themeColors), [themeColors]);
  const { colors: tagColors, loading, error: colorError } = useColors();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paths, setPaths] = useState<{ [key: string]: string }>({});
  const [circles, setCircles] = useState<CircleData[]>([]);  
  const [viewType, setViewType] = useState<ViewType>(defaultViewType);
  const [chartDimensions, setChartDimensions] = useState<{
    x: d3.ScaleTime<number, number>;
    y: d3.ScaleLinear<number, number>;
  } | null>(null);

  const margin = useMemo(() => ({ top: 20, right: 20, bottom: 30, left: 20 }), []);
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const habits = useMemo(() => Object.keys(data).filter(key => key !== 'dates'), [data]);
  const [activeHabits, setActiveHabits] = useState<string[]>(habits);
  const [chartData, setChartData] = useState<ChartData>(data);

  const availableViewTypes = useMemo(() => {
    switch (periodType) {
      case 'week':
        return ['daily'] as ViewType[];
      case 'month':
        return ['daily', 'weekly'] as ViewType[];
      case 'quarter':
        return ['weekly', 'monthly'] as ViewType[];
      case 'year':
        return ['weekly', 'monthly', 'quarterly'] as ViewType[];
      default:
        return ['daily'] as ViewType[];
    }
  }, [periodType]);

  useEffect(() => {
    setIsLoading(true);
    const filteredData: ChartData = { dates: data.dates };
    activeHabits.forEach(habit => {
      if (habit in data) {
        filteredData[habit] = data[habit];
      }
    });
    setChartData(filteredData);
  }, [data, activeHabits]);

  const toggleHabit = useCallback((habit: string) => {
    setActiveHabits(prev => 
      prev.includes(habit) 
        ? prev.filter(h => h !== habit)
        : [...prev, habit]
    );
  }, []);

  const getColor = useCallback((habit: string): string => {
    let baseColor = tagColors[habit];
    if (!baseColor) {
      return 'white';
    }
    return isRgba(baseColor) ? getRgbaOpacity(baseColor, 1) : hexToRgba(baseColor, 0.5);
  }, [tagColors]);

  useEffect(() => {
    const renderChartData = async () => {
      try {
        if (Object.keys(tagColors).length > 0) {
          const { paths, circles, chartDimensions } = renderChart(chartData, viewType, chartWidth, chartHeight);
          setPaths(paths);
          setCircles(circles);
          setChartDimensions(chartDimensions);
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error('Error rendering chart:', err);
        setError('An error occurred while rendering the chart.');
        setIsLoading(false);
      }
    };

    renderChartData();
  }, [chartData, viewType, chartWidth, chartHeight, tagColors]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={designs.text.text}>Loading chart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MemoizedChartToggle
        availableViewTypes={availableViewTypes}
        viewType={viewType}
        setViewType={setViewType}
      />
      <MemoizedLegend 
        habits={habits}
        userSettings={userSettings}
        toggleHabit={toggleHabit}
        activeHabits={activeHabits}
      />
      {chartDimensions ? (
        <Svg width={width} height={height}>
          <G transform={`translate(${margin.left}, ${margin.top})`}>    
            {Object.entries(paths).map(([habit, d]) => {
              const color = getColor(habit);
              return (
                <Path
                  key={habit}
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                />
              );
            })}
            {circles.map((circle, index) => {
              const color = getColor(circle.habit);
              return (
                <Circle
                  key={index}
                  cx={circle.x}
                  cy={circle.y}
                  r={4}
                  fill={color}
                />
              );
            })}
            <MemoizedAxes 
              x={chartDimensions.x} 
              y={chartDimensions.y} 
              width={chartWidth} 
              height={chartHeight} 
              theme={themeColors} 
              viewType={viewType}
              data={data}
            />
          </G>
        </Svg>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to render chart. Please try again.</Text>
        </View>
      )}
    </View>
  );
};


const getStyles = (theme: any) => {
  const { width } = Dimensions.get('window');
  const isDesktop = width > 768;

  return StyleSheet.create({
    container: {
      marginVertical: 10,
      backgroundColor: theme.backgroundColor,
    },
    svgContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartToggle: {
      flexDirection: 'row',
      flexWrap: 'wrap', // Allow wrapping on smaller screens
      justifyContent: isDesktop? 'center' : 'center',
      marginBottom: 10,
    },
    chartButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      marginHorizontal: 3,
      borderRadius: 5,
    },
    activeChartButton: {
      backgroundColor: theme.accentColor,
    },
    chartButtonText: {
      marginLeft: 3, 
      color: theme.textColor,
      fontSize: 12,
    },
    activeChartButtonText: {
      color: 'gray',
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 300, // Adjust as needed
    },
    loadingText: {
      marginTop: 10,
    },
    errorContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 300,
    },
    errorText: {
      color: theme.errorColor || 'red',
      textAlign: 'center',
    },
  });
};

export default QuantifiableHabitsChart;