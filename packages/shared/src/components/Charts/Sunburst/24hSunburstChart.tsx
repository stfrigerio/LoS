import React, { useRef, useMemo } from 'react';
import { View, Dimensions, Platform } from 'react-native';
import Svg, { Path, G, Text } from 'react-native-svg';
import * as d3 from 'd3';
import { colorPalette, adjustRgbaOpacity, hexToRgba, isRgba } from '../colorMap';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';
import { TimeData } from '@los/shared/src/types/Time';

let useColors: any;
if (Platform.OS === 'web') {
    useColors = require('@los/desktop/src/components/useColors').useColors;
} else {
    useColors = require('@los/mobile/src/components/useColors').useColors;
}

interface TagData {
    tag: string;
    duration: number;
    color?: string;
}

export interface SunburstTimeData extends Omit<TimeData, 'tag'> {
    tags: Array<{ tag: string; duration: number }>;
}

export interface HourData {
    hour: number;
    tags: TagData[];
}

interface SunburstChartProps {
    data: SunburstTimeData[];
    width?: number;
    height?: number;
}

const HoursSunburst: React.FC<SunburstChartProps> = ({ data, width, height }) => {
    const { themeColors } = useThemeStyles();
    const { colors: tagColors, loading, error } = useColors();

    const windowDimensions = Dimensions.get('window');
    const chartWidth = width || windowDimensions.width;
    const chartHeight = height || 300;
    const radius = Math.min(chartWidth, chartHeight) / 2.1;

    const processedData = useMemo(() => {
        const result = data.map(hourData => ({
            hour: new Date(hourData.date).getHours(), // Extract hour from the date
            ...hourData,
            tags: hourData.tags.map(tag => {
                const baseColor = tagColors[tag.tag] || colorPalette[Math.floor(Math.random() * colorPalette.length)];
                const opacity = 0.3; // Lower opacity for deeper level (tags)
                
                return {
                    ...tag,
                    color: isRgba(baseColor) 
                        ? adjustRgbaOpacity(baseColor, opacity)
                        : hexToRgba(baseColor, opacity)
                };
            })
        }));
        return result;
    }, [data, tagColors]);

    const is12HourView = data.length <= 12;

    const pie = d3.pie<HourData>()
        .value(d => 1) // Each slice has equal size
        .sort((a, b) => a.hour - b.hour)
        .startAngle(-Math.PI / 2) // Start at the top
        .endAngle(Math.PI * 1.5); // End at the top

    const arcGenerator = d3.arc<d3.PieArcDatum<HourData>>()
        .innerRadius(radius * 0.4)
        .outerRadius(radius * 0.8);

    const tagArcGenerator = d3.arc<d3.PieArcDatum<TagData>>()
        .innerRadius(radius * 0.8)
        .outerRadius(radius * 0.95);

    const arcs = useMemo(() => pie(processedData), [processedData]);

    const getColor = (data: HourData | TagData) => {
        if ('tag' in data) {
            return data.color || 'gray';
        }
        // For hour level, use higher opacity
        const opacity = 0.5;
        if (data.tags.length === 0) {
            return 'transparent';
        }
        if (data.tags.length === 1) {
            const baseColor = data.tags[0].color || 'gray';
            return isRgba(baseColor) 
                ? adjustRgbaOpacity(baseColor, opacity)
                : hexToRgba(baseColor, opacity);
        }
        // Blend colors for multiple tags
        return data.tags.reduce((blendedColor, tag, index) => {
            const tagColor = tag.color || 'gray';
            const adjustedColor = isRgba(tagColor)
                ? adjustRgbaOpacity(tagColor, opacity)
                : hexToRgba(tagColor, opacity);
            if (index === 0) return adjustedColor;
            return blendColors(blendedColor, adjustedColor);
        }, '');
    };

    const blendColors = (color1: string, color2: string) => {
        // Simple color blending function
        const c1 = d3.rgb(color1);
        const c2 = d3.rgb(color2);
        return d3.rgb(
            (c1.r + c2.r) / 2,
            (c1.g + c2.g) / 2,
            (c1.b + c2.b) / 2
        ).toString();
    };

    const labelRadius = radius * 1; // Adjust this value to position labels further out or closer

    return (
        <View style={{ width: chartWidth, height: chartHeight }}>
            <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            <G transform={`translate(${chartWidth / 2}, ${chartHeight / 2}) rotate(89)`}>
                    {arcs.map((arc, index) => {
                        return (
                            <React.Fragment key={index}>
                                <Path
                                    d={arcGenerator(arc) as string}
                                    fill={getColor(arc.data)}
                                    stroke={themeColors.backgroundColor}
                                    strokeWidth="2"
                                />
                                {arc.data.tags.length > 0 && arc.data.tags.map((tag, tagIndex) => {
                                    return (
                                        <Path
                                            key={`${index}-${tagIndex}`}
                                            d={tagArcGenerator({
                                                ...arc,
                                                startAngle: arc.startAngle + (arc.endAngle - arc.startAngle) * (tagIndex / arc.data.tags.length),
                                                endAngle: arc.startAngle + (arc.endAngle - arc.startAngle) * ((tagIndex + 1) / arc.data.tags.length),
                                                data: tag
                                            } as d3.PieArcDatum<TagData>) as string}
                                            fill={getColor(tag)}
                                            stroke={themeColors.backgroundColor}
                                            strokeWidth="2"
                                        />
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </G>
                {/* Hour labels outside the chart */}
                <G transform={`translate(${chartWidth / 2}, ${chartHeight / 2})`}>
                    {arcs.map((arc, index) => {
                        const angle = ((arc.startAngle + arc.endAngle) / 2 * 180 / Math.PI) + (is12HourView?74 : 82);
                        const [x, y] = d3.pointRadial(
                            (arc.startAngle + arc.endAngle) / 2,
                            labelRadius
                        );
                        const hour = arc.data.hour;
                        let label;
                        if (is12HourView) {
                            const hour12 = hour % 12 || 12;
                            const ampm = hour < 12 || hour === 24 ? 'am' : 'pm';
                            label = `${hour12}${ampm}`;
                        } else {
                            label = hour.toString().padStart(2, '0');
                        }
                        return (
                            <Text
                                key={`label-${index}`}
                                x={0}
                                y={0}
                                fontSize={6}
                                fill={'gray'}
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                transform={`rotate(${angle}) translate(0, -${labelRadius})`}
                            >
                                {label}
                            </Text>
                        );
                    })}
                </G>
            </Svg>
        </View>
    );
};

export default HoursSunburst;