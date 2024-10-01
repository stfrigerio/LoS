
export interface UserSettingData {
    uuid?: string;
    id?: number;
    settingKey: string;
    value: string; 
    type: string;
    color?: string;
}

export interface HabitSetting {
    id: number;
    value: string;
    type: 'booleanHabits' | 'quantifiableHabits';
}
    
export interface Settings {
    [key: string]: {
        id?: number;
        uuid: string;
        settingKey: string;
        value: string;
        color?: string;
        type: "booleanHabits" | "quantifiableHabits";
    };
}