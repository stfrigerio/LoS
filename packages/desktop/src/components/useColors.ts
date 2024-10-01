import { useState, useEffect } from 'react';
import axios from 'axios';

import { BASE_URL } from '@los/shared/src/utilities/constants';

import { TagData } from '@los/shared/src/types/TagsAndDescriptions';
import { UserSettingData } from '@los/shared/src/types/UserSettings';

export const useColors = () => {
    const [colors, setColors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchColors = async () => {
            try {
                setLoading(true);
                const [tagsResponse, userSettingsResponse] = await Promise.all([
                    axios.get<TagData[]>(`${BASE_URL}/tags/list`),
                    axios.get<UserSettingData[]>(`${BASE_URL}/userSettings/list`)
                ]);
                
                const tags = tagsResponse.data;
                const userSettings = userSettingsResponse.data;

                const colorMap: Record<string, string> = {};
                
                tags.forEach(tag => {
                    if (tag.text && tag.color) {
                        colorMap[tag.text] = tag.color;
                    }
                });

                // Add colors from userSettings
                userSettings.forEach(setting => {
                    if (setting.type === 'booleanHabits' || setting.type === 'quantifiableHabits') {
                        if (setting.settingKey && setting.color) {
                            colorMap[setting.settingKey] = setting.color;
                        }
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