import { databaseManagers } from "../../../database/tables";

const NODE_PORT = '3001';
const FLASK_PORT = '5050';

export const fetchServerIP = async (): Promise<string> => {
  try {
    const settings = await databaseManagers.userSettings.list();    
    const serverIPSetting = settings.find(setting => setting.settingKey === 'serverUrl');
    if (!serverIPSetting) {
      console.log('Server IP setting not found');
      return '';
    }

    return serverIPSetting.value || '';
  } catch (error) {
    console.error('Failed to fetch server IP:', error);
    return '';
  }
};

let SERVER_IP: string | null = null;

export const getServerIP = async (): Promise<string> => {
  if (!SERVER_IP) {
    const ip = await fetchServerIP();
    if (!ip) {
      throw new Error('SERVER_IP not found');
    }
    SERVER_IP = ip;
  }
  return SERVER_IP;
};

export const getNodeServerURL = async (): Promise<string> => {
  const ip = await getServerIP();
  const url = `http://${ip}:${NODE_PORT}`;
  // console.log('Node server URL:', url);
  return url;
};

export const getFlaskServerURL = async (): Promise<string> => {
  const ip = await getServerIP();
  const url = `http://${ip}:${FLASK_PORT}`;
  // console.log('Flask server URL:', url);
  return url;
};