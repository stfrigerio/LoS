import * as d3 from 'd3';
import { Dimensions } from 'react-native';

import { aggregateData } from './helpers/aggregateData'

import { ViewType, ChartData } from './types/types';

export const renderChart = (
  chartData: ChartData,
  viewType: ViewType,
  chartWidth: number,
  chartHeight: number,
) => {
  const aggregatedData = aggregateData(chartData, viewType);
  const x = d3.scaleTime().range([0, chartWidth]);
  const y = d3.scaleLinear().range([chartHeight, 0]); 

  let parseDate;
  switch (viewType) {
    case 'weekly':
      parseDate = d3.timeParse("%Y-W%W");
      break;
    case 'monthly':
      parseDate = d3.timeParse("%Y-%m");
      break;
    case 'quarterly':
      parseDate = (s: string) => {
        const [year, quarter] = s.split('-Q');
        return new Date(+year, (+quarter - 1) * 3, 1);
      };
      break;
    default:
      parseDate = d3.timeParse("%Y-%m-%d");
  }

  const dates = aggregatedData.dates
    .map(d => parseDate(d as string))
    .filter((d): d is Date => d !== null);

  const allValues = Object.entries(aggregatedData)
    .filter(([key]) => key !== 'dates')
    .flatMap(([_, values]) => values as number[]);

  if (dates.length === 0 || allValues.length === 0) {
    // console.warn('No valid data to render chart');
    return { paths: {}, circles: [], chartDimensions: { x, y, chartWidth, chartHeight } };
  }

  x.domain(d3.extent(dates) as [Date, Date]);
  y.domain([0, Math.ceil(d3.max(allValues) || 0)]);

  const line = d3.line<{ date: Date; value: number }>()
    .x(d => x(d.date))
    .y(d => y(d.value))
    .curve(d3.curveMonotoneX);

  const paths: { [key: string]: string } = {};
  const circles: Array<{ x: number; y: number; date: Date; value: number; habit: string }> = [];

  Object.entries(aggregatedData).forEach(([habit, values]) => {
    if (habit === 'dates') return;

    const lineData = (values as number[]).map((value, i) => ({
      date: dates[i],
      value: value
    }));

    const pathData = line(lineData);
    if (pathData) {
      paths[habit] = pathData;
    }

    lineData.forEach(d => {
      if (d.date && !isNaN(d.value)) {
        circles.push({
          x: x(d.date),
          y: y(d.value),
          date: d.date,
          value: d.value,
          habit: habit
        });
      }
    });
  });

  return { paths, circles, chartDimensions: { x, y, chartWidth, chartHeight } };
};