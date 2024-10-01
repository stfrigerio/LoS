const { app, ipcMain } = require('electron');
const { logger } = require('./logger.js');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const filename = 'ipcHandlers.js'

module.exports = function setupIpcHandlers(mainWindow) {

    //* Style

    ipcMain.on('change-theme', async (event, newTheme) => {
        mainWindow.webContents.send('update-theme', newTheme);
    });

    //* Miscellanea

    ipcMain.on('save-data', (event, data) => {
      const dataStr = JSON.stringify(data, null, 2);
      const rootPath = path.join(path.dirname(app.getAppPath()), 'desktop');
      console.log('rootPath', rootPath);
      const directory = path.join(rootPath, 'python');

      if (!fs.existsSync(directory)){
        fs.mkdirSync(directory, { recursive: true });
      }
    
      const filepath = path.join(directory, 'savedData.json');
    
      fs.writeFile(filepath, dataStr, (err) => {
        if (err) {
          logger.error('MainProcess', filename, 'Failed to save data:', err);
          event.reply('save-data-reply', 'Failed to save data.');
        } else {
          event.reply('save-data-reply', 'Data saved successfully!');
        }
      });
    });

    ipcMain.on('run-gpt-generation', (event, filename) => {
      const rootPath = path.join(path.dirname(app.getAppPath()), 'desktop');
      const filepath = path.join(rootPath, 'python', filename);
  
      console.log('spawning python process');
      const pythonProcess = spawn('python', [filepath], {
          cwd: path.join(rootPath, 'python'), // Set the working directory
          stdio: ['ignore', 'inherit', 'inherit'] // Inherit stdout and stderr
      });

      pythonProcess.on('error', (err) => {
          logger.error('MainProcess', filename, 'Failed to start subprocess.', err);
      });

      pythonProcess.on('exit', (code) => {
          logger.debug('MainProcess', filename, `Python process exited with code ${code}`);
          event.sender.send('python-script-done', { code });
      });
    });
};