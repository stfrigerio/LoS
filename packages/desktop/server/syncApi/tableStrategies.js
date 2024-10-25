const { Op } = require('sequelize');
const syncUpsert = require('./syncUpsert');
const { logger } = require('../../src/electron/main/logger');

const fetchStrategies = {
    DailyNotes: async (db, startOfMonth, endOfMonth) => {
        return db.DailyNotes.findAll({
            where: {
                date: {
                [Op.between]: [startOfMonth, endOfMonth]
                }
            },
            include: [
                {
                    model: db.BooleanHabits,
                    as: 'booleanHabits',
                    attributes: ['uuid', 'date', 'habitKey', 'value', 'createdAt', 'updatedAt']
                },
                {
                    model: db.QuantifiableHabits,
                    as: 'quantifiableHabits',
                    attributes: ['uuid', 'date', 'habitKey', 'value', 'createdAt', 'updatedAt']
                }
            ],
            order: [['date', 'ASC']]
        });
    },
    Time: async (db, startOfMonth, endOfMonth) => {
        return db.Time.findAll({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { startTime: { [Op.not]: null } },
                            { endTime: { [Op.not]: null } }
                        ]
                    },
                    {
                        date: {
                            [Op.between]: [startOfMonth, endOfMonth]
                        }
                    }
                ]
            }
        });
    },
    Library: async (db) => {
        return db.Library.findAll();
    },
    Tasks: async (db, startOfMonth) => {
        const fetchedTasks = await db.Tasks.findAll({
            where: {
                [Op.or]: [
                    { due: { [Op.gte]: startOfMonth.toDate() } },
                    {
                        [Op.and]: [
                            { due: null },
                            { completed: false }
                        ]
                    }
                ]
            }
        });

        return fetchedTasks;
    },
    Money: async (db, startOfMonth, endOfMonth) => {
        return db.Money.findAll({
            where: {
                date: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });
    },
    Text: async (db, startOfMonth, endOfMonth) => {
        return getRelevantEntries(db, db.Text, startOfMonth, endOfMonth);
    },
    GPT: async (db, startOfMonth, endOfMonth) => {
        return getRelevantEntries(db, db.GPT, startOfMonth, endOfMonth);
    },
    Mood: async (db, startOfMonth, endOfMonth) => {
        const moodStartDate = startOfMonth.format('YYYY-MM-DD');
        const moodEndDate = endOfMonth.format('YYYY-MM-DD');
        return db.Mood.findAll({
            where: {
                date: {
                    [Op.between]: [moodStartDate, moodEndDate]
                }
            }
        });
    },
    Journal: async (db, startOfMonth, endOfMonth) => {
        const journalStartDate = startOfMonth.format('YYYY-MM-DD');
        const journalEndDate = endOfMonth.format('YYYY-MM-DD');
        return db.Journal.findAll({
            where: {
                date: {
                    [Op.between]: [journalStartDate, journalEndDate]
                }
            }
        });
    },
    UserSettings: async (db) => {
        return db.UserSettings.findAll({
            attributes: { exclude: ['id'] }
        });
    },
    Tags: async (db) => {
        return db.Tags.findAll();
    },
    People: async (db) => {
        return db.People.findAll();
    },
    Contact: async (db) => {
        return db.Contact.findAll();
    },
    Pillars: async (db) => {
        return db.Pillars.findAll();
    },
    Objectives: async (db, startOfMonth, endOfMonth) => {
        return getRelevantEntries(db, db.Objectives, startOfMonth, endOfMonth);
    },
    Music: async (db) => {
        return db.Music.findAll();
    }
};

const syncStrategies = {
    Contact: async (db, entry) => {
        return syncUpsert(db.Contact, entry, {
            requiredFields: ['personId', 'dateOfContact'],
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    },
    GPT: async (db, entry) => {
        return syncUpsert(db.GPT, entry, {
            requiredFields: ['date', 'type', 'summary'],
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    },
    Journal: async (db, entry) => {
        return syncUpsert(db.Journal, entry, {
            requiredFields: ['date', 'text'],
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    },
    Library: async (db, entry) => {
        return syncUpsert(db.Library, entry, {
            requiredFields: ['title', 'releaseYear'],
            defaultValues: {
                seen: '-'
            },
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    },
    Money: async (db, entry) => {
        return syncUpsert(db.Money, entry, {
            requiredFields: ['date', 'amount', 'type'],
            dateFields: ['date', 'due'],
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    },
    Mood: async (db, entry) => {
        return syncUpsert(db.Mood, entry, {
            requiredFields: ['date', 'rating'],
            defaultValues: { comment: null, tag: null, description: null },
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    },
    People: async (db, entry) => {
        return syncUpsert(db.People, entry, {
            requiredFields: ['name', 'lastName'],
            logPrefix: 'Sync',
            defaultValues: {
                middleName: null,
                birthDay: null,
                email: null,
                phoneNumber: null,
                address: null,
                city: null,
                state: null,
                pronouns: null,
                category: null,
                notificationEnabled: false,
                frequencyOfContact: null,
                occupation: null,
                partner: null,
                likes: null,
                dislikes: null,
                description: null,
                synced: 0
            },
            filename: 'syncApi.js'
        });
    },
    Tags: async (db, entry) => {
        return syncUpsert(db.Tags, entry, {  
            requiredFields: ['text', 'type'],
            defaultValues: { emoji: null, linkedTag: null },
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    },
    Tasks: async (db, entry) => {
        return syncUpsert(db.Tasks, entry, {
            requiredFields: ['text'],
            defaultValues: { completed: false },
            dateFields: ['due'],
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    },
    Text: async (db, entry) => {
        return syncUpsert(db.Text, entry, {
            requiredFields: ['period', 'key', 'text'],
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    },
    Time: async (db, entry) => {
        return syncUpsert(db.Time, entry, {
            requiredFields: ['date', 'startTime', 'endTime'],
            dateFields: ['date'],
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    },
    UserSettings: async (db, entry) => {
        return syncUpsert(db.UserSettings, entry, {
            requiredFields: ['settingKey'],
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    },
    DailyNotes: async (db, entry) => {
        return syncUpsert(db.DailyNotes, entry, {
            requiredFields: ['date'],
            dateFields: ['date'],
            nestedModels: {
                booleanHabits: {
                    model: 'BooleanHabits',
                    foreignKey: 'dailyNoteUuid',
                    requiredFields: ['habitKey', 'value'],
                    dateFields: ['date'],
                },
                quantifiableHabits: {
                    model: 'QuantifiableHabits',
                    foreignKey: 'dailyNoteUuid',
                    requiredFields: ['habitKey', 'value'],
                    dateFields: ['date'],
                },
            },
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    },
    Pillars: async (db, entry) => {
        return syncUpsert(db.Pillars, entry, {
            requiredFields: ['name'],
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    },
    Objectives: async (db, entry) => {
        return syncUpsert(db.Objectives, entry, {
            requiredFields: ['objective'],
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    },
    Music: async (db, entry) => {
        return syncUpsert(db.Music, entry, {
            requiredFields: ['trackName', 'libraryUuid'],
            logPrefix: 'Sync',
            filename: 'syncApi.js'
        });
    }
};

const getRelevantEntries = async (db, Model, startOfMonth, endOfMonth) => {
    const year = startOfMonth.year();
    const month = startOfMonth.format('MM');
    const weekNumbers = [];
    let currentWeek = startOfMonth.clone().startOf('week');
    
    while (currentWeek.isSameOrBefore(endOfMonth)) {
        weekNumbers.push(currentWeek.format('WW'));
        currentWeek.add(1, 'week');
    }

    const relevantPeriods = [
        `${year}`,
        `${year}-${month}`,
        `${year}-Q${Math.ceil(startOfMonth.month() / 3)}`,
        ...weekNumbers.map(week => `${year}-W${week}`)
    ];

    let entries
    if (Model === db.Text) {
        return Model.findAll({
            where: {
                period: {
                    [Op.in]: relevantPeriods
                }
            }
        });
    } else if (Model === db.GPT) {
        return Model.findAll({
            where: {
                [Op.or]: [
                    {
                        date: {
                            [Op.between]: [startOfMonth.toDate(), endOfMonth.toDate()]
                        }
                    },
                    {
                        date: {
                            [Op.in]: relevantPeriods
                        }
                    }
                ]
            }
        });
    } else if (Model === db.Objectives) {
        return Model.findAll({
            where: {
                period: {
                    [Op.in]: relevantPeriods
                }
            }
        });
    }

    return entries;
};


module.exports = {
    fetchStrategies,
    syncStrategies
};