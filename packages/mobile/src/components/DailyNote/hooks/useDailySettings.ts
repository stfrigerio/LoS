import { useEffect, useState } from 'react';
import { databaseManagers } from '@los/mobile/src/database/tables';
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
                const appSettings = await databaseManagers.userSettings.getByType('appSettings');
                const settingsMap = appSettings.reduce((acc, setting) => {
                    acc[setting.settingKey] = setting;
                    return acc;
                }, {} as Record<string, UserSettingData>);

                setSettings({
                    booleanHabitsName: settingsMap.BooleanHabitsName?.value === 'true',
                    hideQuote: settingsMap.HideQuote?.value === 'true',
                    quoteCollapse: settingsMap.QuoteCollapse?.value === 'true',
                    fixedQuote: settingsMap.FixedQuote?.value === 'true',
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