import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

// Default patterns that should always be ignored
const DEFAULT_PATTERNS = [
  '**/node_modules/**',
  '**/_git/**',
  '_git',
  '.git/**',
  '.env',
  'package-lock.json'
];

// Cache for gitignore patterns
let gitignoreCache = {
  patterns: null,
  mtime: 0
};

export function getIgnorePatterns(directory = '.') {
  const patterns = [...DEFAULT_PATTERNS];
  const gitignorePath = path.join(directory, '.gitignore');

  if (fs.existsSync(gitignorePath)) {
    try {
      // Check if .gitignore has been modified
      const stats = fs.statSync(gitignorePath);
      if (stats.mtimeMs > gitignoreCache.mtime) {
        // Read and parse .gitignore
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
        const gitignorePatterns = gitignoreContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#'))
          .map(pattern => {
            // Handle patterns that start with /
            if (pattern.startsWith('/')) {
              return pattern.slice(1);
            }
            // Handle patterns that end with /
            if (pattern.endsWith('/')) {
              return `${pattern}**`;
            }
            return `**/${pattern}`;
          });

        // Update cache
        gitignoreCache = {
          patterns: gitignorePatterns,
          mtime: stats.mtimeMs
        };
      }

      // Add cached patterns
      if (gitignoreCache.patterns) {
        patterns.push(...gitignoreCache.patterns);
      }
    } catch (error) {
      logger.debug(`Error reading .gitignore: ${error.message}`);
    }
  }

  return patterns;
}