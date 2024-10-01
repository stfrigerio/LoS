const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const sequelize = require('../../models/sequelizeInit');
const { v4: uuidv4 } = require('uuid');

const filename = 'journal.js';

//* Standard CRUD operations
const upsert = async (req, res) => {
  try {
    const { uuid, date, text, createdAt, updatedAt } = req.body;
    logger.log('Database', filename, 'Upsert request body', JSON.stringify(req.body, null, 2));

    if (!date || !text) {
      return res.status(400).json({ error: 'Date and text are required' });
    }

    const entryData = {
      uuid: uuid || uuidv4(),
      date,
      text,
      createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
      updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date()
    };

    const transactionResult = await sequelize.transaction(async (t) => {

      let journalEntry;
      let created = false;
      
      const existingEntry = await db.Journal.findOne({ where: { uuid: entryData.uuid } });

      if (existingEntry) {
        // Update existing entry
        if (entryData.updatedAt > existingEntry.updatedAt) {
          await existingEntry.update(entryData);
          journalEntry = existingEntry;
        } else if (entryData.updatedAt.getTime() === existingEntry.updatedAt.getTime()) {
          logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
        } else if (entryData.updatedAt < existingEntry.updatedAt) {
          logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: entryData.updatedAt, existing: existingEntry.updatedAt }, null, 2));
        } else {
          logger.error('Database', filename, 'Unexpected updatedAt condition', JSON.stringify({ incoming: entryData.updatedAt, existing: existingEntry.updatedAt }, null, 2));
        }
      } else {
        // Create new entry
        journalEntry = await db.Journal.create(entryData, { 
          transaction: t,
          silent: true
        });
        created = true;
      }

      return { journalEntry, created };
    });

    if (transactionResult.journalEntry) {
      const journalEntry = transactionResult.journalEntry.toJSON ? transactionResult.journalEntry.toJSON() : transactionResult.journalEntry;
      logger.log('Database', filename, `Transaction completed. Journal entry ${transactionResult.created ? 'created' : 'updated'}:`, JSON.stringify(journalEntry, null, 2));
      res.status(transactionResult.created ? 201 : 200).json(transactionResult.journalEntry);
    } else {
      logger.warn('Database', filename, 'No journal entry was created or updated');
      res.status(204).json({ message: 'No changes were made' });
    }
  } catch (error) {
    logger.error('Database', 'journal.js', 'Error upserting Journal entry:', error.message);
    res.status(500).json({ error: 'Server error while upserting Journal entry', details: error.message });
  }
};

const read = async (req, res) => {
  const uuid = req.query.uuid;

  if (!uuid) {
    return res.status(400).json({ error: 'UUID is required' });
  }

  try {
    const journalData = await db.Journal.findOne({
      where: {
        uuid: uuid
      }
    });

    if (!journalData) {
      return res.status(200).json({});
    }

    return res.status(200).json(journalData);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching journal data', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

const remove = async (req, res) => {
  const { uuid } = req.params;

  try {
    const deleted = await db.Journal.destroy({
      where: { uuid }
    });

    if (deleted) {
      res.status(200).json({ message: 'Journal deleted successfully' });
    } else {
      res.status(404).json({ error: 'Journal not found' });
    }
  } catch (error) {
    logger.error('Database', filename, 'Error deleting journal entry', error);
    res.status(500).json({ error: 'Server error while deleting journal entry', details: error.message });
  }
};

const list = async (req, res) => {
  try {
    const allJournals = await db.Journal.findAll();
    res.status(200).json(allJournals);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching all journal entries', error);
    res.status(500).json({ error: 'Server error while fetching all journal entries', details: error.message });
  }
};

const listByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Please provide both startDate and endDate parameters.' });
    }

    const records = await db.Journal.findAll({
      where: {
        date: {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate)
        }
      },
      order: [['date', 'ASC']]
    });

    res.json(records);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching journal records by date range', error);
    res.status(500).json({ error: 'Server error while fetching journal records by date range', details: error.message });
  }
};


module.exports = {
  upsert,
  read,
  remove,
  list,
  listByRange,
};

function isValidDate(dateString) {
  return !isNaN(new Date(dateString).getTime());
}