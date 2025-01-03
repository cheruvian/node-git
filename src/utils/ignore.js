import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

// Default patterns that should always be ignored
const DEFAULT_PATTERNS = [
  '**/node_modules/**',
  '**/_git/**',
  '_git',
  'package-lock.json'
];

export function getIgnorePatterns(directory = '.') {
  const patterns = [...DEFAULT_PATTERNS];
  const gitignorePath = path.join(directory, '.gitignore');

  if (fs.existsSync(gitignorePath)) {
    try {
      const gitignorePatterns = fs.readFileSync(gitignorePath, 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
      patterns.push(...gitignorePatterns);
    } catch (error) {
      logger.debug(`Error reading .gitignore: ${error.message}`);
    }
  }

  return patterns;
}