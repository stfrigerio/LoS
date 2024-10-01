import React, { createContext, useContext, useState } from 'react';

export const ChecklistContext = createContext();

export const ChecklistProvider = ({ children }) => {
  const [checklistUpdated, setChecklistUpdated] = useState(false);

  const updateChecklist = () => {
    setChecklistUpdated(true);
  };

  const resetChecklistUpdate = () => {
    setChecklistUpdated(false);
  };

  return (
    <ChecklistContext.Provider value={{ checklistUpdated, updateChecklist, resetChecklistUpdate }}>
      {children}
    </ChecklistContext.Provider>
  );
};

export const useChecklist = () => useContext(ChecklistContext);
