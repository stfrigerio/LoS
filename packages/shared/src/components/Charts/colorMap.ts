// Color palette with all unique colors
export const colorPalette: string[] = [
    'rgba(201, 128, 107, 0.5)',
    'rgba(70, 91, 179, 0.5)',
    'rgba(6, 168, 147, 0.5)',
    'rgba(153, 0, 153, 0.5)',
    'rgba(11, 131, 217, 0.5)',
    'rgba(45, 166, 8, 0.5)',
    'rgba(82, 82, 102, 0.5)',
    'rgba(199, 175, 20, 0.5)',
    'rgba(217, 65, 130, 0.5)',
    'rgba(164, 19, 5, 0.5)',
    'rgba(255, 191, 0, 0.5)',
    'rgba(255, 85, 0, 0.5)',
    'rgba(201, 0, 0, 0.5)',
    'rgba(250, 87, 75, 0.5)',
    'rgba(71, 87, 255, 0.5)',
    'rgba(178, 71, 245, 0.5)',
    "rgba(255, 171, 171, 1)",
    "rgba(153, 176, 128, 1)",
    "rgba(178, 141, 255, 1)",
    "rgba(249, 181, 114, 1)",
];

// Comprehensive color map with all items
export const ColorMap: { [key: string]: string } = {
    'Family & Frens': 'rgba(201, 128, 107, 0.5)',
    'Lavoro': 'rgba(70, 91, 179, 0.5)',
    'Life': 'rgba(6, 168, 147, 0.5)',
    'Obsidian': 'rgba(153, 0, 153, 0.5)',
    'Programming': 'rgba(11, 131, 217, 0.5)',
    'Relax': 'rgba(45, 166, 8, 0.5)',
    'Sleep': 'rgba(82, 82, 102, 0.5)',
    'Training': 'rgba(199, 175, 20, 0.5)',
    'Music': 'rgba(217, 65, 130, 0.5)',
    'Studio': 'rgba(164, 19, 5, 0.5)',
    //
    'Food': 'rgba(255, 191, 0, 0.5)',
    'Casa': 'rgba(6, 168, 147, 0.5)',
    'Health': 'rgba(6, 168, 147, 0.5)',
    'Leisure': 'rgba(255, 85, 0, 0.5)',
    'Investments': 'rgba(201, 0, 0, 0.5)',
    'Macchina': 'rgba(250, 87, 75, 0.5)',
    'Softwares': 'rgba(71, 87, 255, 0.5)',
    'Travel': 'rgba(178, 71, 245, 0.5)',
    //
    'Cigarettes': "rgba(255, 171, 171, 1)",
    'Herbs': "rgba(153, 176, 128, 1)",
    'Coffees': "rgba(178, 141, 255, 1)",
    'Alcohols': "rgba(249, 181, 114, 1)",
    //
    'Happy': "rgba(255, 171, 171, 1)",
    'Productive': "rgba(178, 141, 255, 1)",
    'Achieved': "rgba(0, 151, 207, 1)",
    'Relaxed': "rgba(153, 176, 128, 1)"
};

export const moodColorMap: { [key: string]: string } = {
    Positive: "rgba(68, 46, 191, 0.8)",
    Energized: "rgba(42, 97, 168, 0.8)",
    Confident: "rgba(42, 168, 122, 0.8)",
    Peaceful: "rgba(99, 168, 42, 0.8)",
    Stressed: "rgba(168, 118, 42, 0.8)",
    Frustrated: "rgba(168, 88, 42, 0.8)",
    Negative: "rgba(168, 42, 42, 0.8)",
    untagged: "#9e9e9e"
};

// Function to get color for an item
export function getColor(item: string): string {
    return ColorMap[item] || colorPalette[Math.floor(Math.random() * colorPalette.length)];
}

export const isRgba = (color: string): boolean => color.startsWith('rgba');

export const getRgbaOpacity = (rgba: string, depth: number): string => {
    const parts = rgba.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
    if (!parts) return rgba;
    return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${depth === 1 ? 0.5 : 0.3})`;
};

export const hexToRgba = (hex: string, opacity: number): string => {
    const validHex = hex.startsWith('#') ? hex.slice(1) : hex;
    if (validHex.length !== 6) {
        console.warn(`Invalid hex color: ${hex}`);
        return `rgba(0, 0, 0, ${opacity})`;
    }
    
    const r = parseInt(validHex.slice(0, 2), 16);
    const g = parseInt(validHex.slice(2, 4), 16);
    const b = parseInt(validHex.slice(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const adjustRgbaOpacity = (rgba: string, opacity: number): string => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match) {
        const [, r, g, b] = match;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return rgba;
};