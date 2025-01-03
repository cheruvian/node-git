import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

export function getRemoteState() {
  try {
    const gitConfigPath = path.join('.git', 'config');
    if (!fs.existsSync(gitConfigPath)) {
      return null;
    }

    const config = fs.readFileSync(gitConfigPath, 'utf-8');
    const remoteMatch = config.match(/url = https:\/\/github\.com\/(.+)\/(.+)\.git/);
    
    if (!remoteMatch) {
      return null;
    }

    return {
      owner: remoteMatch[1],
      repo: remoteMatch[2]
    };
  } catch (error) {
    logger.debug(`Error reading git config: ${error.message}`);
    return null;
  }
}