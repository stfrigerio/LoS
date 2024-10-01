const db = require('../../models');
const { logger } = require('../../src/electron/main/logger');
const { Op } = require('sequelize');
const sequelize = require('../../models/sequelizeInit');
const { v4: uuidv4 } = require('uuid');

const filename = 'userSettings.js';

//* Standard CRUD operations
const upsert = async (req, res) => {
  const { uuid, settingKey, value, type, createdAt, updatedAt } = req.body;
  
  if (!settingKey) {
    return res.status(400).json({ error: 'Setting key is required' });
  }

  try {
    let setting;
    let created = false;
    
    const transactionResult = await sequelize.transaction(async (t) => {

      const entryData = {
        uuid: uuid || uuidv4(),
        settingKey,
        value,
        type,
        createdAt: isValidDate(createdAt) ? new Date(createdAt) : new Date(),
        updatedAt: isValidDate(updatedAt) ? new Date(updatedAt) : new Date()
      };

      // Try to find an existing record
      setting = await db.UserSettings.findOne({ where: { uuid: entryData.uuid } });

      if (setting) {
        // Update existing record if incoming updatedAt is more recent
        if (entryData.updatedAt > setting.updatedAt) {
          await setting.update(entryData, { 
            transaction: t, 
            silent: true 
          });
        } else if (entryData.updatedAt.getTime() === setting.updatedAt.getTime()) {
          logger.warn('Database', filename, 'Incoming updatedAt is equal to existing updatedAt, skipping');
        } else if (entryData.updatedAt < setting.updatedAt) {
          logger.warn('Database', filename, 'Incoming updatedAt is older than existing updatedAt', JSON.stringify({ incoming: entryData.updatedAt, existing: setting.updatedAt }, null, 2));
        } else {
          logger.error('Database', filename, 'Unexpected updatedAt condition', JSON.stringify({ incoming: entryData.updatedAt, existing: setting.updatedAt }, null, 2));
        }
      } else {
        // Create a new record
        setting = await db.UserSettings.create(entryData, { 
          transaction: t, 
          silent: true 
        });
        created = true;
      }
    
      return { setting, created };
    });


    const logEntry = transactionResult.setting.toJSON ? transactionResult.setting.toJSON() : transactionResult.setting;
    logger.log('Database', 'userSetting.ts', `Transaction completed. userSetting entry ${transactionResult.created ? 'created' : 'updated'}:`, JSON.stringify(logEntry, null, 2));

    res.status(transactionResult.created ? 201 : 200).json(transactionResult.setting);
  } catch (error) {
    logger.error('Database', 'userSetting.ts', 'Error upserting userSetting entry:', error.message);
    res.status(500).json({ error: 'Server error while upserting userSetting entry', details: error.message });
  }
};

const read = async (req, res) => {
  const { settingKey } = req.query;
  if (!settingKey) {
    return res.status(400).json({ error: 'Setting key is required' });
  }
  try {
    const setting = await db.UserSettings.findOne({
      where: { settingKey }
    });
    if (!setting) {
      return res.status(404).json({ error: 'User setting not found' });
    }
    res.json(setting);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching user setting', error);
    res.status(500).json({ error: 'Server error while fetching user setting', details: error.message });

  }
};

const remove = async (req, res) => {
  const { uuid } = req.params;
  try {
    const deletedCount = await db.UserSettings.destroy({
      where: { uuid }
    });
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'User setting not found or already deleted.' });
    }
    res.status(200).json({ message: 'User setting deleted successfully' });
  } catch (error) {
    logger.error('Database', filename, 'Error deleting user setting', error);
    res.status(500).json({ error: 'Server error while deleting user setting', details: error.message });
  }
};

const list = async (req, res) => {
  try {
    const settings = await db.UserSettings.findAll();
    res.json(settings);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching all user settings', error);
    res.status(500).json({ error: 'Server error while fetching user settings', details: error.message });
  }
};

//* Custom methods based on userSettingsTable.ts

const getByKey = async (req, res) => {
  const { settingKey } = req.params;
  try {
    const setting = await db.UserSettings.findOne({
      where: { settingKey }
    });
    
    if (!setting) {
      return res.status(200).json({ 
        settingKey,
        message: 'No data found for this settingKey'
      });
    }

    res.json(setting);
  } catch (error) {
    logger.error('Database', filename, 'Error fetching user setting by key', error);
    res.status(500).json({ error: 'Server error while fetching user setting', details: error.message });
  }
};
  
const getByType = async (req, res) => {
  const { type } = req.params;
  try {
    const settings = await db.UserSettings.findAll({
      where: { type }
    });

    if (!settings) {
      return res.status(200).json({ 
        type,
        message: 'No data found for this type'
      });
    }

    res.json(settings);
  } catch (error) {

    logger.error('Database', filename, 'Error fetching user settings by type', error);
    res.status(500).json({ error: 'Server error while fetching user settings', details: error.message });
  }
};
  
module.exports = {
  upsert,
  read,
  remove,
  list,
  getByKey,
  getByType
};

function isValidDate(dateString) {
  return !isNaN(new Date(dateString).getTime());
}