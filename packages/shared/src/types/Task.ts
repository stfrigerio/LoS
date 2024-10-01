
export interface TaskData {
  uuid?: string;
  id?: number;
  text: string; 
  completed: boolean;
  due?: string;
  note?: string;
  end?: string;
  repeat?: string;
  frequency?: string;
  priority?: number;
  type?: string;
  pillarUuid?: string;
  objectiveUuid?: string;
  synced?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarkedDateDetails {
  marked: boolean;
  dotColor: string;
  isBirthday?: boolean;
  isRepeated?: boolean;
  name?: string;
  dateOfBirth?: string;
  age?: number;
  incompleteTasks?: number;
  tasks?: TaskData[];
  dots?: Array<{key: string, color: string}>;
}

export  interface TempDueDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    incompleteTasks: number;
    tasks: TaskData[];
  };
}
  
export interface ExtendedTaskData extends TaskData {
  isBirthday?: boolean;
}
  