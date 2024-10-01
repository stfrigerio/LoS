const { contextBridge, ipcRenderer } = require('electron');
const { logger, enableDebugContext, disableDebugContext } = require('./logger.js');

const filename = 'preload.js'

enableDebugContext('Preload');
logger.debug('Preload', 'preload.js is running'); //&

//? Exposing .env variables
contextBridge.exposeInMainWorld('electronEnv', {
  enableDebugContext,
  disableDebugContext,
  REACT_APP_DEBUG_CONTEXTS: 'Front,Preload,FrontToDatabase,Charts',
  // REACT_APP_DEBUG_CONTEXTS: 'Charts',

});

contextBridge.exposeInMainWorld(
  //? Exposing send/on/removeListeners
  'electron',
  {
    send: (channel, ...data) => {
      let validChannels = [
        'change-theme',
        'save-data',
        'run-gpt-generation'
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, ...data);
        logger.debug('Preload', filename, `send - Data sent on channel "${channel}":`, JSON.stringify(data, null, 2)); //&
      }
    },

    on: function on(channel, func) {
      var validChannels = [
        //* Style
        'update-theme',
        'change-theme',
        //* Miscellanea
        'python-script-done'
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, function(event, ...args) {
          logger.debug('Preload', filename, `on - Data received on channel "${channel}":`, JSON.stringify(args, null, 2)); //&

          // Special channels that should pass the event object as well as the first argument
          const channelsWithEvent = ['start-timer', 'update-tab-title', 'update-theme'];
          
          if (channelsWithEvent.includes(channel)) {
            func(event, args[0]);
            return;
          }

          if (args.length === 0) {
            func();
          } else if (args.length === 1) {
            func(args[0]);
          } else {
            func(...args);
          }
        });
      }},

    removeListener: (channel, func) => {
      let validChannels = [
        'update-theme',
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
    }},

    onTabsUpdated: (callback) => ipcRenderer.on('tabs-updated', callback),
  }
);

