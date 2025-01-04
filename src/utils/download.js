import { logger } from './logger.js';
import { getContent } from '../github/api.js';
import { syncFiles } from './fileSync.js';
import { readSnapshot } from './snapshot.js';
import path from 'path';

async function fetchDirectoryContents(owner, repo, dirPath = '') {
  const contents = await getContent(owner, repo, dirPath);
  const files = {};

  for (const item of contents) {
    const itemPath = dirPath ? path.join(dirPath, item.name) : item.name;

    if (item.type === 'dir') {
      const subFiles = await fetchDirectoryContents(owner, repo, itemPath);
      Object.assign(files, subFiles);
    } else if (item.type === 'file') {
      const fileData = await getContent(owner, repo, itemPath);
      files[itemPath] = Buffer.from(fileData.content, 'base64').toString('utf-8');
    }
  }

  return files;
}

export async function downloadFiles(owner, repo, ignorePatterns = []) {
  logger.info('Fetching repository contents...');
  const remoteFiles = await fetchDirectoryContents(owner, repo);
  const localSnapshot = readSnapshot();

  // Sync files and track changes
  const changes = syncFiles(remoteFiles, localSnapshot, ignorePatterns);

  // Log changes
  if (changes.added.length > 0) {
    logger.info('\nNew files:');
    changes.added.forEach(file => logger.info(`  + ${file}`));
  }

  if (changes.updated.length > 0) {
    logger.info('\nUpdated files:');
    changes.updated.forEach(file => logger.info(`  * ${file}`));
  }

  if (changes.deleted.length > 0) {
    logger.info('\nDeleted files:');
    changes.deleted.forEach(file => logger.info(`  - ${file}`));
  }

  return changes;
}