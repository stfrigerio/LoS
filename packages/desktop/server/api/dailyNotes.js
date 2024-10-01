const sequelize = require('../../models/sequelizeInit');
const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const filename = "dailyNotes.ts";

//* Standard CRUD operations
const upsert = async (req, res) => {
    const { 
        uuid, 
        date, 
        morningComment, 
        energy, 
        wakeHour, 
        success, 
        beBetter, 
        dayRating, 
        sleepTime, 
        booleanHabits, 
        quantifiableHabits, 
        createdAt, 
        updatedAt 
    } = req.body;

    // logger.log('Database', filename, 'Received body for Daily note', JSON.stringify(req.body, null, 2)); //&
    
    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    try {
        const transactionResult = await sequelize.transaction(async (t) => {
            let dailyNote;
            let created = false;
            let modified = false;

            const updatedFields = {
                date,
                morningComment,
                energy,
                success,
                beBetter,
                dayRating,
                updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date() // Use provided updatedAt or current time
            };

            // Add wakeHour and sleepTime only if they are provided and not empty strings
            if (wakeHour && wakeHour.trim() !== '') {
                updatedFields.wakeHour = wakeHour;
            }
            if (sleepTime && sleepTime.trim() !== '') {
                updatedFields.sleepTime = sleepTime;
            }

            const searchCriteria = uuid ? { uuid } : { date };

            dailyNote = await db.DailyNotes.findOne({
                where: searchCriteria,
                transaction: t
            });

            if (dailyNote) {
                const incomingUpdatedAt = new Date(updatedAt);
                const existingUpdatedAt = new Date(dailyNote.updatedAt);
                // Update existing note
                if (isValidDate(updatedAt) && incomingUpdatedAt > existingUpdatedAt) {
                    await dailyNote.update(updatedFields, { 
                        transaction: t, 
                        silent: true 
                    });
                    modified = true;
                } else if (isValidDate(updatedAt) && incomingUpdatedAt.getTime() === existingUpdatedAt.getTime()) {
                    logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
                } else if (isValidDate(updatedAt) && incomingUpdatedAt < existingUpdatedAt) {
                    logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: incomingUpdatedAt, existing: existingUpdatedAt }, null, 2));
                } else {
                    logger.error('Database', filename, 'Invalid or unexpected updatedAt condition', JSON.stringify({ incoming: updatedAt, existing: dailyNote.updatedAt }, null, 2));
                }
            } else {
                // Create new note
                const newFields = {
                    ...updatedFields,
                    uuid: uuid || uuidv4(), // Use provided UUID or generate new one
                    createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
                    updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date(),
                };
                dailyNote = await db.DailyNotes.create(newFields, { 
                    transaction: t,
                    silent: true
                });
                created = true;
            }

            // Handle boolean habits
            if (booleanHabits && booleanHabits.length) {
                // Fetch existing boolean habits for this daily note
                const existingBooleanHabits = await db.BooleanHabits.findAll({
                    where: { date },
                    transaction: t
                });
            
                for (const habit of booleanHabits) {
                    if (!habit.habitKey) {
                        logger.warn('Database', filename, 'Skipping boolean habit due to missing habitKey', habit);
                        continue;
                    }
            
                    const habitKey = habit.habitKey;
            
                    // Check if this habit already exists
                    const existingHabit = existingBooleanHabits.find(h => h.habitKey === habitKey);
                    const habitUpdatedAt = isValidDate(updatedAt) ? new Date(updatedAt) : new Date();

                    if (existingHabit) {
                        // Update existing habit
                        await existingHabit.update({
                            value: habit.value,
                            updatedAt: habitUpdatedAt,
                        }, { 
                            transaction: t,
                            silent: true // Prevent automatic updating of updatedAt
                        });
                    } else {
                        // Create new habit
                        await db.BooleanHabits.create({
                            uuid: habit.uuid || uuidv4(),
                            date,
                            habitKey,
                            value: habit.value,
                            createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
                            updatedAt: habitUpdatedAt,
                        }, { 
                            transaction: t,
                            silent: true
                        });
                    }
                }
            }

            // Handle quantifiable habits
            if (quantifiableHabits && quantifiableHabits.length) {
                // Fetch existing quantifiable habits for this daily note
                const existingQuantifiableHabits = await db.QuantifiableHabits.findAll({
                    where: { date },
                    transaction: t
                });
            
                for (const habit of quantifiableHabits) {
                    if (!habit.habitKey) {
                        logger.warn('Database', filename, 'Skipping quantifiable habit due to missing habitKey', habit);
                        continue;
                    }
            
                    const habitKey = habit.habitKey;
            
                    // Check if this habit already exists
                    const existingHabit = existingQuantifiableHabits.find(h => h.habitKey === habitKey);
                    const habitUpdatedAt = isValidDate(updatedAt) ? new Date(updatedAt) : new Date();

                    if (existingHabit) {
                        // Update existing habit
                        await existingHabit.update({
                            value: habit.value,
                            updatedAt: habitUpdatedAt,
                        }, { 
                            transaction: t,
                            silent: true
                        });
                    } else {
                        // Create new habit
                        await db.QuantifiableHabits.create({
                            uuid: habit.uuid || uuidv4(),
                            date,
                            habitKey,
                            value: habit.value,
                            createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
                            updatedAt: habitUpdatedAt,
                        }, { 
                            transaction: t,
                            silent: true
                        });
                    }
                }
            }

            // Fetch the updated daily note with habits
            const updatedDailyNote = await db.DailyNotes.findOne({
                where: { uuid: dailyNote.uuid },
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
                transaction: t
            });

            return { updatedDailyNote, created, modified };
        });

        if (transactionResult.created || transactionResult.modified) {
            logger.log('Database', filename, `Transaction completed. DailyNote details:`, JSON.stringify(transactionResult.updatedDailyNote.toJSON(), null, 2)); //&
        }
        res.status(transactionResult.created ? 201 : 200).json(transactionResult.updatedDailyNote);
    } catch (error) {
        logger.error('Database', filename, 'Error upserting DailyNote with habits:', error.message);
        res.status(500).json({ error: 'Server error while upserting daily note', details: error.message });
    }
};

const read = async (req, res) => {
    const { date } = req.query;

    if (!date) {
        logger.error('Database', filename, 'No date provided in the request');
        return res.status(400).json({ error: 'Date is required' });
    }

    try {
        const dailyNote = await db.DailyNotes.findOne({
            where: { date },
            include: [
                {
                    model: db.BooleanHabits,
                    as: 'booleanHabits',
                    attributes: ['date', 'habitKey', 'value']
                },
                {
                    model: db.QuantifiableHabits,
                    as: 'quantifiableHabits',
                    attributes: ['date', 'habitKey', 'value']
                }
            ]
        });

        if (!dailyNote) {
            return res.status(200).json({ 
                date,
                booleanHabits: [],
                quantifiableHabits: [],
                message: 'No data found for this date'
            });
        }

        res.json(dailyNote);
    } catch (error) {
        logger.error('Database', filename, `Error fetching daily note for date ${date}:`, error.message);
        res.status(500).json({ error: 'Server error while fetching daily note', details: error.message });
    }
};

const remove = async (req, res) => {
    const { date } = req.body;
    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }
    try {
        const result = await db.DailyNotes.destroy({ where: { date } });
        if (result === 0) {
            return res.status(404).json({ error: 'Daily note not found' });
        }
        res.status(200).json({ message: 'Daily note deleted successfully' });
    } catch (error) {
        logger.error('Database', filename, 'Error deleting DailyNote:', error.message);
        res.status(500).json({ error: 'Server error while deleting daily note' });
    }
};

const list = async (req, res) => {
    try {
        const allDailyNotes = await db.DailyNotes.findAll({
            include: [
                {
                    model: db.BooleanHabits,
                    as: 'booleanHabits',
                    attributes: ['date', 'habitKey', 'value']
                },
                {
                    model: db.QuantifiableHabits,
                    as: 'quantifiableHabits',
                    attributes: ['date', 'habitKey', 'value']
                }
            ],
            order: [['date', 'DESC']]
        });
        res.status(200).json(allDailyNotes);
    } catch (error) {
        logger.error('Database', filename, 'Error fetching all daily notes entries', error);
        res.status(500).json({ error: 'Server error while fetching all daily notes entries', details: error.message });
    }
}

const listByRange = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        const dailyNotes = await db.DailyNotes.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                {
                    model: db.BooleanHabits,
                    as: 'booleanHabits',
                    attributes: ['habitKey', 'value']
                },
                {
                    model: db.QuantifiableHabits,
                    as: 'quantifiableHabits',
                    attributes: ['habitKey', 'value']
                }
            ],
            order: [['date', 'ASC']]
        });

        const processedNotes = dailyNotes.map(note => {
            const plainNote = note.get({ plain: true });
            return {
                ...plainNote,
                booleanHabits: Object.fromEntries(
                    plainNote.booleanHabits.map(habit => [habit.habitKey, habit.value])
                ),
                quantifiableHabits: Object.fromEntries(
                    plainNote.quantifiableHabits.map(habit => [habit.habitKey, habit.value])
                )
            };
        });

        res.status(200).json(processedNotes);

    } catch (error) {
        logger.error('Database', filename, `Error fetching daily notes for date range ${startDate} to ${endDate}:`, error.message);
        res.status(500).json({ error: 'Server error while fetching daily notes', details: error.message });
    }
};


module.exports = {
    read,
    remove,
    list,
    listByRange,
    upsert
};

function isValidDate(dateString) {
    return !isNaN(new Date(dateString).getTime());
}