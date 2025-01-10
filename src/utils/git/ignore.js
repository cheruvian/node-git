import fs from 'fs';
import path from 'path';
import { logger } from '../logger.js';

export const GIT_IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '.git',
  '.git/**/*',
  '_git/**/*',
];

export function getGitignorePatterns(directory = '.') {
  const gitignorePath = path.join(directory, '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    return [];
  }

  try {
    return fs.readFileSync(gitignorePath, 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
  } catch (error) {
    logger.debug(`Error reading .gitignore: ${error.message}`);
    return [];
  }
}