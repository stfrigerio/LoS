const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const filename = 'text.js';

//* Standard CRUD operations
const upsert = async (req, res) => {
  const { uuid, period, key, text, createdAt, updatedAt } = req.body;

  logger.log('Database', filename, 'Received body for Text entry', JSON.stringify(req.body, null, 2));

  if (!period || !key || text === undefined) {
    return res.status(400).json({ error: 'Period, key, and text are required' });
  }

  try {
    const transactionResult = await db.sequelize.transaction(async (t) => {
      let textEntry;
      let created = false;

      const entryData = {
        uuid: uuid || uuidv4(),
        period,
        key,
        text,
        createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
        updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date()
      };

      // Try to find an existing entry based on UUID
      textEntry = await db.Text.findOne({
        where: { uuid: entryData.uuid },
        transaction: t
      });

      if (textEntry) {
        // If found, update the existing record
        if (entryData.updatedAt > textEntry.updatedAt) {
          await textEntry.update(entryData, { 
            transaction: t, 
            silent: true 
          });
        } else if (entryData.updatedAt.getTime() === textEntry.updatedAt.getTime()) {
          logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
        } else if (entryData.updatedAt < textEntry.updatedAt) {
          logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: entryData.updatedAt, existing: textEntry.updatedAt }, null, 2));
        } else {
          logger.error('Database', filename, 'Unexpected updatedAt condition', JSON.stringify({ incoming: entryData.updatedAt, existing: textEntry.updatedAt }, null, 2));
        }
      } else {
        // If not found, create a new record
        textEntry = await db.Text.create(entryData, { 
          transaction: t, 
          silent: true 
        });
        created = true;
      }

      return { textEntry, created };
    });

    const logEntry = transactionResult.textEntry.toJSON ? transactionResult.textEntry.toJSON() : transactionResult.textEntry;
    logger.log('Database', filename, `Transaction completed. Text entry ${transactionResult.created ? 'created' : 'updated'}:`, JSON.stringify(logEntry, null, 2));

    res.status(transactionResult.created ? 201 : 200).json(transactionResult.textEntry);
  } catch (error) {
    logger.error('Database', filename, 'Error upserting Text entry:', error.message);
    res.status(500).json({ error: 'Server error while upserting text entry', details: error.message });
  }
};

const read = async (req, res) => {
  const { period } = req.query;
  if (!period) {
    return res.status(400).json({ error: 'Period is required' });
  }
  try {
    const textData = await db.Text.findAll({
      where: { period }
    });

    if (!textData) {
      return res.status(200).json({});
    }

    return res.status(200).json(textData);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching text data', error);
    return res.status(500).json({ error: 'Server error while fetching text data', details: error.message });
  }
};

const remove = async (req, res) => {
  const { uuid } = req.params;
  try {
    const deletedCount = await db.Text.destroy({
      where: { uuid }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Text data not found or already deleted.' });
    }

    res.status(200).json({ message: 'Text data deleted successfully' });
  } catch (error) {
    logger.error('Database', filename, 'Error deleting text data', error);
    res.status(500).json({ error: 'Server error while deleting text data', details: error.message });
  }
};

const list = async (req, res) => {
  try {
    const allTextData = await db.Text.findAll();
    res.json(allTextData);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching all text data', error);
    res.status(500).json({ error: 'Server error while fetching all text data', details: error.message });
  }
};

const listByRange = async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }
  try {
    const textData = await db.Text.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC']]
    });
    res.json(textData);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching text data by date range', error);
    res.status(500).json({ error: 'Server error while fetching text data by date range', details: error.message });
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