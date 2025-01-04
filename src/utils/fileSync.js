import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

export function syncFiles(remoteFiles, localFiles, ignorePatterns) {
  const changes = {
    added: [],
    updated: [],
    deleted: []
  };

  // Get list of all local files that actually exist
  const existingLocalFiles = Object.keys(localFiles).filter(file => fs.existsSync(file));

  // Handle new and updated files from remote
  for (const [filePath, content] of Object.entries(remoteFiles)) {
    if (ignorePatterns.includes(filePath)) continue;

    const dir = path.dirname(filePath);
    if (dir !== '.') {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!localFiles[filePath]) {
      fs.writeFileSync(filePath, content);
      changes.added.push(filePath);
    } else if (localFiles[filePath] !== content) {
      fs.writeFileSync(filePath, content);
      changes.updated.push(filePath);
    }
  }

  // Handle files that exist locally but not in remote
  for (const filePath of existingLocalFiles) {
    if (ignorePatterns.includes(filePath)) continue;
    
    // If file exists locally but not in remote, delete it
    if (!remoteFiles[filePath]) {
      try {
        fs.unlinkSync(filePath);
        changes.deleted.push(filePath);
      } catch (error) {
        logger.debug(`Failed to delete ${filePath}: ${error.message}`);
      }
    }
  }

  // Clean up empty directories
  cleanEmptyDirs('.');

  return changes;
}

function cleanEmptyDirs(dir) {
  if (dir === '.' || !fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      cleanEmptyDirs(fullPath);
      
      // Try to remove directory if empty
      try {
        if (fs.readdirSync(fullPath).length === 0) {
          fs.rmdirSync(fullPath);
        }
      } catch (error) {
        logger.debug(`Failed to remove directory ${fullPath}: ${error.message}`);
      }
    }
  }
}