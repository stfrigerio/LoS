// helpers/dateParser.ts
import * as d3 from 'd3';

import { ViewType } from '../types/types';

export const getParseDate = (viewType: ViewType): ((s: string) => Date | null) => {
    switch (viewType) {
        case 'weekly':
            // Parse ISO week date and return the Monday of that week
            return (s: string) => {
                const parsed = d3.timeParse("%Y-W%V")(s);
                if (parsed) {
                    const day = parsed.getDay();
                    const diff = parsed.getDate() - day + (day === 0 ? -6 : 1);
                    return new Date(parsed.setDate(diff));
                }
                return null;
            };
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