type SortableItem = {
    [key: string]: any;
    date?: string;
    createdAt?: string;
    updatedAt?: string;
};

const sortFieldMap: { [key: string]: string } = {
    dailyNote: 'date',
    time: 'start_time',
    money: 'date',
    library: 'seen',
    tasks: 'due',
    mood: 'date',
    text: 'date',
    journal: 'date',
    gpt: 'date',
    userSetting: 'type'
};

export const sortTableData = (tableName: string, data: SortableItem[]): SortableItem[] => {
    const sortField = sortFieldMap[tableName] || 'createdAt';

    return [...data].sort((a, b) => {
        const dateA = a[sortField] ? new Date(a[sortField]).getTime() : 0;
        const dateB = b[sortField] ? new Date(b[sortField]).getTime() : 0;
        return dateB - dateA; // Descending order
    });
};