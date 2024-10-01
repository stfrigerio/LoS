import { UserSettingData } from "@los/shared/src/types/UserSettings";

export type Settings = {
    [key: string]: {
      uuid: string;
      settingKey: string;
      value: string;
      type: 'booleanHabits' | 'quantifiableHabits';
    };
};
  
export type UseSettingsType = () => {
  settings: Settings;
  fetchSettings: () => Promise<void>;
  addNewHabit: (newHabit: UserSettingData) => Promise<void>;
  deleteRecord: (settingUuid: string) => Promise<void>;
  updateSetting: (habit: UserSettingData) => Promise<void>;
};