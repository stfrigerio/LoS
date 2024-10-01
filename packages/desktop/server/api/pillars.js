const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const filename = 'pillars.js';

const upsert = async (req, res) => {
    const { uuid, name, emoji, createdAt, updatedAt } = req.body;
    logger.log('Database', filename, 'Received body for Pillar entry', JSON.stringify(req.body, null, 2));

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const transactionResult = await db.sequelize.transaction(async (t) => {
        let pillarEntry;
        let created = false;

        const entryData = {
            uuid: uuid || uuidv4(),
            name,
            emoji,
            createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
            updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date()
        };

        pillarEntry = await db.Pillars.findOne({
            where: { uuid: entryData.uuid },
            transaction: t
        });

        if (pillarEntry) {
            if (entryData.updatedAt > pillarEntry.updatedAt) {
            await pillarEntry.update(entryData, { 
                transaction: t, 
                silent: true 
            });
            } else if (entryData.updatedAt.getTime() === pillarEntry.updatedAt.getTime()) {
            logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
            } else if (entryData.updatedAt < pillarEntry.updatedAt) {
            logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: entryData.updatedAt, existing: pillarEntry.updatedAt }, null, 2));
            } else {
            logger.error('Database', filename, 'Unexpected updatedAt condition', JSON.stringify({ incoming: entryData.updatedAt, existing: pillarEntry.updatedAt }, null, 2));
            }
        } else {
            pillarEntry = await db.Pillars.create(entryData, { 
            transaction: t, 
            silent: true 
            });
            created = true;
        }

        return { pillarEntry, created };
        });

        const logEntry = transactionResult.pillarEntry.toJSON ? transactionResult.pillarEntry.toJSON() : transactionResult.pillarEntry;
        logger.log('Database', filename, `Transaction completed. Pillar entry ${transactionResult.created ? 'created' : 'updated'}:`, JSON.stringify(logEntry, null, 2));

        res.status(transactionResult.created ? 201 : 200).json(transactionResult.pillarEntry);
    } catch (error) {
        logger.error('Database', filename, 'Error upserting Pillar entry:', error.message);
        res.status(500).json({ error: 'Server error while upserting pillar entry', details: error.message });
    }
};

const read = async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Pillar ID is required' });
    }
    try {
        const pillar = await db.Pillars.findByPk(id);
        if (!pillar) {
        return res.status(404).json({ error: 'Pillar not found' });
        }
        res.json(pillar);
    } catch (error) {
        logger.error('Database', filename, 'Error fetching pillar', error);
        res.status(500).json({ error: 'Server error while fetching pillar', details: error.message });
    }
};

const remove = async (req, res) => {
    const { uuid } = req.params;
    try {
        const deletedCount = await db.Pillars.destroy({
            where: { uuid }
        });
        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Pillar not found or already deleted.' });
        }
        res.status(200).json({ message: 'Pillar deleted successfully' });
    } catch (error) {
        logger.error('Database', filename, 'Error deleting pillar', error);
        res.status(500).json({ error: error.message || 'Server error while deleting pillar' });
    }
};

const list = async (req, res) => {
    try {
        const pillars = await db.Pillars.findAll();
        res.json(pillars);
    } catch (error) {
        logger.error('Database', filename, 'Error fetching all pillars', error);
        res.status(500).json({ error: 'Server error while fetching pillars', details: error.message });
    }
};

module.exports = {
    read,
    remove,
    upsert,
    list
};

function isValidDate(dateString) {
    return !isNaN(new Date(dateString).getTime());
}