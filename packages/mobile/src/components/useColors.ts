import { useState, useEffect } from 'react';
import { databaseManagers } from '@los/mobile/src/database/tables';
import { TagData } from '@los/shared/src/types/TagsAndDescriptions';
import { UserSettingData } from '@los/shared/src/types/UserSettings';

// Utility function to validate color strings
const isValidColor = (color: string): boolean => {
    if (!color || typeof color !== 'string') return false;
    // Check if the color is a valid hex code
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
};

export const useColors = () => {
    const [colors, setColors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchColors = async () => {
            try {
                setLoading(true);
                const [tags, userSettings] = await Promise.all([
                    databaseManagers.tags.list(),
                    databaseManagers.userSettings.list(),
                ]);

                const colorMap: Record<string, string> = {};
                
                // Add colors from tags
                tags.forEach(tag => {
                    if (tag.text && tag.color && isValidColor(tag.color)) {
                        colorMap[tag.text] = tag.color;
                    }
                });

                // Add colors from userSettings (habits)
                userSettings.forEach(setting => {
                    if ((setting.type === 'booleanHabits' || setting.type === 'quantifiableHabits') &&
                        setting.settingKey && setting.color && isValidColor(setting.color)) {
                        colorMap[setting.settingKey] = setting.color;
                    }
                });

                setColors(colorMap);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching colors:', err);
                setError(err instanceof Error ? err : new Error('Unknown error occurred'));
                setLoading(false);
            }
        };

        fetchColors();
    }, []);

    return { colors, loading, error };
};