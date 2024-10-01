require('dotenv').config();
const { app } = require('electron');
const initApp = require('./appInitializer');
const { logger, enableDebugContext } = require('./logger');
const path = require('path');

// Enable debug contexts as needed
const debugContexts = process.env.REACT_APP_DEBUG_CONTEXTS ? process.env.REACT_APP_DEBUG_CONTEXTS.split(',') : [];
debugContexts.forEach(context => enableDebugContext(context.trim()));

const filename = 'main.js'

const startURL = `file://${path.join(__dirname, '../../../dist/index.html')}`;
logger.info('MainProcess', filename, `Environment: ${process.env.NODE_ENV}`);

app.on('ready', async () => {
  logger.debug('MainProcess', filename, 'App is ready, initializing...');

  try {
    const mainWindow = await initApp(startURL);
    logger.debug('MainProcess', filename, 'Main window initialized');

    mainWindow.webContents.on('did-finish-load', () => {
      logger.debug('MainProcess', filename, 'Main window loaded');
    });

  } catch (error) {
    logger.error('MainProcess', filename, 'Error in app start:', error);
  }
});