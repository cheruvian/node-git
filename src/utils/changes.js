import fs from 'fs';
import { glob } from 'glob';
import { GIT_IGNORE_PATTERNS } from './gitPaths.js';

export async function detectLocalChanges(snapshot, ignorePatterns) {
  const files = await glob('**/*', { 
    dot: true,
    nodir: true,
    ignore: [...GIT_IGNORE_PATTERNS, ...ignorePatterns]
  });

  let hasChanges = false;
  const changes = {
    modified: [],
    deleted: []
  };
  
  // Check modified files
  for (const file of files) {
    if (fs.existsSync(file)) {
      const currentContent = fs.readFileSync(file, 'utf-8');
      const snapshotContent = snapshot[file] || '';
      
      if (currentContent !== snapshotContent) {
        changes.modified.push(file);
      }
    }
  }

  // Check deleted files
  for (const file of Object.keys(snapshot)) {
    if (!fs.existsSync(file) && !ignorePatterns.includes(file)) {
      changes.deleted.push(file);
    }
  }

  hasChanges = changes.modified.length > 0 || changes.deleted.length > 0;

  return { hasChanges, changes };
}