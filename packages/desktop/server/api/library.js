const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const sequelize = require('../../models/sequelizeInit');
const { v4: uuidv4 } = require('uuid');

const filename = 'library.js';

//* Standard CRUD operations

const upsert = async (req, res) => {
  const { uuid, title, releaseYear, type, genre, creator, rating, comments, mediaImage, boxOffice, plot, cast, writer, metascore, ratingImdb, tomato, runtime, awards, seasons, modes, igdbURL, pages, finished, seen, createdAt, updatedAt } = req.body;
  
  logger.log('Database', filename, 'Received body for Library entry', JSON.stringify(req.body, null, 2));
  
  if (!title || !releaseYear) {
    return res.status(400).json({ error: 'Title and releaseYear are required' });
  }

  try {
    const transactionResult = await sequelize.transaction(async (t) => {
      let libraryEntry;
      let created = false;
      
      const entryData = {
        uuid: uuid || uuidv4(),
        title,
        releaseYear,
        type,
        genre,
        creator,
        rating,
        comments,
        mediaImage,
        boxOffice,
        plot,
        cast,
        writer,
        metascore,
        ratingImdb,
        tomato,
        runtime,
        awards,
        seasons,
        modes,
        igdbURL,
        pages,
        finished,
        seen: seen || '-',
        createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
        updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date()
      };

      // Try to find an existing entry based on UUID
      libraryEntry = await db.Library.findOne({
        where: { uuid: entryData.uuid },
        transaction: t
      });

      if (libraryEntry) {
        // If found, update the existing record
        if (entryData.updatedAt > libraryEntry.updatedAt) {
          await libraryEntry.update(entryData, { 
            transaction: t,
            silent: true
          });
        } else if (entryData.updatedAt.getTime() === libraryEntry.updatedAt.getTime()) {
          logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
        } else if (entryData.updatedAt < libraryEntry.updatedAt) {
          logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: entryData.updatedAt, existing: libraryEntry.updatedAt }, null, 2));
        } else {
          logger.error('Database', filename, 'Unexpected updatedAt condition', JSON.stringify({ incoming: entryData.updatedAt, existing: libraryEntry.updatedAt }, null, 2));
        }
      } else {
        // If not found, create a new record
        libraryEntry = await db.Library.create(entryData, { 
          transaction: t,
          silent: true
        });
        created = true;
      }

      return { libraryEntry, created };
    });

    logger.log('Database', filename, `Transaction completed. Library entry ${transactionResult.created ? 'created' : 'updated'}:`, JSON.stringify(transactionResult.libraryEntry.toJSON(), null, 2));
    res.status(transactionResult.created ? 201 : 200).json(transactionResult.libraryEntry);
  } catch (error) {
    logger.error('Database', filename, 'Error upserting Library entry:', error.message);
    res.status(500).json({ error: 'Server error while upserting library entry', details: error.message });
  }
};


const read = async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }
  try {
    const record = await db.Library.findOne({
      where: { date }
    });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching library record by date', error);
    res.status(500).json({ error: 'Server error while fetching library record', details: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { uuid } = req.params;

    const deletedCount = await db.Library.destroy({
      where: { uuid }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Record not found or already deleted.' });
    }

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    logger.error('Database', filename, 'Error deleting library record', error);
    res.status(500).json({ error: error.message || 'Server error while deleting library record' });
  }
};

const list = async (req, res) => {
  try {
    const records = await db.Library.findAll();
    res.json(records);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching all library records', error);
    res.status(500).json({ error: 'Server error while fetching library records', details: error.message });
  }
};

const listByRange = async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }
  try {
    const records = await db.Library.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC']]
    });
    res.json(records);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching library records by date range', error);
    res.status(500).json({ error: 'Server error while fetching library records by date range', details: error.message });
  }
};

//* Specific operations

const listByType = async (req, res) => {
  try {
    const { type } = req.params;
    const records = await db.Library.findAll({
      where: { type }
    });
    res.json(records);
  } catch (error) {
    logger.error('Database', filename, `Error fetching library records by type`, error);
    res.status(500).json({ error: 'Server error while fetching library records by type', details: error.message });
  }
};

module.exports = {
  upsert,
  read,
  remove,
  list,
  listByRange,
  upsert,
  listByType
};

function isValidDate(dateString) {
  return !isNaN(new Date(dateString).getTime());
}