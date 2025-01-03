import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

const CONFIG_PATH = '_git/config.json';

export function readConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return {};
    }
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch (error) {
    logger.error(`Failed to read config: ${error.message}`);
    return {};
  }
}

export function writeConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    logger.debug('Config updated successfully');
  } catch (error) {
    throw new Error(`Failed to write config: ${error.message}`);
  }
}

export function updateConfig(updates) {
  const config = readConfig();
  const newConfig = { ...config, ...updates };
  writeConfig(newConfig);
  return newConfig;
}