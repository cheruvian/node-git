import fs from 'fs';
import path from 'path';
import { minimatch } from 'minimatch';
import { logger } from '../logger.js';
import { GIT_IGNORE_PATTERNS } from '../gitPaths.js';
import { escapePattern } from './escapePattern.js';

// Cache for gitignore patterns
let gitignoreCache = {
  patterns: null,
  mtime: 0
};

export function getGitignorePatterns(directory = '.') {
  const patterns = [...GIT_IGNORE_PATTERNS];
  const gitignorePath = path.join(directory, '.gitignore');

  if (fs.existsSync(gitignorePath)) {
    try {
      // Check if .gitignore has been modified
      const stats = fs.statSync(gitignorePath);
      if (stats.mtimeMs > gitignoreCache.mtime) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
        const customPatterns = gitignoreContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#'))
          .map(normalizePattern);

        // Update cache
        gitignoreCache = {
          patterns: customPatterns,
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

function normalizePattern(pattern) {
  // Remove leading slash
  if (pattern.startsWith('/')) {
    pattern = pattern.slice(1);
  }
  
  // Handle directory patterns
  if (pattern.endsWith('/')) {
    pattern = `${pattern}**`;
  }
  
  // Add **/ prefix for general patterns if they don't start with * or /
  if (!pattern.startsWith('*') && !pattern.startsWith('/')) {
    pattern = `**/${pattern}`;
  }
  
  return escapePattern(pattern);
}

export function isIgnored(filePath, patterns) {
  if (!filePath) return false;
  const normalizedPath = filePath.replace(/\\/g, '/');
  return patterns.some(pattern => minimatch(normalizedPath, pattern, {
    dot: true,
    matchBase: true,
    nocase: true
  }));
}