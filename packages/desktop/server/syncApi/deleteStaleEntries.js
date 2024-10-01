const api = require('../api');

const apiTableNames = [
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
    'objectives',
    'pillars'
];

// the remove functions in your API controllers are expecting a request object with parameters,
const createMockReqRes = (uuid) => {
    return {
        req: { params: { uuid } },
        res: {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                this.data = data;
                return this;
            }
        }
    };
};

const deleteStaleEntries = async (deletionLog) => {
    for (const entry of deletionLog) {
        const tableName = entry.tableName.toLowerCase();
        if (apiTableNames.includes(tableName)) {
            const manager = api[tableName];
            if (manager && typeof manager.remove === 'function') {
                try {
                    const { req, res } = createMockReqRes(entry.recordUuid);
                    await manager.remove(req, res);
                    
                    if (res.statusCode === 404 || (res.statusCode === undefined && res.data && res.data.message === 'Task deleted successfully')) {
                        console.log(`Successfully processed deletion for ${entry.tableName} with UUID ${entry.recordUuid}`);
                    } else if (res.statusCode === 200 || res.statusCode === 204) {
                        console.log(`Successfully deleted entry from ${entry.tableName} with UUID ${entry.recordUuid}`);
                    } else {
                        const errorMessage = res.data && res.data.error ? res.data.error : 'Unknown error occurred';
                        console.warn(`Failed to delete entry from ${entry.tableName} with UUID ${entry.recordUuid}: ${errorMessage}`);
                    }
                } catch (error) {
                    console.error(`Error deleting entry from ${entry.tableName} with UUID ${entry.recordUuid}:`, error.message || error);
                }
            } else {
                console.warn(`No manager or remove method found for table ${entry.tableName}`);
            }
        } else {
            console.warn(`Table ${entry.tableName} not found in apiTableNames`);
        }
    }
}


module.exports = { deleteStaleEntries };