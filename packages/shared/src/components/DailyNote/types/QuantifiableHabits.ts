import { QuantifiableHabitsData } from '@los/shared/src/types/QuantifiableHabits';

export type UseQuantifiableHabitsReturnType = {
  habits: { [key: string]: { value: number; uuid: string } };
  emojis: { [key: string]: string };
  handleIncrement: (uiid: string, habitKey: string) => Promise<void>;
  handleDecrement: (uuid: string, habitKey: string) => Promise<void>;
  scheduleMindfulReminder?: (habit: string) => Promise<void>;
};

export type UseQuantifiableHabitsType = (
  data: QuantifiableHabitsData[],
  date: string,
) => UseQuantifiableHabitsReturnType;