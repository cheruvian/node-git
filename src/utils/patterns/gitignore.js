import fs from 'fs';
import path from 'path';
import { minimatch } from 'minimatch';
import { logger } from '../logger.js';
import { GIT_IGNORE_PATTERNS } from '../gitPaths.js';
import { escapePattern } from './escapePattern.js';

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
        .map(normalizePattern);

      patterns.push(...customPatterns);
    } catch (error) {
      logger.debug(`Error reading .gitignore: ${error.message}`);
    }
  }

  return patterns;
}

function normalizePattern(pattern) {
  // Remove leading slash
  if (pattern.startsWith('/')) {
    pattern = pattern.slice(1);
  }
  
  // Handle directory patterns
  if (pattern.endsWith('/')) {
    pattern = `${pattern}**`;
  }
  
  // Add **/ prefix for general patterns if they don't start with *
  if (!pattern.startsWith('*') && !pattern.startsWith('/')) {
    pattern = `**/${pattern}`;
  }
  
  return pattern;
}

export function isIgnored(filePath, patterns) {
  return patterns.some(pattern => minimatch(filePath, pattern, {
    dot: true,
    matchBase: true,
    nocase: true
  }));
}