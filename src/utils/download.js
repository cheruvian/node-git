import { logger } from './logger.js';
import { getContent } from '../github/api.js';
import { syncFiles } from './fileSync.js';
import { readSnapshot } from './snapshot.js';

export async function downloadFiles(owner, repo, ignorePatterns = []) {
  const contents = await getContent(owner, repo);
  const remoteFiles = {};
  const localSnapshot = readSnapshot();

  // Build remote files map
  for (const item of contents) {
    if (item.type === 'file' && !ignorePatterns.includes(item.path)) {
      const fileData = await getContent(owner, repo, item.path);
      remoteFiles[item.path] = Buffer.from(fileData.content, 'base64').toString('utf-8');
    }
  }

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