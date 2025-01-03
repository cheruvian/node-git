import { execSync } from 'child_process';
import { logger } from './logger.js';
import fs from 'fs';
import path from 'path';

export function initGitRepo(directory) {
  try {
    const gitPath = path.join(directory, '.git');
    if (fs.existsSync(gitPath)) {
      logger.debug('Git repository already initialized');
      return;
    }

    logger.debug('Initializing git repository...');
    execSync('git init', { cwd: directory });
    
    // Create initial .gitignore if it doesn't exist
    const gitignorePath = path.join(directory, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      const defaultGitignore = [
        'node_modules/',
        '.env',
        '.DS_Store',
        '*.log'
      ].join('\n');
      fs.writeFileSync(gitignorePath, defaultGitignore);
    }
    
    logger.debug('Git repository initialized successfully');
  } catch (error) {
    throw new Error(`Failed to initialize git repository: ${error.message}`);
  }
}