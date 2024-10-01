const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const sequelize = require('../../models/sequelizeInit');
const { v4: uuidv4 } = require('uuid');

const filename = 'money.ts';

//* Standard CRUD operations

const upsert = async (req, res) => {
  const { uuid, date, amount, type, tag, description, due, createdAt, updatedAt } = req.body;

  logger.log('Database', 'money.ts', 'Received body for Money entry', JSON.stringify(req.body, null, 2));

  if (!date || amount === undefined || !type) {
    return res.status(400).json({ error: 'Date, amount, and type are required' });
  }

  try {
    const transactionResult = await sequelize.transaction(async (t) => {
      let moneyEntry;
      let created = false;

      const entryData = {
        uuid: uuid || uuidv4(),
        date: new Date(date),
        amount,
        type,
        tag,
        description,
        due: due ? new Date(due) : null,
        createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
        updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date()
      };

      // Try to find an existing entry based on UUID
      moneyEntry = await db.Money.findOne({
        where: { uuid: entryData.uuid },
        transaction: t
      });

      if (moneyEntry) {
        // If found, update the existing record
        if (entryData.updatedAt > moneyEntry.updatedAt) {
          await moneyEntry.update(entryData, { 
            transaction: t, 
            silent: true 
          });
        } else if (entryData.updatedAt.getTime() === moneyEntry.updatedAt.getTime()) {
          logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
        } else if (entryData.updatedAt < moneyEntry.updatedAt) {
            logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: entryData.updatedAt, existing: moneyEntry.updatedAt }, null, 2));
        } else {
            logger.error('Database', filename, 'Unexpected updatedAt condition', JSON.stringify({ incoming: entryData.updatedAt, existing: moneyEntry.updatedAt }, null, 2));
        }
      } else {
        // If not found, create a new record
        moneyEntry = await db.Money.create(entryData, { 
          transaction: t, 
          silent: true 
        });
        created = true;
      }

      return { moneyEntry, created };
    });

    const logEntry = transactionResult.moneyEntry.toJSON ? transactionResult.moneyEntry.toJSON() : transactionResult.moneyEntry;
    logger.log('Database', 'money.ts', `Transaction completed. Money entry ${transactionResult.created ? 'created' : 'updated'}:`, JSON.stringify(logEntry, null, 2));

    res.status(transactionResult.created ? 201 : 200).json(transactionResult.moneyEntry);
  } catch (error) {
    logger.error('Database', 'money.ts', 'Error upserting Money entry:', error.message);
    res.status(500).json({ error: 'Server error while upserting money entry', details: error.message });
  }
};

const read = async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }
  try {
    const record = await db.Money.findOne({
      where: { date }
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching money record by date', error);
    res.status(500).json({ error: 'Server error while fetching money record', details: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { uuid } = req.params;

    const deletedCount = await db.Money.destroy({
      where: { uuid }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Record not found or already deleted.' });
    }

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    logger.error('Database', filename, 'Error deleting money record', error);
    res.status(500).json({ error: error.message || 'Server error while deleting money record' });
  }
};

const list = async (req, res) => {
  try {
    const records = await db.Money.findAll();
    res.json(records);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching all money records', error);
    res.status(500).json({ error: 'Server error while fetching money records', details: error.message });
  }
};

const listByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate || isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
      return res.status(400).json({
        error: 'Invalid date range provided. Please ensure both start date and end date are valid dates.'
      });
    }

    const records = await db.Money.findAll({
      where: {
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      }
    });

    res.json(records);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching money records by date range', error);
    res.status(500).json({ error: 'Server error while fetching money records by date range', details: error.message });
  }
};

//* Specific operations

const listByType = async (req, res) => {
  try {
    const type = req.params.type;

    const records = await db.Money.findAll({
      where: { type: type }
    });

    res.json(records);
  } catch (error) {
    logger.error('Database', filename, `Error fetching money records by type: ${req.params.type}`, error);
    res.status(500).json({ error: 'Server error while fetching money records by type', details: error.message });
  }
};

const listByTypeAndRange = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate || isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
      return res.status(400).json({
        error: 'Invalid date range provided. Please ensure both start date and end date are valid dates.'
      });
    }

    const records = await db.Money.findAll({
      where: {
        type: type,
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      }
    });

    res.json(records);
  } catch (error) {
    logger.error('Database', filename, `Error fetching money records by type: ${req.params.type} and date range: ${req.query.startDate} - ${req.query.endDate}`, error);
    res.status(500).json({ error: 'Server error while fetching money records by type and date range', details: error.message });
  }
};

module.exports = {
  upsert,
  read,
  remove,
  list,
  listByRange,
  listByType,
  listByTypeAndRange
};

function isValidDate(dateString) {
  return !isNaN(new Date(dateString).getTime());
}