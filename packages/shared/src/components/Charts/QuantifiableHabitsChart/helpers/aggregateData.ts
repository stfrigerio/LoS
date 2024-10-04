import * as d3 from 'd3';

import { ViewType, ChartData } from '../types/types';

interface NumericChartData extends ChartData {
	[key: string]: number[] | string[];
}

export const aggregateData = (data: NumericChartData, viewType: ViewType): NumericChartData => {
	if (viewType === 'daily') return data;

	const aggregatedData: NumericChartData = { dates: [] };
	const parseDate = d3.timeParse("%Y-%m-%d");

	Object.keys(data).forEach(habit => {
		if (habit === 'dates') return;
		aggregatedData[habit] = [];
	});

	data.dates.forEach((dateString, index) => {
		const parsedDate = parseDate(dateString as string);
		if (!parsedDate) {
			console.warn(`Failed to parse date: ${dateString}`);
			return;
		}

		let dateKey: string;
		switch (viewType) {
			case 'weekly':
				dateKey = d3.timeFormat('%Y-W%V')(parsedDate);
				break;
			case 'monthly':
				dateKey = d3.timeFormat('%Y-%m')(parsedDate);
				break;
			case 'quarterly':
				const quarter = Math.floor(parsedDate.getMonth() / 3) + 1;
				dateKey = `${parsedDate.getFullYear()}-Q${quarter}`;
				break;
			default:
				dateKey = dateString as string;
		}

		const dateIndex = aggregatedData.dates.indexOf(dateKey);
		if (dateIndex === -1) {
			aggregatedData.dates.push(dateKey);
			Object.keys(data).forEach(habit => {
				if (habit === 'dates') return;
				if (Array.isArray(data[habit]) && typeof data[habit][index] === 'number') {
					(aggregatedData[habit] as number[]).push(data[habit][index] as number);
				} else {
					(aggregatedData[habit] as number[]).push(0);
				}
			});
		} else {
			Object.keys(data).forEach(habit => {
				if (habit === 'dates') return;
				if (Array.isArray(data[habit]) && Array.isArray(aggregatedData[habit])) {
					const value = data[habit][index];
					if (typeof value === 'number' && typeof aggregatedData[habit][dateIndex] === 'number') {
						(aggregatedData[habit] as number[])[dateIndex] += value;
					}
				}
			});
		}
	});

	return aggregatedData;
};