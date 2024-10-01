const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const sequelize = require('../../models/sequelizeInit');
const { v4: uuidv4 } = require('uuid');

const filename = 'time.ts';

//* Standard CRUD operations

const upsert = async (req, res) => {
  const { uuid, date, tag, description, duration, startTime, endTime, createdAt, updatedAt } = req.body;

  logger.log('Database', filename, 'Received body for Time entry', JSON.stringify(req.body, null, 2));

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  try {
    const transactionResult = await sequelize.transaction(async (t) => {
      let timeEntry;
      let created = false;

      const entryData = {
        uuid: uuid || uuidv4(),
        date: new Date(date),
        tag,
        description,
        duration,
        startTime,
        endTime,
        createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
        updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date()
      };

      // Try to find an existing entry based on UUID
      timeEntry = await db.Time.findOne({
        where: { uuid: entryData.uuid },
        transaction: t
      });

      if (timeEntry) {
        // If found, update the existing record
        if (entryData.updatedAt > timeEntry.updatedAt) {
          await timeEntry.update(entryData, { 
            transaction: t, 
            silent: true 
          });
        } else if (entryData.updatedAt.getTime() === timeEntry.updatedAt.getTime()) {
          logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
        } else if (entryData.updatedAt < timeEntry.updatedAt) {
          logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: entryData.updatedAt, existing: timeEntry.updatedAt }, null, 2));
        } else {
          logger.error('Database', filename, 'Unexpected updatedAt condition', JSON.stringify({ incoming: entryData.updatedAt, existing: timeEntry.updatedAt }, null, 2));
        }
      } else {
        // If not found, create a new record
        timeEntry = await db.Time.create(entryData, { 
          transaction: t, 
          silent: true 
        });
        created = true;
      }

      return { timeEntry, created };
    });

    const logEntry = transactionResult.timeEntry.toJSON ? transactionResult.timeEntry.toJSON() : transactionResult.timeEntry;
    logger.log('Database', filename, `Transaction completed. Time entry ${transactionResult.created ? 'created' : 'updated'}:`, JSON.stringify(logEntry, null, 2));

    res.status(transactionResult.created ? 201 : 200).json(transactionResult.timeEntry);
  } catch (error) {
    logger.error('Database', filename, 'Error upserting Time entry:', error.message);
    res.status(500).json({ error: 'Server error while upserting time entry', details: error.message });
  }
};

const read = async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }
  try {
    const record = await db.Time.findOne({
      where: { date }
    });
    if (!record) {
      return res.status(404).json({ error: 'Time record not found' });
    }
    res.json(record);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching time record by date', error);
    res.status(500).json({ error: 'Server error while fetching time record', details: error.message });
  }
};

const remove = async (req, res) => {
  const { uuid } = req.params;
  try {
    const deletedCount = await db.Time.destroy({
      where: { uuid }
    });
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Time record not found or already deleted.' });
    }
    res.status(200).json({ message: 'Time record deleted successfully' });
  } catch (error) {
    logger.error('Database', filename, 'Error deleting time record', error);
    res.status(500).json({ error: 'Server error while deleting time record', details: error.message });
  }
};

const list = async (req, res) => {
  try {
    const records = await db.Time.findAll();
    res.json(records);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching all time records', error);
    res.status(500).json({ error: 'Server error while fetching time records', details: error.message });
  }
};

const listByRange = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required.' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Invalid dates provided.' });
  }

  try {
    const records = await db.Time.findAll({
      where: {
        date: {
          [Op.gte]: start,
          [Op.lte]: end
        }
      }
    });

    res.json(records);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching time records for date range', error);
    res.status(500).json({ error: 'Server error while fetching time records', details: error.message });
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