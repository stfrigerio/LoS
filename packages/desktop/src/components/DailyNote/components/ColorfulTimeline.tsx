import React from 'react';
import moment from 'moment';
import { StyleSheet } from 'react-native';

import { useThemeStyles } from '@los/shared/src/styles/useThemeStyles';

type ColorfulTimelineProps = {
    title: string;
};

const ColorfulTimeline: React.FC<ColorfulTimelineProps> = ({ title }) => {
    const { themeColors } = useThemeStyles();
    const styles = getStyles(themeColors);

    const computeData = () => {
        let startDate = "";
        if (title.match(/^[12][019]\d{2}[01]\d[0123]\d$/)) {
            startDate = moment(title, "YYYYMMDD").format("MM-DD-YYYY");
        } else if (title.match(/^[12][019]\d{2}-[01]\d-[0123]\d -- Week$/)) { 
            startDate = moment(title, "YYYY-MM-DD [-- Week]").format("MM-DD-YYYY");
        } else {
            startDate = moment().format("MM-DD-YYYY");
        }

        const year = moment(startDate).format("YYYY");
        let monthStart = 0;
        let monthBlocks = [];
        let monthLabels = [];
        let marker = "";

        for(let i = 1; i <= 12; i++) {
            const daysInMonth = moment(`${year}-${i}`, "YYYY-M").daysInMonth();
            const monthName = moment(`${year}-${i}`, "YYYY-M").format("MMMM");
            monthBlocks.push({monthName, start: monthStart, width: daysInMonth * 10});
            monthLabels.push({monthName, start: monthStart});
            if (moment(startDate).format("M") == i.toString()) {
                marker = (monthStart + parseInt(moment(startDate).format("D"))).toString();
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

    return (
        <svg style={styles.svg} viewBox="0 -20 3760 150">
            <g style={styles.bars}>
                {monthBlocks.map(block => (
                    <rect 
                        key={block.monthName} 
                        x={block.start * 10} 
                        width={block.width} 
                        height={25} 
                        fill={getFillColorForMonth(block.monthName)}
                    />
                ))}
            </g>
            <g style={styles.labels}>
                {monthLabels.map(label => (
                    <text 
                        key={label.monthName} 
                        fill="gray" 
                        fontSize={50}
                        x={label.start * 10} 
                        y="120"
                    >
                        {label.monthName}
                    </text>
                ))}
            </g>
            <g style={styles.markers}>
                <circle 
                    cx={parseInt(marker) * 10}
                    cy="14" 
                    r="15" 
                    stroke="black" 
                    fill="#212121" 
                />
            </g>
        </svg>
    );
}

const getStyles = (theme: any) => {
    return StyleSheet.create({
        svg: {
            width: '100%',
            height: 150,
            backgroundColor: theme.backgroundColor
        },
        bars: {
            paddingBottom: 50,
        },
        labels: {
            fontSize: 50,
        },
        markers: {},
    });
};

export default ColorfulTimeline;