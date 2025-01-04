import { logger } from './logger.js';
import { getContent } from '../github/api.js';
import { syncFiles } from './fileSync.js';
import { readSnapshot } from './snapshot.js';
import path from 'path';

async function fetchDirectoryContents(owner, repo, dirPath = '', changedFiles = null) {
  // If we have a list of changed files, only fetch those
  if (changedFiles) {
    const files = {};
    for (const file of [...changedFiles.added, ...changedFiles.modified]) {
      const fileData = await getContent(owner, repo, file);
      files[file] = Buffer.from(fileData.content, 'base64').toString('utf-8');
    }
    return files;
  }

  // Otherwise fetch all files
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

export async function downloadFiles(owner, repo, ignorePatterns = [], changedFiles = null) {
  logger.info('Fetching repository contents...');
  const remoteFiles = await fetchDirectoryContents(owner, repo, '', changedFiles);
  const localSnapshot = readSnapshot();

  // If we have changed files, mark files for deletion
  if (changedFiles?.deleted?.length) {
    changedFiles.deleted.forEach(file => {
      remoteFiles[file] = null; // Mark for deletion
    });
  }

  // Sync files and track changes
  return syncFiles(remoteFiles, localSnapshot, ignorePatterns);
}