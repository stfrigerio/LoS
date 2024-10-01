
export const habitThresholds = {
    Cigarettes: { green: 0, yellow: 4, red: 6 },
    Herbs: { green: 0, yellow: 4, red: 5 },
    Coffees: { green: 0, yellow: 3, red: 4 },
    Alcohols: { green: 0, yellow: 4, red: 8 },
};

export const habitEmojiMap: Record<string, string> = {
    Cigarettes: "🚬",
    Herbs: "🌿",
    Coffees: "☕",
    Alcohols: "🍻",
};

export const getColorForValue = (
    habit: keyof typeof habitThresholds,
    value: number,
    red: string,
    yellow: string,
    green: string,
    defaultColor: string = 'rgba(255, 255, 255, 1)'
): string => {
    if (typeof value !== 'number' || isNaN(value)) {
        return defaultColor;
    }

    const thresholds = habitThresholds[habit];
    if (!thresholds) {
        return defaultColor;
    }

    let color;
    let opacity = 0.6;

    try {
        if (value >= thresholds.red) {
            color = red;
        } else if (value >= thresholds.yellow) {
            const ratio = (value - thresholds.yellow) / (thresholds.red - thresholds.yellow);
            color = interpolateColor(yellow, red, ratio, opacity);
        } else {
            const ratio = value / thresholds.yellow;
            color = interpolateColor(green, yellow, ratio, opacity);
        }

        // Validate the resulting color
        if (typeof color !== 'string' || !color.startsWith('rgba(')) {
            throw new Error('Invalid color generated');
        }
    } catch (error) {
        console.error('Error generating color:', error);
        color = defaultColor;
    }

    return color;
};

// Modify the interpolateColor function to handle potential errors
export const interpolateColor = (color1: string, color2: string, ratio: number, opacity: number = 1): string => {
    try {
        const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
        const lerp = (a: number, b: number, u: number) => clamp((1 - u) * a + u * b, 0, 255);

        let [r1, g1, b1] = color1.match(/\d+/g)!.slice(0, 3).map(Number);
        let [r2, g2, b2] = color2.match(/\d+/g)!.slice(0, 3).map(Number);

        if ([r1, g1, b1, r2, g2, b2].some(isNaN)) {
            throw new Error('Invalid color values');
        }

        let r = Math.round(lerp(r1, r2, ratio));
        let g = Math.round(lerp(g1, g2, ratio));
        let b = Math.round(lerp(b1, b2, ratio));

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } catch (error) {
        console.error('Error interpolating color:', error);
        return 'rgba(255, 255, 255, 1)'; // Return white as a fallback
    }
};