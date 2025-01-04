import { logger } from '../logger.js';
import { readConfig } from '../config.js';

export function getCommitInfo() {
  const config = readConfig();
  const commit = config.lastCommit;
  
  if (!commit) {
    return null;
  }

  return {
    hash: commit,
    shortHash: commit.substring(0, 7)
  };
}