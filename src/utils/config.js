import fs from 'fs';
import { logger } from './logger.js';
import { getConfigPath } from './gitPaths.js';

export function readConfig() {
  try {
    const configPath = getConfigPath();
    if (!fs.existsSync(configPath)) {
      return {};
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (error) {
    logger.error(`Failed to read config: ${error.message}`);
    return {};
  }
}

export function writeConfig(config) {
  try {
    const configPath = getConfigPath();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
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