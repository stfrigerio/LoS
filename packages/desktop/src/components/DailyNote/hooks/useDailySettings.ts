import { useEffect, useState } from 'react';
import axios from 'axios';

import { BASE_URL } from '@los/shared/src/utilities/constants';
import { UserSettingData } from '@los/shared/src/types/UserSettings';

export interface DailyNoteSettings {
    booleanHabitsName: boolean;
    hideQuote: boolean;
    quoteCollapse: boolean;
    fixedQuote: boolean;
}

export const useDailySettings = (): [DailyNoteSettings | null, boolean, Error | null] => {
    const [settings, setSettings] = useState<DailyNoteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/userSettings/getByType/appSettings`);
                const appSettings: UserSettingData[] = response.data;

                const settingsMap = appSettings.reduce((acc, setting) => {
                    acc[setting.settingKey] = setting;
                    return acc;
                }, {} as Record<string, UserSettingData>);

                setSettings({
                    booleanHabitsName: settingsMap.booleanHabitsName?.value === 'true',
                    hideQuote: settingsMap.hideQuote?.value === 'true',
                    quoteCollapse: settingsMap.quoteCollapse?.value === 'true',
                    fixedQuote: settingsMap.fixedQuote?.value === 'true',
                });
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return [settings, loading, error];
};