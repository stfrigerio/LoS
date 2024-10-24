import { dailyNoteTableManager } from './dailyNoteTable';
import { booleanHabitsManager } from './booleanHabitsTable';
import { quantifiableHabitsManager } from './quantifiableHabitsTable';
import { userSettingsTableManager } from './userSettingsTable';
import { tasksTableManager } from './tasksTable';
import { tagsTableManager } from './defaultTagsTable';
import { libraryManager } from './libraryTable';
import { moneyTableManager } from './moneyTable';
import { moodNoteTableManager } from './moodTable';
import { textNotesManager } from './textTable';
import { timeTableManager } from './timeTable';
import { gptTableManager } from './gptTable';
import { journalTableManager } from './journalTable';
import { peopleTableManager } from './peopleTable';
import { contactTableManager } from './contactTable';
import { pillarsTableManager } from './pillarsTable';
import { objectivesTableManager } from './objectivesTable';
import { deletionLogTableManager } from './deletionTable';
import { musicManager } from './musicTable';

export type DatabaseManagers = {
  dailyNotes: typeof dailyNoteTableManager;
  booleanHabits: typeof booleanHabitsManager;
  quantifiableHabits: typeof quantifiableHabitsManager;
  userSettings: typeof userSettingsTableManager
  tasks: typeof tasksTableManager
  tags: typeof tagsTableManager
  library: typeof libraryManager
  money: typeof moneyTableManager
  mood: typeof moodNoteTableManager
  text: typeof textNotesManager
  time: typeof timeTableManager
  gpt: typeof gptTableManager
  journal: typeof journalTableManager
  people: typeof peopleTableManager
  contact: typeof contactTableManager,
  pillars: typeof pillarsTableManager,
  objectives: typeof objectivesTableManager,
  music: typeof musicManager,
  deletionLog: typeof deletionLogTableManager
};

export const databaseManagers: DatabaseManagers = {
  dailyNotes: dailyNoteTableManager,
  booleanHabits: booleanHabitsManager,
  quantifiableHabits: quantifiableHabitsManager,
  userSettings: userSettingsTableManager,
  tasks: tasksTableManager,
  tags: tagsTableManager,
  library: libraryManager,
  money: moneyTableManager,
  mood: moodNoteTableManager,
  text: textNotesManager,
  time: timeTableManager,
  gpt: gptTableManager,
  journal: journalTableManager,
  people: peopleTableManager,
  contact: contactTableManager,
  pillars: pillarsTableManager,
  objectives: objectivesTableManager,
  music: musicManager,
  deletionLog: deletionLogTableManager
};
