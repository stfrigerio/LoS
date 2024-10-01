export const formatValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};
  
export const getInputType = (value: any): string => {
  if (typeof value === 'number') {
    return 'number';
  }
  if (value instanceof Date) {
    return 'date';
  }
  return 'text';
};

export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Return original string if invalid date
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

export const formatDateTimeForDisplay = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return dateTimeString; // Return original string if invalid date
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export const formatTimeForDisplay = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};