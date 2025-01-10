import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';
import { GIT_IGNORE_PATTERNS } from "./git/ignore.js";

export function getGitignorePatterns(directory = '.') {
  const patterns = [...GIT_IGNORE_PATTERNS];
  const gitignorePath = path.join(directory, '.gitignore');

  if (fs.existsSync(gitignorePath)) {
    try {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      const customPatterns = gitignoreContent
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
          // Add **/ prefix for general patterns if they don't start with *
          if (!pattern.startsWith('*')) {
            return `**/${pattern}`;
          }
          return pattern;
        });

      patterns.push(...customPatterns);
    } catch (error) {
      logger.debug(`Error reading .gitignore: ${error.message}`);
    }
  }

  return patterns;
}