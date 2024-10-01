// logger.js
const isDev = true;

// ANSI escape codes for terminal color
const terminalColors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// CSS styles for browser console color
const browserColors = {
  cyan: 'color: cyan',
  green: 'color: green',
  red: 'color: red',
  yellow: 'color: yellow',
  blue: 'color: blue',
};
  
// Set up your debug contexts
const contexts = {
  Database: false,
  Front: false,
  FrontToDatabase: false,
  MainProcess: false,
  Preload: false,
  Charts: false
};

// Function to enable specific debug contexts
const enableDebugContext = (context) => {
  if (contexts.hasOwnProperty(context)) {
    contexts[context] = true;
  }
};

// Function to disable specific debug contexts
const disableDebugContext = (context) => {
  if (contexts.hasOwnProperty(context)) {
    contexts[context] = false;
  }
};

const isBrowserEnv = () => typeof window !== 'undefined';

const logger = {
  debug: (context, fileName, ...args) => {
    if (isDev && contexts[context]) {
      const formattedContext = `[${context}](${fileName})`;
      const message = args.join(' ');

      if (isBrowserEnv()) {
        console.log(`%c${formattedContext}%c ${message}`, browserColors.cyan, 'color: inherit');
      } else {
        console.log(`${terminalColors.cyan}${formattedContext}${terminalColors.reset} ${message}`);
      }
    }
  },
  log: (fileName, ...args) => {
    if (isDev) {
      const formattedContext = `[Log](${fileName})`;
      const message = args.join(' ');

      if (isBrowserEnv()) {
        console.log(`%c${formattedContext}%c ${message}`, browserColors.green, 'color: inherit');
      } else {
        console.log(`${terminalColors.green}${formattedContext}${terminalColors.reset} ${message}`);
      }
    }
  },
  error: (fileName, ...args) => {
    if (isDev) {
      const formattedContext = `[Error](${fileName})`;
      const message = args.join(' ');

      if (isBrowserEnv()) {
        console.error(`%c${formattedContext}%c ${message}`, browserColors.red, 'color: inherit');
      } else {
        console.error(`${terminalColors.red}${formattedContext}${terminalColors.reset} ${message}`);
      }
    }
  },
  warn: (fileName, ...args) => {
    if (isDev) {
      const formattedContext = `[Warning](${fileName})`;
      const message = args.join(' ');

      if (isBrowserEnv()) {
        console.warn(`%c${formattedContext}%c ${message}`, browserColors.yellow, 'color: inherit');
      } else {
        console.warn(`${terminalColors.yellow}${formattedContext}${terminalColors.reset} ${message}`);
      }
    }
  },
  info: (fileName, ...args) => {
    if (isDev) {
      const formattedContext = `[Info](${fileName})`;
      const message = args.join(' ');

      if (isBrowserEnv()) {
        console.info(`%c${formattedContext}%c ${message}`, browserColors.blue, 'color: inherit');
      } else {
        console.info(`${terminalColors.blue}${formattedContext}${terminalColors.reset} ${message}`);
      }
    }
  },
};

module.exports = { logger, enableDebugContext, disableDebugContext };