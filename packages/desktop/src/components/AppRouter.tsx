import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Homepage from '@los/shared/src/components/Home/Homepage';
import PeriodicNoteWrapper from '@los/desktop/src/components/PeriodicNote/PeriodicNoteWrapper';
import JournalHub from '@los/shared/src/components/Journal/JournalHub';
import Database from '@los/shared/src/components/Database/Database';
import UserSettings from '@los/shared/src/components/UserSettings/UserSettings';
import DailyNote from '@los/shared/src/components/DailyNote/DailyNote';
import Library from '@los/shared/src/components/Library/LibraryHub';
import PeopleHub from '@los/shared/src/components/People/People';
import TasksHub from '@los/shared/src/components/Tasks/Tasks';
import MoodsHub from '@los/shared/src/components/Mood/Mood';
import MoneyHub from '@los/shared/src/components/Money/Money';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/dailyNote" element={<DailyNote />} />
      <Route path="/periodicNote" element={<PeriodicNoteWrapper />} />
      <Route path="/periodicNote/:startDate/:endDate" element={<PeriodicNoteWrapper />} />
      <Route path="/journalHub" element={<JournalHub />} />
      <Route path="/database" element={<Database />} />
      <Route path="/settings" element={<UserSettings />} />
      <Route path="/library" element={<Library />} />
      <Route path="/people" element={<PeopleHub />} />
      <Route path="/tasks" element={<TasksHub />} />
      <Route path="/moods" element={<MoodsHub />} />
      <Route path="/money" element={<MoneyHub />} />
    </Routes>
  );
};

export default AppRouter;