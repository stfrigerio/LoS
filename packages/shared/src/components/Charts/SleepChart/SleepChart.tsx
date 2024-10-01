import React, { useMemo } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions, Dimensions } from 'react-native';
import Svg, { G, Path, Circle, Text, Line } from 'react-native-svg';
import * as d3 from 'd3';
import { format, parse } from 'date-fns';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { parseTimeToDecimal } from '../../../utilities/timeUtils';

import { SleepData } from '../../PeriodicNote/types/Sleep';

interface SleepChartProps {
  sleepData: SleepData[];
  openNoteForDay: (targetDate: string) => void;
  width?: number;
  height?: number;
  isMonthView?: boolean;
}

const SleepChart: React.FC<SleepChartProps> = ({ sleepData, openNoteForDay, width: propWidth, height: propHeight, isMonthView }) => {
  const { theme, themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);

  const { width: windowWidth } = useWindowDimensions();
  const width = propWidth || windowWidth;
  const height = propHeight || 300;

  const chartData = useMemo(() => {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .domain([18, 42]) // 18:00 to 18:00 next day (42 is 18 + 24)
      .range([0, chartWidth]);

    const yDomain = sleepData.map(d => d.date);
    const yScale = d3.scaleBand()
      .domain(yDomain)
      .range([0, chartHeight])
      .paddingInner(1)
      .paddingOuter(0.5);

    const xAxisTicks = d3.range(18, 43, 3).map(hour => ({
      value: hour,
      label: (hour % 24).toString().padStart(2, '0')
    }));

    const desiredLabelCount = 10;
    const yAxisTicks = d3.ticks(0, yDomain.length - 1, desiredLabelCount)
      .map(i => Math.round(i))
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .map(i => {
        const date = parse(yDomain[i], 'yyyy-MM-dd', new Date());
        return { 
          value: yScale(yDomain[i])!, 
          label: format(date, 'MM-dd')
        };
      });

    const gridLines = d3.range(18, 43).map(hour => xScale(hour));

    const sleepPaths = sleepData.map((dayData, index) => {
      if (!dayData.sleep_time || !dayData.wake_hour) return null;

      const yValue = yScale(dayData.date);
      if (yValue === undefined) return null;

      let sleepHour = parseTimeToDecimal(dayData.sleep_time);
      let wakeHour = parseTimeToDecimal(dayData.wake_hour);
      if (wakeHour < sleepHour) wakeHour += 24;

      const peakHeight = chartHeight * 0.10;
      const adjustedYValue = yValue + yScale.bandwidth() / 2;

      const areaPointsTopEdgeExtended: [number, number][] = [
        [xScale.range()[0], adjustedYValue + yScale.bandwidth() / 2],
        [xScale(sleepHour), adjustedYValue + yScale.bandwidth() / 2],
        [xScale((sleepHour + wakeHour) / 2), adjustedYValue + yScale.bandwidth() / 2 - peakHeight],
        [xScale(wakeHour), adjustedYValue + yScale.bandwidth() / 2],
        [xScale.range()[1], adjustedYValue + yScale.bandwidth() / 2]
      ];

      const areaGenerator = d3.area()
        .x(d => d[0])
        .y0(adjustedYValue + yScale.bandwidth())
        .y1(d => d[1])
        .curve(d3.curveMonotoneX);

      const lineGenerator = d3.line()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveMonotoneX);

      return {
        areaPath: areaGenerator(areaPointsTopEdgeExtended),
        linePath: lineGenerator(areaPointsTopEdgeExtended),
        sleepCircle: { cx: xScale(sleepHour), cy: adjustedYValue },
        wakeCircle: { cx: xScale(wakeHour), cy: adjustedYValue },
        id: index,
        dayData
      };
    }).filter(Boolean);

    return { margin, chartWidth, chartHeight, xScale, yScale, xAxisTicks, yAxisTicks, gridLines, sleepPaths };
  }, [sleepData, width, height]);

  const handlePress = (dayData: SleepData) => {
    openNoteForDay(dayData.date);
  };

  return (
    <Svg width={width} height={height}>
      <G transform={`translate(${chartData.margin.left},${chartData.margin.top})`}>
        {/* X-axis */}
        {chartData.xAxisTicks.map(tick => (
          <Text
            key={`x-axis-${tick.value}`}
            x={chartData.xScale(tick.value)}
            y={chartData.chartHeight + 20}
            fontSize="10"
            textAnchor="middle"
            fill={styles.tickText.fill}
          >
            {tick.label}
          </Text>
        ))}

        {/* Y-axis */}
        {chartData.yAxisTicks.map(tick => (
          <Text
            key={`y-axis-${tick.label}`}
            x={-10}
            y={tick.value}
            fontSize="10"
            textAnchor="end"
            fill={styles.tickText.fill}
          >
            {tick.label}
          </Text>
        ))}

        {/* Grid lines */}
        {chartData.gridLines.map((x, i) => (
          <Line
            key={`grid-line-${i}`}
            x1={x}
            y1={0}
            x2={x}
            y2={chartData.chartHeight}
            stroke={styles.tickLine.stroke}
            strokeDasharray="2,2"
          />
        ))}

        {/* Sleep paths */}
        {chartData.sleepPaths.map(path => {
          if (!path) return null; // Skip if path is null

          return (
            <G key={`sleep-path-${path.id}`}>
              {path.areaPath && (
                <Path
                  d={path.areaPath}
                  {...styles.areaPath}
                />
              )}
              {path.linePath && (
                <Path
                  d={path.linePath}
                  {...styles.linePath}
                />
              )}
              <Circle
                cx={path.sleepCircle.cx}
                cy={path.sleepCircle.cy}
                r={3}
                {...styles.circle}
              />
              <Circle
                cx={path.wakeCircle.cx}
                cy={path.wakeCircle.cy}
                r={3}
                {...styles.circle}
              />
              {path.areaPath && (
                <Path
                  d={path.areaPath}
                  fill="transparent"
                />
              )}
            </G>
          );
        })}
      </G>
    </Svg>
  );
};

const getStyles = (theme: any) => {
  const { width } = Dimensions.get('window');
  const isSmall = width > 768;
  const isDesktop = Platform.OS === 'web';

  return {
    svg: {
      fontFamily: 'Arial',
    },
    path: {
      strokeWidth: 1,
    },
    axisDomain: {
      fill: 'none',
      stroke: theme.borderColor,
    },
    ridgeLine: {
      stroke: theme.borderColor,
    },
    tickText: {
      fill: '#828282',
    },
    tickLine: {
      stroke: theme.borderColor,
    },
    areaPath: {
      fill: 'rgba(140, 237, 215, 0.4)',
      opacity: 0.6,
    },
    linePath: {
      fill: 'none',
      stroke: 'rgba(100, 200, 180, 0.8)',
      strokeWidth: 1.5,
    },
    circle: {
      fill: 'rgba(100, 200, 180, 0.5)',
    },
  };
};

export default SleepChart;