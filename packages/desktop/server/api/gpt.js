const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const sequelize = require('../../models/sequelizeInit');
const { v4: uuidv4 } = require('uuid');

const filename = 'gptController.ts';

//* Standard CRUD operations
const upsert = async (req, res) => {
  try {
    const { uuid, date, type, summary, createdAt, updatedAt } = req.body;
    logger.log('Database', filename, 'Received GPT record:', JSON.stringify(req.body, null, 2));

    if (!date || !type || !summary) {
      return res.status(400).json({ error: 'Date, type, and summary are required' });
    }

    const recordData = {
      date,
      type,
      summary,
      uuid: uuid || uuidv4(),
      createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
      updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date()
    };

    let record;
    let created = false;

    const transactionResult = await sequelize.transaction(async (t) => {

      const existingRecord = await db.GPT.findOne({ where: { uuid: recordData.uuid } });

      if (existingRecord) {
        // Update existing record
        if (recordData.updatedAt > existingRecord.updatedAt) {
          await existingRecord.update(recordData, { 
            transaction: t, 
            silent: true 
          });
          record = existingRecord;
        } else if (recordData.updatedAt.getTime() === existingRecord.updatedAt.getTime()) {
          logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
        } else if (recordData.updatedAt < existingRecord.updatedAt) {
            logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: recordData.updatedAt, existing: existingRecord.updatedAt }, null, 2));
        } else {
            logger.error('Database', filename, 'Unexpected updatedAt condition', JSON.stringify({ incoming: recordData.updatedAt, existing: existingRecord.updatedAt }, null, 2));
        }
      } else {
        // Create new record
        record = await db.GPT.create(recordData, { 
          transaction: t,
          silent: true
        });
        created = true;
      }

      if (!record) {
        return res.status(404).json({ error: 'Failed to upsert the GPT record.' });
      }

      return { record, created };
    });

    const logEntry = transactionResult.record.toJSON ? transactionResult.record.toJSON() : transactionResult.record;
    logger.log('Database', filename, `Transaction completed. GPT entry ${transactionResult.created ? 'created' : 'updated'}:`, JSON.stringify(logEntry, null, 2));

    res.status(transactionResult.created ? 201 : 200).json(transactionResult.record);
  } catch (error) {
    logger.error('Database', filename, 'Error upserting GPT entry:', error.message);
    res.status(500).json({ error: 'Server error while upserting GPT entry', details: error.message });
  }
};

const read = async (req, res) => {
  try {
    const { date } = req.query; // Expects a date string like "2023-W23" or "2023-03"

    if (!date) {
      return res.status(400).json({ error: 'Please provide a date parameter.' });
    }

    const records = await db.GPT.findAll({
      where: {
        date: date // Direct match to the exact string
      },
      order: [['date', 'ASC']]
    });

    res.json(records);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching GPT records by date', error);
    res.status(500).json({ error: 'Server error while fetching GPT records by date', details: error.message });
  }
};

const remove = async (req, res) => {
  const { uuid } = req.params;
  try {
    const deletedCount = await db.GPT.destroy({
      where: { uuid }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Record not found or already deleted.' });
    }

    res.json({ message: 'GPT record deleted successfully' });
  } catch (error) {
    logger.error('Database', filename, 'Error deleting GPT record', error);
    res.status(500).json({ error: 'Server error while deleting GPT record', details: error.message });
  }
};

const list = async (req, res) => {
  try {
    const records = await db.GPT.findAll();
    res.json(records);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching GPT records', error);
    res.status(500).json({ error: 'Server error while fetching GPT records', details: error.message });
  }
};

const getByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Please provide a date parameter.' });
    }

    const record = await db.GPT.findOne({
      where: {
        date: date
      }
    });
    if (!record) {
      return res.status(200).json({ message: 'Record not found', data: null });
    }

    res.json(record);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching GPT record by date', error);
    res.status(500).json({ error: 'Server error while fetching GPT record', details: error.message });
  }
}

module.exports = {
  upsert,
  read,
  remove,
  list,
  getByDate
};

function isValidDate(dateString) {
  return !isNaN(new Date(dateString).getTime());
}