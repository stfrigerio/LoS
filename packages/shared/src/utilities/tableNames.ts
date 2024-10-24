//! this is used in routes.js as well
export const apiTableNames = [
    'dailyNotes', 
    'time', 
    'library', 
    'tasks', 
    'money', 
    'text', 
    'mood', 
    'gpt', 
    'journal', 
    'userSettings', 
    'tags', 
    'people',
    'contact',
    'pillars',
    'objectives',
    'music'
];

//! Also initialise the table in databaseInitializer.tsx
//! keep this on track with the one in syncApi.js
export const capitalizedTableNames = [
    'DailyNotes', 
    'Time', 
    'Library', 
    'Tasks', 
    'Money', 
    'Text', 
    'Mood', 
    'GPT', 
    'Journal', 
    'UserSettings', 
    'Tags', 
    'People',
    'Contact',
    'Pillars',
    'Objectives',
    'Music'
]

export const tableMapping: { [key: string]: string } = {
    'DailyNotes': 'dailyNotes',
    'Time': 'time',
    'Library': 'library',
    'Tasks': 'tasks',
    'Money': 'money',
    'Mood': 'mood',
    'Tags': 'tags',
    'Text': 'text',
    'UserSettings': 'userSettings',
    'GPT': 'gpt',
    'Journal': 'journal',
    'People': 'people',
    'Contact': 'contact',
    'Pillars': 'pillars',
    'Objectives': 'objectives',
    'Music': 'music'
};