// helpers/dateParser.ts
import * as d3 from 'd3';

import { ViewType } from '../types/types';

export const getParseDate = (viewType: ViewType): ((s: string) => Date | null) => {
    switch (viewType) {
        case 'weekly':
            // ISO week date with day (Monday as the first day of the week)
            return d3.timeParse("%Y-W%V-%u"); // %u: day of the week (1-7)
        case 'monthly':
            return d3.timeParse("%Y-%m");
        case 'quarterly':
            return (s: string) => {
                const [year, quarter] = s.split('-Q');
                return new Date(+year, (+quarter - 1) * 3, 1);
            };
        default:
            return d3.timeParse("%Y-%m-%d");
    }
};
