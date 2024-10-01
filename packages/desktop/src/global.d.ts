// Create a global.d.ts file in your project, or you can add this to an existing declaration file

// Extend the Window interface with the electron property
declare global {
    interface Window {
      electron: {
        on: (channel: string, func: (...args: any[]) => void) => void;
        send: (channel: string, ...args: any[]) => void;
        removeListener: (channel: string, func: (...args: any[]) => void) => void;
        onTabsUpdated: (callback: (event: any, data: any) => void) => void; 
      };
      electronEnv: {
        REACT_APP_DEBUG_CONTEXTS?: string;
      };
    }
  }
  
  export {}; // This file needs to be a module
  