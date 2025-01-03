import fs from 'fs';
import path from 'path';
import { minimatch } from 'minimatch';
import { logger } from './logger.js';

export function getGitignorePatterns(directory = '.') {
  try {
    const gitignorePath = path.join(directory, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      return [];
    }

    return fs.readFileSync(gitignorePath, 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(pattern => {
        pattern = pattern.replace(/\/+$/, '');
        return pattern.startsWith('/') ? pattern.slice(1) : `**/${pattern}`;
      });
  } catch (error) {
    logger.debug(`Error reading .gitignore: ${error.message}`);
    return [];
  }
}

export function getIgnoredFiles(files, directory = '.') {
  const patterns = getGitignorePatterns(directory);
  return files.filter(file => !isIgnored(file, patterns));
}

function isIgnored(filePath, patterns) {
  if (!patterns?.length) return false;
  
  const normalizedPath = filePath.replace(/\\/g, '/');
  return patterns.some(pattern => {
    const fullPattern = pattern.endsWith('/') ? `${pattern}**` : pattern;
    return minimatch(normalizedPath, fullPattern, { 
      dot: true,
      matchBase: true,
      nocase: true 
    });
  });
}