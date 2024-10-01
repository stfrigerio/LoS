const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');

const syncUpsert = async (model, data, options = {}) => {
    const {
        requiredFields = [],
        defaultValues = {},
        dateFields = ['date'],
        logPrefix = 'Sync',
        filename = 'syncUpsert.js',
    } = options;

    // Check required fields
    for (const field of requiredFields) {
        if (!data[field]) {
            throw new Error(`${field} is required for ${model.name}`);
        }
    }

    const entryData = {
        ...defaultValues,
        ...data,
        uuid: data.uuid || uuidv4(),
        createdAt: isValidDate(data.createdAt) ? new Date(data.createdAt) : new Date(),
        updatedAt: isValidDate(data.updatedAt) ? new Date(data.updatedAt) : new Date()
    };

    // Handle date field based on model
    if (entryData.date) {
        if (model.name === 'GPT') {
            // For GPT, keep the original string format
            if (typeof entryData.date !== 'string') {
                entryData.date = String(entryData.date);
            }
        } else {
            try {
                if (typeof entryData.date === 'object' && entryData.date !== null) {
                    if (entryData.date instanceof Date) {
                        entryData.date = entryData.date.toISOString();
                    } else if (entryData.date.toString) {
                        entryData.date = new Date(entryData.date.toString()).toISOString();
                    } else {
                        entryData.date = new Date(JSON.parse(JSON.stringify(entryData.date))).toISOString();
                    }
                } else {
                    entryData.date = new Date(entryData.date).toISOString();
                }
            } catch (error) {
                logger.error(logPrefix, filename, `Error processing date for ${model.name}:`, error.message, 'Original date value:', entryData.date);
                throw new Error(`Invalid date format for ${model.name}: ${error.message}`);
            }
        }
    }

    // Convert other date fields to Date objects (excluding GPT model)
    if (model.name !== 'GPT') {
        for (const field of dateFields.filter(f => f !== 'date')) {
            if (entryData[field] !== undefined && entryData[field] !== null) {
                if (model.name === 'Tasks' && field === 'due') {
                    if (!isValidDate(entryData[field])) {
                        entryData[field] = null;
                        continue;
                    }
                }
                try {
                    entryData[field] = new Date(entryData[field]);
                    if (isNaN(entryData[field].getTime())) {
                        logger.warn(logPrefix, filename, `Invalid date for ${field} in ${model.name}, setting to null. Original value:`, entryData[field]);
                        entryData[field] = null;
                    }
                } catch (error) {
                    logger.warn(logPrefix, filename, `Error processing ${field} for ${model.name}, setting to null:`, error.message, 'Original value:', entryData[field]);
                    entryData[field] = null;
                }
            }
        }
    }

    try {
        return await db.sequelize.transaction(async (t) => {
            let entry;
            let created = false;
            let updated = false;
            let warnings = [];

            if (model.name === 'DailyNotes') {
                entry = await model.findOne({ 
                    where: { date: entryData.date },
                    transaction: t
                });
            } else if (model.name === 'UserSettings') {
                entry = await model.findOne({ 
                    where: { settingKey: entryData.settingKey },
                    transaction: t
                });
            } else {
                entry = await model.findOne({ 
                    where: { uuid: entryData.uuid },
                    transaction: t
                });
            }

            if (entry) {
                if (entryData.updatedAt > entry.updatedAt) {
                    await entry.update(entryData, { 
                        transaction: t, 
                        silent: true 
                    });
                    updated = true;
                } else if (entryData.updatedAt.getTime() === entry.updatedAt.getTime()) {
                    warnings.push({ type: 'SKIP', message: 'Incoming updatedAt is equal to existing updatedAt, skipping' });
                } else if (entryData.updatedAt < entry.updatedAt) {
                    warnings.push({ type: 'OUTDATED', message: 'Incoming updatedAt is older than existing updatedAt' });
                } else {
                    warnings.push({ type: 'UNEXPECTED', message: 'Unexpected updatedAt condition' });
                }
            } else {
                entry = await model.create(entryData, { 
                    transaction: t,
                    silent: true
                });
                created = true;
            }

            // Handle habits for DailyNotes
            if (model.name === 'DailyNotes') {
                const { booleanHabits, quantifiableHabits } = data;
            
                if (booleanHabits) {
                    for (const habit of booleanHabits) {
                        await upsertHabit(db.BooleanHabits, entryData.date, habit, t);
                    }
                }
            
                if (quantifiableHabits) {
                    for (const habit of quantifiableHabits) {
                        await upsertHabit(db.QuantifiableHabits, entryData.date, habit, t);
                    }
                }
            }

            return { entry, created, updated, warnings };
        });
    } catch (error) {
        logger.error(logPrefix, filename, `Error syncing ${model.name} entry:`, error.message);
        throw error;
    }
};

function isValidDate(dateString) {
    return !isNaN(new Date(dateString).getTime());
}

async function upsertHabit(model, date, habit, transaction) {
    const [existingHabit] = await model.findOrCreate({
        where: { date, habitKey: habit.habitKey },
        defaults: {
            date,
            habitKey: habit.habitKey,
            value: habit.value,
            updatedAt: new Date()
        },
        transaction
    });

    if (existingHabit) {
        const incomingUpdatedAt = new Date(habit.updatedAt || new Date());
        if (incomingUpdatedAt > existingHabit.updatedAt) {
            await existingHabit.update({
                value: habit.value,
                updatedAt: incomingUpdatedAt
            }, { transaction });
        }
    }
}

module.exports = syncUpsert;