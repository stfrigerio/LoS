import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import PeriodicNote from '@los/shared/src/components/PeriodicNote/PeriodicNote';

const PeriodicNoteWrapper: React.FC = () => {
  const { startDate, endDate } = useParams<{ startDate?: string; endDate?: string }>();
  const location = useLocation();

  // Parse the state if it exists
  const state = location.state as { startDate?: string; endDate?: string } | null;

  // Use params if available, otherwise fall back to state
  const finalStartDate = startDate || state?.startDate || undefined;
  const finalEndDate = endDate || state?.endDate || undefined;

  return <PeriodicNote startDate={finalStartDate} endDate={finalEndDate} />;
};

export default PeriodicNoteWrapper;