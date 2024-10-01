import React, { useEffect, useRef } from 'react';
import moment from 'moment';
import { StyleSheet, Dimensions, Animated } from 'react-native';
import { Svg, Rect, Text as SvgText, Circle, G } from 'react-native-svg';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

type ColorfulTimelineProps = {
    title: string;
};

const deviceWidth = Dimensions.get('window').width;

const ColorfulTimeline: React.FC<ColorfulTimelineProps> = ({ title }) => {
    const { themeColors } = useThemeStyles();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const radiusAnim = useRef(new Animated.Value(80)).current;

    const AnimatedCircle = Animated.createAnimatedComponent(Circle);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {

            Animated.loop(
                Animated.sequence([
                    Animated.timing(radiusAnim, {
                        toValue: 120, // 120 * 1.2
                        duration: 2500,
                        useNativeDriver: false,
                    }),
                    Animated.timing(radiusAnim, {
                        toValue: 80,
                        duration: 2500,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const computeData = () => {
        let startDate = "";
        if (title.match(/^[12][019]\d{2}[01]\d[0123]\d$/)) {
            // Assuming title is in 'YYYYMMDD' format
            startDate = moment(title, "YYYYMMDD").format("YYYY-MM-DD");
        } else if (title.match(/^[12][019]\d{2}-[01]\d-[0123]\d -- Week$/)) { 
            // Extracting date part from 'YYYY-MM-DD -- Week' format
            startDate = title.split(' -- ')[0];
        } else {
            startDate = moment().format("YYYY-MM-DD"); // Using ISO 8601 format
        }
    
        const year = moment(startDate, "YYYY-MM-DD").format("YYYY");
        let monthStart = 0;
        let monthBlocks = [];
        let monthLabels = [];
        let marker: number = 0;

        for(let i = 1; i <= 12; i++) {
            const daysInMonth = moment(`${year}-${i}`, "YYYY-M").daysInMonth();
            const monthName = moment(`${year}-${i}`, "YYYY-M").format("MMMM");
            monthBlocks.push({monthName, start: monthStart, width: daysInMonth * 10});
            monthLabels.push({monthName, start: monthStart});
            if (moment(startDate).format("M") === i.toString()) {
                marker = monthStart + parseInt(moment(startDate).format("D"), 10);
            }
            monthStart += daysInMonth + 1;
        }

        return { year, monthBlocks, monthLabels, marker };
    }

    const { year, monthBlocks, monthLabels, marker } = computeData();

    const getFillColorForMonth = (monthName: string) => {
        const colors: { [key: string]: string } = {
            January: '#cfe2f3',
            February: '#a2c4c9',
            March: '#76a5af',
            April: '#93c47d',
            May: '#6aa84f',
            June: '#8fce00',
            July: '#ffd966',
            August: '#f1c232',
            September: '#ce7e00',
            October: '#e06666',
            November: '#f4cccc',
            December: '#eeeeee',
        };
        return colors[monthName] || '#FFFFFF';
    };

    const SVG_WIDTH = 3850; //^ più basso è il valore più è lunga. BOH
    const SVG_HEIGHT = 250;

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Svg 
                height='55'
                width={deviceWidth} 
                viewBox={`-40 50 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            >
                <G style={styles.bars}>
                    {monthBlocks.map(block => (
                    <Rect 
                        key={`${block.monthName}-${block.start}`}
                        x={block.start * 10} 
                        width={block.width} 
                        height={styles.monthBlock.height} 
                        fill={getFillColorForMonth(block.monthName)}
                    />
                    ))}
                </G>
                <G>
                    {monthLabels.map(label => (
                    <SvgText
                        key={label.monthName}
                        fill="#b0b0b0"
                        fontSize={styles.monthLabel.fontSize}
                        x={label.start * 10 + 10}
                        y="300"
                    >
                        {label.monthName}
                    </SvgText>
                    ))}
                </G>
                <G>
                    <AnimatedCircle 
                        cx={marker * 10}
                        cy={125} 
                        r={radiusAnim}
                        stroke={themeColors.backgroundColor}
                        strokeWidth="16"
                        fill={themeColors.hoverColor}
                    />
                </G>
            </Svg>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        // borderWidth: 1,
        // borderColor: 'red',
    },
    bars: {
        paddingBottom: 50,
    },
    monthBlock: {
        height: 250,
    },
    monthLabel: {
        fontSize: 56,
        fontWeight: 'bold'
    },
    timelineDayWeekMarker: {
        display: 'none',
    },
    timelineWeekDayMarker: {
        display: 'none',
    },
});

export default ColorfulTimeline;
