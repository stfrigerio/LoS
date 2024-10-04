//Axes.tsx
import React from 'react';
import { G, Line, Text as SvgText } from 'react-native-svg';
import * as d3 from 'd3';

import { getParseDate } from '../helpers/dateParser';

interface AxesProps {
	x: d3.ScaleTime<number, number>;
	y: d3.ScaleLinear<number, number>;
	width: number;
	height: number;
	theme: any;
	viewType: 'daily' | 'weekly' | 'monthly' | 'quarterly';
	data: {
		[key: string]: number[] | string[];
		dates: string[];
	};
}

const Axes: React.FC<AxesProps> = ({ x, y, width, height, theme, viewType, data }) => {
	const getXAxisFormat = () => {
		switch (viewType) {
			case 'weekly': return (d: Date) => `W${d3.timeFormat("%V")(d)}`;
			case 'monthly': return d3.timeFormat("%b");
			case 'quarterly': return (d: Date) => `Q${Math.floor(d.getMonth() / 3) + 1}`;
			default: {
				if (data.dates.length > 7) {
					return d3.timeFormat("%d");
				}
				return d3.timeFormat("%b %d");
			}
		}
	};

    const parseDate = getParseDate(viewType);

	const xAxisTicks = data.dates.map(parseDate).filter((d): d is Date => d !== null);

	// Group dates by week, month, or quarter
	const groupedTicks = (() => {
		switch (viewType) {
			case 'weekly':
				return Array.from(d3.group(xAxisTicks, d => d3.timeFormat("%Y-W%V")(d)), ([, dates]) => dates[0]);
			case 'monthly':
				return Array.from(d3.group(xAxisTicks, d => d3.timeFormat("%Y-%m")(d)), ([, dates]) => dates[0]);
			case 'quarterly':
				return Array.from(d3.group(xAxisTicks, d => `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`), ([, dates]) => dates[0]);
			default:
				return xAxisTicks;
		}
	})();

	// Limit the number of ticks to avoid overcrowding
	const maxTicks = 7;
	const step = Math.max(1, Math.floor(groupedTicks.length / maxTicks));
	const limitedTicks = groupedTicks.filter((_, i) => i % step === 0);

	// Ensure the last tick is included
	if (limitedTicks[limitedTicks.length - 1] !== groupedTicks[groupedTicks.length - 1]) {
		limitedTicks.push(groupedTicks[groupedTicks.length - 1]);
	}

	const yAxisTicks = y.ticks(5).filter(tick => Number.isInteger(tick));

	return (
		<>
			{/* X Axis */}
			<G transform={`translate(0, ${height})`}>
				<Line x2={width} stroke={theme.borderColor} />
				{limitedTicks.map((tick, i) => (
					<G key={i} transform={`translate(${x(tick)}, 0)`}> 
						<Line y2={6} stroke={theme.borderColor} />
						<SvgText y={9} dy=".71em" textAnchor="middle" fill={theme.textColor} fontSize={10}>
							{getXAxisFormat()(tick)}
						</SvgText>
						{viewType === 'daily' && data.dates.length > 7 && tick.getDate() === 1 && (
							<SvgText y={22} dy=".71em" textAnchor="middle" fill={theme.textColor} fontSize={10}>
								{d3.timeFormat("%b")(tick)}
							</SvgText>
						)}
						{viewType === 'quarterly' && (
							<SvgText y={22} dy=".71em" textAnchor="middle" fill={theme.textColor} fontSize={10}>
								{d3.timeFormat("%Y")(tick)}
							</SvgText>
						)}
					</G>
				))}
			</G>

			{/* Y Axis */}
			<G>
				<Line y2={height} stroke={theme.borderColor} />
				{yAxisTicks.map((tick, i) => (
					<G key={i} transform={`translate(0, ${y(tick)})`}>
						<Line x2={-6} stroke={theme.borderColor} />
						<SvgText x={-9} dy=".32em" textAnchor="end" fill={theme.textColor} fontSize={10}>
							{tick}
						</SvgText>
					</G>
				))}
			</G>
		</>
	);
};

export default Axes;