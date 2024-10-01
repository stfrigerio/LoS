const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const filename = 'contacts.js';

const upsert = async (req, res) => {
    const { uuid, personId, dateOfContact, synced, createdAt, updatedAt } = req.body;
    logger.log('Database', filename, 'Received body for Contact entry', JSON.stringify(req.body, null, 2));

    if (!personId || !dateOfContact) {
        return res.status(400).json({ error: 'PersonId and dateOfContact are required' });
    }

    try {
        const transactionResult = await db.sequelize.transaction(async (t) => {
        let contactEntry;
        let created = false;

        const entryData = {
            uuid: uuid || uuidv4(),
            personId,
            dateOfContact,
            synced: synced || 0,
            createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
            updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date()
        };

        contactEntry = await db.Contact.findOne({
            where: { uuid: entryData.uuid },
            transaction: t
        });

        if (contactEntry) {
            if (entryData.updatedAt > contactEntry.updatedAt) {
                await contactEntry.update(entryData, { 
                    transaction: t, 
                    silent: true 
                });
            } else if (entryData.updatedAt.getTime() === contactEntry.updatedAt.getTime()) {
                logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
            } else if (entryData.updatedAt < contactEntry.updatedAt) {
                logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: entryData.updatedAt, existing: contactEntry.updatedAt }, null, 2));
            } else {
                logger.error('Database', filename, 'Unexpected updatedAt condition', JSON.stringify({ incoming: entryData.updatedAt, existing: contactEntry.updatedAt }, null, 2));
            }
        } else {
            contactEntry = await db.Contact.create(entryData, { 
                transaction: t, 
                silent: true 
                });
                created = true;
                }   

            return { contactEntry, created };
        });

        const logEntry = transactionResult.contactEntry.toJSON ? transactionResult.contactEntry.toJSON() : transactionResult.contactEntry;
        logger.log('Database', filename, `Transaction completed. Contact entry ${transactionResult.created ? 'created' : 'updated'}:`, JSON.stringify(logEntry, null, 2));

        res.status(transactionResult.created ? 201 : 200).json(transactionResult.contactEntry);
    } catch (error) {
        logger.error('Database', filename, 'Error upserting Contact entry:', error.message);
        res.status(500).json({ error: 'Server error while upserting contact entry', details: error.message });
    }
};

const read = async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Contact ID is required' });
    }
    try {
        const contact = await db.Contact.findByPk(id, {
            include: [{ model: db.People, attributes: ['name', 'lastName'] }]
        });
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.json(contact);
    } catch (error) {
        logger.error('Database', filename, 'Error fetching contact', error);
        res.status(500).json({ error: 'Server error while fetching contact', details: error.message });
    }
};

const remove = async (req, res) => {
    const { id } = req.body;
    try {
        const deletedCount = await db.Contact.destroy({
            where: { id }
        });
        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Contact not found or already deleted.' });
        }
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        logger.error('Database', filename, 'Error deleting contact', error);
        res.status(500).json({ error: 'Server error while deleting contact', details: error.message });
    }
};

const list = async (req, res) => {
    try {
        const contacts = await db.Contact.findAll({
            include: [{ model: db.People, attributes: ['name', 'lastName'] }]
        });
        res.json(contacts);
    } catch (error) {
        logger.error('Database', filename, 'Error fetching all contacts', error);
        res.status(500).json({ error: 'Server error while fetching contacts', details: error.message });
    }
};

const listOrderedByCreatedAt = async (req, res) => {
    try {
        const contacts = await db.Contact.findAll({
            include: [{ model: db.People, attributes: ['name', 'lastName'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(contacts);
    } catch (error) {
        logger.error('Database', filename, 'Error fetching contacts ordered by createdAt', error);
        res.status(500).json({ error: 'Server error while fetching contacts', details: error.message });
    }
};

module.exports = {
    read,
    remove,
    upsert,
    list,
    listOrderedByCreatedAt
};

function isValidDate(dateString) {
    return !isNaN(new Date(dateString).getTime());
}