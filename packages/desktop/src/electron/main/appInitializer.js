const path = require('path');
const setupIpcHandlers = require('./ipcHandlers');
const { BrowserWindow, Menu } = require('electron');
const { logger } = require('./logger');

const filename = 'appInitializer.js'

async function initApp(startURL) {
    let mainWindow;

    logger.debug('MainProcess', filename, 'Starting app initialization');

    try {
        mainWindow = setupMainWindow(startURL);
        setupIpc(mainWindow);

        logger.debug('MainProcess', filename, 'App initialized successfully');

    } catch (error) {
        logger.error('MainProcess', filename, 'Error initializing app:', error);
        throw error;
    }
    return mainWindow;
}

function setupMainWindow(startURL) {
    logger.debug('MainProcess', filename, 'Setting up main window');

    const mainWindow = new BrowserWindow({
        icon: path.join(__dirname, '../../../dist/assets/Los-icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../../../dist/preload.js')
        }
    });
    mainWindow.loadURL(startURL);
    
    logger.debug('MainProcess', filename, 'Main window URL loaded:', startURL);

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

    Menu.setApplicationMenu(null);
    
    return mainWindow;
}

function setupIpc(mainWindow) {
    logger.debug('MainProcess', filename, 'Setting up IPC handlers');
    setupIpcHandlers(mainWindow);
}

module.exports = initApp;