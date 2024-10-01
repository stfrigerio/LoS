const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const filename = 'objectives.js';

const upsert = async (req, res) => {
    const { uuid, period, objective, pillarId, note, createdAt, updatedAt } = req.body;
    logger.log('Database', filename, 'Received body for Objective entry', JSON.stringify(req.body, null, 2));

    if (!objective || !pillarId) {
        return res.status(400).json({ error: 'Objective and pillarId are required' });
    }

    try {
        const transactionResult = await db.sequelize.transaction(async (t) => {
        let objectiveEntry;
        let created = false;

        const entryData = {
            uuid: uuid || uuidv4(),
            period,
            objective,
            pillarId,
            note,
            createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
            updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date()
        };

        objectiveEntry = await db.Objectives.findOne({
            where: { uuid: entryData.uuid },
            transaction: t
        });

        if (objectiveEntry) {
            if (entryData.updatedAt > objectiveEntry.updatedAt) {
            await objectiveEntry.update(entryData, { 
                transaction: t, 
                silent: true 
            });
            } else if (entryData.updatedAt.getTime() === objectiveEntry.updatedAt.getTime()) {
                logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
            } else if (entryData.updatedAt < objectiveEntry.updatedAt) {
                logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: entryData.updatedAt, existing: objectiveEntry.updatedAt }, null, 2));
            } else {
                logger.error('Database', filename, 'Unexpected updatedAt condition', JSON.stringify({ incoming: entryData.updatedAt, existing: objectiveEntry.updatedAt }, null, 2));
            }
        } else {
            objectiveEntry = await db.Objectives.create(entryData, { 
            transaction: t, 
            silent: true 
            });
            created = true;
        }

        return { objectiveEntry, created };
        });

        const logEntry = transactionResult.objectiveEntry.toJSON ? transactionResult.objectiveEntry.toJSON() : transactionResult.objectiveEntry;
        logger.log('Database', filename, `Transaction completed. Objective entry ${transactionResult.created ? 'created' : 'updated'}:`, JSON.stringify(logEntry, null, 2));

        res.status(transactionResult.created ? 201 : 200).json(transactionResult.objectiveEntry);
    } catch (error) {
        logger.error('Database', filename, 'Error upserting Objective entry:', error.message);
        res.status(500).json({ error: 'Server error while upserting objective entry', details: error.message });
    }
};

const read = async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Objective ID is required' });
    }
    try {
        const objective = await db.Objectives.findByPk(id);
        if (!objective) {
            return res.status(404).json({ error: 'Objective not found' });
        }
        res.json(objective);
    } catch (error) {
        logger.error('Database', filename, 'Error fetching objective', error);
        res.status(500).json({ error: 'Server error while fetching objective', details: error.message });
    }
};

const remove = async (req, res) => {
    const { uuid } = req.params;
    try {
        const deletedCount = await db.Objectives.destroy({
            where: { uuid }
        });
        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Objective not found or already deleted.' });
        }
        res.status(200).json({ message: 'Objective deleted successfully' });
    } catch (error) {
        logger.error('Database', filename, 'Error deleting objective', error);
        res.status(500).json({ error: error.message || 'Server error while deleting objective' });
    }
};

const list = async (req, res) => {
    try {
        const objectives = await db.Objectives.findAll();
        res.json(objectives);
    } catch (error) {
        logger.error('Database', filename, 'Error fetching all objectives', error);
        res.status(500).json({ error: 'Server error while fetching objectives', details: error.message });
    }
};

const getObjectivesByPillar = async (req, res) => {
    const { pillarId } = req.params;
    try {
        const objectives = await db.Objectives.findAll({
            where: { pillarId }
        });
        res.json(objectives);
    } catch (error) {
        logger.error('Database', filename, 'Error fetching objectives by pillar', error);
        res.status(500).json({ error: 'Server error while fetching objectives', details: error.message });
    }
};

const getObjectives = async (req, res) => {
    const { period, pillarId } = req.query;
    const conditions = {};
    if (period) {
        conditions.period = period;
    }
    if (pillarId) {
        conditions.pillarId = pillarId;
    }

    try {
        const objectives = await db.Objectives.findAll({
            where: conditions,
            order: [['createdAt', 'DESC']]
        });
        res.json(objectives);
    } catch (error) {
        logger.error('Database', filename, 'Error fetching objectives', error);
        res.status(500).json({ error: 'Server error while fetching objectives', details: error.message });
    }
};

module.exports = {
    read,
    remove,
    upsert,
    list,
    getObjectivesByPillar,
    getObjectives
};

function isValidDate(dateString) {
    return !isNaN(new Date(dateString).getTime());
}