const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const filename = 'moodController.js';

//* Standard CRUD operations
const upsert = async (req, res) => {
  const { uuid, date, rating, comment, tag, description, createdAt, updatedAt } = req.body;

  logger.log('Database', filename, 'Received body for Mood entry', JSON.stringify(req.body, null, 2));

  if (!date || rating === undefined) {
    return res.status(400).json({ error: 'Date and rating are required' });
  }

  try {
    const transactionResult = await db.sequelize.transaction(async (t) => {
      let moodEntry;
      let created = false;

      const entryData = {
        uuid: uuid || uuidv4(),
        date: date,
        rating,
        comment: comment || null,
        tag: tag || null,
        description: description || null,
        createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
        updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date()
      };

      // Try to find an existing entry based on UUID
      moodEntry = await db.Mood.findOne({
        where: { uuid: entryData.uuid },
        transaction: t
      });

      if (moodEntry) {
        // If found, update the existing record
        if (entryData.updatedAt > moodEntry.updatedAt) {
          await moodEntry.update(entryData, { 
            transaction: t, 
            silent: true 
          });
        } else if (entryData.updatedAt.getTime() === moodEntry.updatedAt.getTime()) {
          logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
        } else if (entryData.updatedAt < moodEntry.updatedAt) {
          logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: entryData.updatedAt, existing: moodEntry.updatedAt }, null, 2));
        } else {
          logger.error('Database', filename, 'Unexpected updatedAt condition', JSON.stringify({ incoming: entryData.updatedAt, existing: moodEntry.updatedAt }, null, 2));
        }
      } else {
        // If not found, create a new record
        moodEntry = await db.Mood.create(entryData, { 
          transaction: t, 
          silent: true 
        });
        created = true;
      }

      return { moodEntry, created };
    });

    const logEntry = transactionResult.moodEntry.toJSON ? transactionResult.moodEntry.toJSON() : transactionResult.moodEntry;
    logger.log('Database', filename, `Transaction completed. Mood entry ${transactionResult.created ? 'created' : 'updated'}:`, JSON.stringify(logEntry, null, 2));

    res.status(transactionResult.created ? 201 : 200).json(transactionResult.moodEntry);
  } catch (error) {
    logger.error('Database', filename, 'Error upserting Mood entry:', error.message);
    res.status(500).json({ error: 'Server error while upserting mood entry', details: error.message });
  }
};

const read = async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }
  try {
    const record = await db.Mood.findOne({
      where: { date }
    });
    if (!record) {
      return res.status(404).json({ error: 'Mood record not found' });
    }
    res.json(record);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching mood record by date', error);
    res.status(500).json({ error: 'Server error while fetching mood record', details: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { uuid } = req.params;

    const deletedCount = await db.Mood.destroy({
      where: { uuid }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Record not found or already deleted.' });
    }

    res.status(200).json({ message: 'Mood record deleted successfully' });
  } catch (error) {
    logger.error('Database', filename, 'Error deleting mood record', error);
    res.status(500).json({ error: error.message || 'Server error while deleting mood record' });
  }
};

const list = async (req, res) => {
  try {
    const records = await db.Mood.findAll();
    res.json(records);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching all mood records', error);
    res.status(500).json({ error: 'Server error while fetching mood records', details: error.message });
  }
};

const listByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Please provide both startDate and endDate parameters.' });
    }

    const records = await db.Mood.findAll({
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
    logger.error('Database', filename, 'Error fetching mood records by date range', error);
    res.status(500).json({ error: 'Server error while fetching mood records by date range', details: error.message });
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