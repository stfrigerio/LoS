const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const filename = 'people.js';

//* Standard CRUD operations
const upsert = async (req, res) => {
    const { uuid, name, middleName, lastName, birthDay, email, phoneNumber, address, city, state, pronouns, category, notificationEnabled, frequencyOfContact, occupation, partner, likes, dislikes, description, synced, createdAt, updatedAt } = req.body;
    logger.log('Database', filename, 'Received body for Person entry', JSON.stringify(req.body, null, 2));

    if (!name || !lastName) {
        return res.status(400).json({ error: 'Name, lastName, birthDay, and category are required' });
    }

    try {
        const transactionResult = await db.sequelize.transaction(async (t) => {
        let personEntry;
        let created = false;

        const entryData = {
            uuid: uuid || uuidv4(),
            name,
            middleName,
            lastName,
            birthDay,
            email,
            phoneNumber,
            address,
            city,
            state,
            pronouns,
            category,
            notificationEnabled,
            frequencyOfContact,
            occupation,
            partner,
            likes,
            dislikes,
            description,
            synced: synced || 0,
            createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
            updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date()
        };

        // Try to find an existing entry based on UUID
        personEntry = await db.People.findOne({
            where: { uuid: entryData.uuid },
            transaction: t
        });

        if (personEntry) {
            // If found, update the existing record
            if (entryData.updatedAt > personEntry.updatedAt) {
                await personEntry.update(entryData, { 
                    transaction: t, 
                    silent: true 
                });
            } else if (entryData.updatedAt.getTime() === personEntry.updatedAt.getTime()) {
                logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
            } else if (entryData.updatedAt < personEntry.updatedAt) {
                logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: entryData.updatedAt, existing: personEntry.updatedAt }, null, 2));
            } else {
                logger.error('Database', filename, 'Unexpected updatedAt condition', JSON.stringify({ incoming: entryData.updatedAt, existing: personEntry.updatedAt }, null, 2));
            }
        } else {
            // If not found, create a new record
            personEntry = await db.People.create(entryData, { 
            transaction: t, 
            silent: true 
            });
            created = true;
        }

        return { personEntry, created };
        });

        const logEntry = transactionResult.personEntry.toJSON ? transactionResult.personEntry.toJSON() : transactionResult.personEntry;
        logger.log('Database', filename, `Transaction completed. Person entry ${transactionResult.created ? 'created' : 'updated'}:`, JSON.stringify(logEntry, null, 2));

        res.status(transactionResult.created ? 201 : 200).json(transactionResult.personEntry);
    } catch (error) {
        logger.error('Database', filename, 'Error upserting Person entry:', error.message);
        res.status(500).json({ error: 'Server error while upserting person entry', details: error.message });
    }
};

const read = async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Person ID is required' });
    }
    try {
        const person = await db.People.findByPk(id);
        if (!person) {
        return res.status(404).json({ error: 'Person not found' });
        }
        res.json(person);
    } catch (error) {
        logger.error('Database', filename, 'Error fetching person', error);
        res.status(500).json({ error: 'Server error while fetching person', details: error.message });
    }
};

const remove = async (req, res) => {
    const { uuid } = req.params;
    try {
        const deletedCount = await db.People.destroy({
            where: { uuid }
        });
        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Person not found or already deleted.' });
        }
        res.status(200).json({ message: 'Person deleted successfully' });
    } catch (error) {
        logger.error('Database', filename, 'Error deleting person', error);
        res.status(500).json({ error: error.message || 'Server error while deleting person' });
    }
};

const list = async (req, res) => {
    try {
        const people = await db.People.findAll();
        res.json(people);
    } catch (error) {
        logger.error('Database', filename, 'Error fetching all people', error);
        res.status(500).json({ error: 'Server error while fetching people', details: error.message });
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