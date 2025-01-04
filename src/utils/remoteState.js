import fs from 'fs';
import { logger } from './logger.js';
import { getConfigPath } from './gitPaths.js';

export function getRemoteState() {
  try {
    const configPath = getConfigPath();
    if (!fs.existsSync(configPath)) {
      return null;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (!config.remote?.origin) {
      return null;
    }

    return {
      owner: config.remote.origin.owner,
      repo: config.remote.origin.repo
    };
  } catch (error) {
    logger.debug(`Error reading git config: ${error.message}`);
    return null;
  }
}