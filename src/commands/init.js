import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import { createDirectory } from '../utils/fs.js';
import { createSnapshot } from '../utils/snapshot.js';
import { writeConfig } from '../utils/config.js';

export async function init() {
  try {
    const gitDir = '_git';
    
    // Check if we're inside a _git directory
    if (path.basename(process.cwd()) === gitDir) {
      throw new Error('Cannot initialize git repository inside _git directory');
    }

    // Check if _git already exists
    if (fs.existsSync(gitDir)) {
      throw new Error('Git repository already exists');
    }

    // Create _git directory
    createDirectory(gitDir);
    
    // Initialize empty config
    writeConfig({});
    
    // Create initial snapshot
    await createSnapshot('.');
    
    logger.success('Initialized empty Git repository');
  } catch (error) {
    logger.error(`Init failed: ${error.message}`);
    process.exit(1);
  }
}