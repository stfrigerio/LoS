import React, { useRef } from 'react';
import { View, Dimensions, StyleSheet, Platform } from 'react-native';
import Svg, { Path, G, Text } from 'react-native-svg';
import * as d3 from 'd3';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { colorPalette, adjustRgbaOpacity, hexToRgba, isRgba } from '../colorMap';

export interface SunBurstRecord {
  name: string;
  size?: number;
  children?: SunBurstRecord[];
}
  
interface SunburstChartProps {
  data: SunBurstRecord;
  width?: number;
  height?: number;
}

let useColors: any;
if (Platform.OS === 'web') {
  useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
  useColors = require('@los/mobile/src/components/useColors').useColors;
}

const SunburstChart: React.FC<SunburstChartProps> = ({ data, width, height }) => {
  const { themeColors, designs } = useThemeStyles();
  const styles = getStyles(themeColors);
  const { colors: tagColors, loading, error } = useColors();

  const windowDimensions = Dimensions.get('window');
  const chartWidth = width || windowDimensions.width;
  const chartHeight = height || 300;
  const radius = Math.min(chartWidth, chartHeight) / 2;

  const randomColorMap = useRef(new Map<string, string>()).current;
  const defaultColorIndex = useRef(0);

  const root = d3.hierarchy(data)
    .sum(d => d.size ?? 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  
  const partition = d3.partition<SunBurstRecord>()
    .size([2 * Math.PI, radius * radius]);

  const nodes = partition(root).descendants();

  const arcGenerator = d3.arc<d3.HierarchyRectangularNode<SunBurstRecord>>()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .innerRadius(d => Math.sqrt(d.y0))
    .outerRadius(d => Math.sqrt(d.y1));

  const getColor = (node: d3.HierarchyRectangularNode<SunBurstRecord>): string => {
    let ancestor = node;
    while (ancestor.depth > 1) ancestor = ancestor.parent!;
    let baseColor = tagColors[ancestor.data.name];
    
    if (!baseColor) {
      if (!randomColorMap.has(ancestor.data.name)) {
        baseColor = colorPalette[defaultColorIndex.current % colorPalette.length];
        randomColorMap.set(ancestor.data.name, baseColor);
        defaultColorIndex.current += 1;
      } else {
        baseColor = randomColorMap.get(ancestor.data.name) ?? colorPalette[0];
      }
    }
  
    const opacity = node.depth === 1 ? 0.5 : 0.3;
  
    return isRgba(baseColor)
      ? adjustRgbaOpacity(baseColor, opacity)
      : hexToRgba(baseColor, opacity);
  };

  const getLabelProps = (node: d3.HierarchyRectangularNode<SunBurstRecord>) => {
    const angle = node.x1 - node.x0;
    const threshold = 0.12;

    if (angle > threshold) {
      const midAngle = node.x0 + (angle / 2);
      const angleInRadians = midAngle - Math.PI / 2;
      const labelRadius = radius * 0.85;
      const labelX = labelRadius * Math.cos(angleInRadians);
      const labelY = labelRadius * Math.sin(angleInRadians);

      return { x: labelX, y: labelY, shouldDisplay: true };
    }

    return { shouldDisplay: false };
  };

  return (
    <View style={{ width: chartWidth, height: chartHeight }}>
      <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <G transform={`translate(${chartWidth / 2}, ${chartHeight / 2})`}>
          {nodes.map((node, index) => {
            if (node.depth === 0) return null;
            return (
              <Path
                key={index}
                d={arcGenerator(node) as string}
                fill={getColor(node)}
                stroke={themeColors.backgroundColor}
                strokeWidth="2"
              />
            );
          })}
          {nodes.map((node, index) => {
            if (node.depth <= 1) return null;

            const labelProps = getLabelProps(node);
            if (!labelProps.shouldDisplay) return null;

            return (
              <Text
                key={index}
                x={labelProps.x}
                y={labelProps.y}
                fontSize={10}
                fill={themeColors.textColor}
                textAnchor="middle"
              >
                {node.data.name}
              </Text>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

const getStyles = (theme: any) => {
  const { width } = Dimensions.get('window');
  const isSmall = width > 768;
  const isDesktop = Platform.OS === 'web';

  return StyleSheet.create({

  });
};

export default SunburstChart;