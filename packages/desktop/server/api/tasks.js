const db = require('../../models');
const sequelize = require('../../models/sequelizeInit');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const filename = 'tasks.ts';

//* Standard CRUD operations
const upsert = async (req, res) => {
  const { uuid, text, due, completed, createdAt, updatedAt } = req.body;
  
  logger.log('Database', filename, 'Received body for Task entry', JSON.stringify(req.body, null, 2));
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const transactionResult = await sequelize.transaction(async (t) => {
      let taskEntry;
      let created = false;

      const entryData = {
        uuid: uuid || uuidv4(),
        text,
        due: due ? new Date(due) : null,
        completed: completed || false,
        createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
        updatedAt: new Date()
      };

      // Try to find an existing entry based on UUID
      taskEntry = await db.Tasks.findOne({
        where: { uuid: entryData.uuid },
        transaction: t
      });

      if (taskEntry) {
        // If found, update the existing record
        if (entryData.updatedAt > taskEntry.updatedAt) {
          await taskEntry.update(entryData, { 
            transaction: t, 
            silent: true 
          });
        } else if (entryData.updatedAt.getTime() === taskEntry.updatedAt.getTime()) {
          logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
        } else if (entryData.updatedAt < taskEntry.updatedAt) {
          logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: entryData.updatedAt, existing: taskEntry.updatedAt }, null, 2));
        } else {
          logger.error('Database', filename, 'Unexpected updatedAt condition', JSON.stringify({ incoming: entryData.updatedAt, existing: taskEntry.updatedAt }, null, 2));
        }
      } else {
        // If not found, create a new record
        taskEntry = await db.Tasks.create(entryData, { 
          transaction: t, 
          silent: true 
        });
        created = true;
      }

      return { taskEntry, created };
    });

    const logEntry = transactionResult.taskEntry.toJSON ? transactionResult.taskEntry.toJSON() : transactionResult.taskEntry;
    logger.log('Database', filename, `Transaction completed. Task entry ${transactionResult.created ? 'created' : 'updated'}:`, JSON.stringify(logEntry, null, 2));

    res.status(transactionResult.created ? 201 : 200).json(transactionResult.taskEntry);
  } catch (error) {
    logger.error('Database', filename, 'Error upserting Task entry:', error.message);
    res.status(500).json({ error: 'Server error while upserting task entry', details: error.message });
  }
};

const read = async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }
  try {
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await db.Tasks.findAll({
      where: {
        due: {
          [Op.gte]: queryDate,
          [Op.lte]: endOfDay
        }
      },
      order: [['due', 'ASC']]
    });
    res.json(tasks);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching tasks by date', error);
    res.status(500).json({ error: 'Server error while fetching tasks', details: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { uuid } = req.params;
    const deletedCount = await db.Tasks.destroy({ where: { uuid } });
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Task not found or already deleted.' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    logger.error('Database', filename, 'Error deleting task', error);
    res.status(500).json({ error: error.message || 'Failed to delete task' });
  }
};

const list = async (req, res) => {
  try {
    const items = await db.Tasks.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching all tasks', error);
    res.status(500).json({ error: 'Server error while fetching tasks', details: error.message });
  }
};

const listByRange = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required.' });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date range provided.' });
    }

    const tasks = await db.Tasks.findAll({
      where: {
        due: {
          [Op.gte]: start,
          [Op.lte]: end
        }
      },
      order: [['due', 'ASC']]
    });

    res.json(tasks);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching tasks by date range', error);
    res.status(500).json({ error: 'Server error while fetching tasks by date range', details: error.message });
  }
};

//* Specific operations

const toggleTask = async (req, res) => {
  try {
    const { itemId } = req.body;
    const item = await db.Tasks.findByPk(itemId);

    if (!item) return res.status(404).json({ error: 'Item not found' });
    
    item.completed = !item.completed;
    await item.save();
    
    res.json(item);
  } catch (error) {
    logger.error('Database', filename, 'Error toggling task', error);
    res.status(500).json({ error: 'Server error while toggling task', details: error.message });
  }
};

const getTasksDueToday = async (req, res) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    logger.log('Database', filename, 'Fetching tasks due today', todayStart, todayEnd);

    const tasks = await db.Tasks.findAll({
      where: {
        due: {
          [Op.gte]: todayStart,
          [Op.lte]: todayEnd
        },
        completed: false
      },
      order: [['due', 'ASC']]
    });

    res.json(tasks);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching tasks due today', error);
    res.status(500).json({ error: 'Server error while fetching tasks due today', details: error.message });
  }
};

module.exports = {
  upsert,
  read,
  remove,
  list,
  listByRange,
  toggleTask,
  getTasksDueToday
};

function isValidDate(dateString) {
  return !isNaN(new Date(dateString).getTime());
}