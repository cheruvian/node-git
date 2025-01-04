import fs from 'fs';
import { logger } from './logger.js';

export function syncFiles(remoteFiles, localFiles, ignorePatterns) {
  const changes = {
    added: [],
    updated: [],
    deleted: []
  };

  // Handle new and updated files
  for (const [path, content] of Object.entries(remoteFiles)) {
    if (ignorePatterns.includes(path)) continue;

    if (!localFiles[path]) {
      fs.writeFileSync(path, content);
      changes.added.push(path);
    } else if (localFiles[path] !== content) {
      fs.writeFileSync(path, content);
      changes.updated.push(path);
    }
  }

  // Handle deleted files
  for (const path of Object.keys(localFiles)) {
    if (ignorePatterns.includes(path)) continue;
    
    if (!remoteFiles[path]) {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
        changes.deleted.push(path);
      }
    }
  }

  return changes;
}