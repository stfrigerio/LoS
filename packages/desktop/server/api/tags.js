const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const filename = 'tags.js';

//* Standard CRUD operations
const upsert = async (req, res) => {
  const { uuid, text, type, emoji, linkedTag, createdAt, updatedAt } = req.body;
  logger.log('Database', filename, 'Received body for Tag entry', JSON.stringify(req.body, null, 2));

  if (!text || !type) {
    return res.status(400).json({ error: 'Text and type are required' });
  }

  try {
    const transactionResult = await db.sequelize.transaction(async (t) => {
      let tagEntry;
      let created = false;

      const entryData = {
        uuid: uuid || uuidv4(),
        text,
        type,
        emoji: emoji || null,
        linkedTag: linkedTag || null,
        createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
        updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date()
      };

      // Try to find an existing entry based on UUID
      tagEntry = await db.Tags.findOne({
        where: { uuid: entryData.uuid },
        transaction: t
      });

      if (tagEntry) {
        // If found, update the existing record
        if (entryData.updatedAt > tagEntry.updatedAt) {
          await tagEntry.update(entryData, { 
            transaction: t, 
            silent: true 
          });
        } else if (entryData.updatedAt.getTime() === tagEntry.updatedAt.getTime()) {
          logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
        } else if (entryData.updatedAt < tagEntry.updatedAt) {
          logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: entryData.updatedAt, existing: tagEntry.updatedAt }, null, 2));
        } else {
          logger.error('Database', filename, 'Unexpected updatedAt condition', JSON.stringify({ incoming: entryData.updatedAt, existing: tagEntry.updatedAt }, null, 2));
        }
      } else {
        // If not found, create a new record
        tagEntry = await db.Tags.create(entryData, { 
          transaction: t, 
          silent: true 
        });
        created = true;
      }

      return { tagEntry, created };
    });

    const logEntry = transactionResult.tagEntry.toJSON ? transactionResult.tagEntry.toJSON() : transactionResult.tagEntry;
    logger.log('Database', filename, `Transaction completed. Tag entry ${transactionResult.created ? 'created' : 'updated'}:`, JSON.stringify(logEntry, null, 2));

    res.status(transactionResult.created ? 201 : 200).json(transactionResult.tagEntry);
  } catch (error) {
    logger.error('Database', filename, 'Error upserting Tag entry:', error.message);
    res.status(500).json({ error: 'Server error while upserting tag entry', details: error.message });
  }
};

const read = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Tag ID is required' });
  }
  try {
    const tag = await db.Tags.findByPk(id);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(tag);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching tag', error);
    res.status(500).json({ error: 'Server error while fetching tag', details: error.message });
  }
};

const remove = async (req, res) => {
  const { uuid } = req.params;
  try {
    const deletedCount = await db.Tags.destroy({
      where: { uuid }
    });
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Tag not found or already deleted.' });
    }
    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    logger.error('Database', filename, 'Error deleting tag', error);
    res.status(500).json({ error: error.message || 'Server error while deleting tag' });
  }
};

const list = async (req, res) => {
  try {
    const tags = await db.Tags.findAll();
    res.json(tags);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching all tags', error);
    res.status(500).json({ error: 'Server error while fetching tags', details: error.message });
  }
};

//* Custom methods

const getTagsByType = async (req, res) => {
    const { type } = req.params;
    try {
        const tags = await db.Tags.findAll({
        where: { type }
        });
        res.json(tags);
    } catch (error) {
        logger.error('Database', filename, 'Error fetching tags by type', error);
        res.status(500).json({ error: 'Server error while fetching tags', details: error.message });
    }
};
  
const getDescriptionsByTag = async (req, res) => {
    const { tag } = req.params;
    try {
      const descriptions = await db.Tags.findAll({
        where: { linkedTag: tag }
      });
      res.json(descriptions);
    } catch (error) {
      logger.error('Database', filename, 'Error fetching descriptions by tag', error);
      res.status(500).json({ error: 'Server error while fetching descriptions', details: error.message });
    }
};

module.exports = {
  read,
  remove,
  upsert,
  list,
  getTagsByType,
  getDescriptionsByTag
};

function isValidDate(dateString) {
  return !isNaN(new Date(dateString).getTime());
}