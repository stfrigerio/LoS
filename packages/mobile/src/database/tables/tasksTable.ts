import { BaseTableManager, TableStructure } from '../baseTable';
import { databaseManager } from '../databaseManager';
import { TaskData } from '@los/shared/src/types/Task';

const tasksTableStructure: TableStructure = {
  name: 'Tasks',
  columns: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    uuid: 'TEXT NOT NULL UNIQUE',
    text: 'TEXT NOT NULL',
    completed: 'INTEGER NOT NULL DEFAULT 0',
    note: 'TEXT',
    due: 'TEXT',
    end: 'TEXT',
    priority: 'INTEGER',
    type: 'TEXT', // checklist or task ?
    repeat: 'Text',
    frequency: 'TEXT',
    pillarUuid: 'TEXT',
    objectiveUuid: 'TEXT',
    synced: 'INTEGER DEFAULT 0',
    createdAt: 'TEXT NOT NULL',
    updatedAt: 'TEXT NOT NULL',
  },
  primaryKey: 'id',
  conflictResolutionKey: [
    'uuid'
  ]
};

class TasksTableManager extends BaseTableManager<TaskData> {
  constructor() {
    super(tasksTableStructure);
  }

  async listByDateRange(startDate: string, endDate: string): Promise<TaskData[]> {
    const db = await databaseManager.getDatabase();
    const endOfDay = endDate + "T23:59:59.999Z";
    const query = `SELECT * FROM ${this.tableStructure.name} WHERE due >= ? AND due <= ? ORDER BY due;`;
    const result = await databaseManager.executeSqlAsync(db, query, [startDate, endOfDay]);
    return result.rows._array as TaskData[];
  }

  async getNextTask(): Promise<{ item: TaskData | null, timeLeft: string | null }> {
    const db = await databaseManager.getDatabase();
    const now = new Date().toISOString();
    
    // SQL query to select the next uncompleted task due after the current time
    // Tasks are ordered by due date, and only the first result is returned
    const query = `SELECT * FROM ${this.tableStructure.name} WHERE completed = 0 AND due > ? ORDER BY due LIMIT 1;`;
    
    // Execute the query with the current time as a parameter
    const result = await databaseManager.executeSqlAsync(db, query, [now]);
  
    const calculateTimeLeft = (dueDate: string): string => {
      const now = new Date();
      const due = new Date(dueDate);
      const diff = due.getTime() - now.getTime();
      if (diff < 0) {
        return "Past due";
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${days}d ${hours}h ${minutes}m`;
    }
  
    if (result.rows.length > 0) {
      // Get the first (and only) task from the result
      const nextItem = result.rows.item(0) as TaskData;
      
      // If the task has a due date, calculate the time left until it's due
      if (nextItem.due) {
        const timeLeft = calculateTimeLeft(nextItem.due);
        return { item: nextItem, timeLeft };
      }
    }
    
    // If no task was found or the task doesn't have a due date, return null values
    return { item: null, timeLeft: null };
  }

  async getTasksDueOnDate(date: Date): Promise<TaskData[]> {
    const db = await databaseManager.getDatabase();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
  
    const query = `
      SELECT * FROM ${this.tableStructure.name} 
      WHERE due >= ? AND due <= ? 
      ORDER BY due ASC;
    `;
    const result = await databaseManager.executeSqlAsync(db, query, [startOfDay.toISOString(), endOfDay.toISOString()]);
    return result.rows._array as TaskData[];
  }

  async getRepeatingTasks(): Promise<TaskData[]> {
    const db = await databaseManager.getDatabase();
    const query = `SELECT * FROM ${this.tableStructure.name} WHERE repeat = 'true';`;
    const result = await databaseManager.executeSqlAsync(db, query);
    return result.rows._array as TaskData[];
  }

  async getRepeatedTaskByText(text: string): Promise<TaskData[]> {
    const db = await databaseManager.getDatabase();
    const query = `SELECT * FROM ${this.tableStructure.name} WHERE text = ? AND type = 'repeatedTask';`;
    const result = await databaseManager.executeSqlAsync(db, query);
    return result.rows._array as TaskData[];
  }

  async getTasksByPillar(pillarUuid: string): Promise<TaskData[]> {
    const db = await databaseManager.getDatabase();
    const query = `SELECT * FROM ${this.tableStructure.name} WHERE pillarUuid = ? ORDER BY due ASC;`;
    const result = await databaseManager.executeSqlAsync(db, query, [pillarUuid]);
    return result.rows._array as TaskData[];
  }
}

export const tasksTableManager = new TasksTableManager();