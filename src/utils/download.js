import fs from 'fs';
import { logger } from './logger.js';
import { writeFile } from './fs.js';
import { getContent } from '../github/api.js';

export async function downloadFiles(owner, repo, ignorePatterns = [], changedFiles = null) {
  if (!changedFiles) {
    logger.info('No changes to process');
    return;
  }

  const { added = [], modified = [], deleted = [] } = changedFiles;
  const filesToDownload = [...added, ...modified];

  // Handle deleted files first
  if (deleted.length > 0) {
    logger.info('\nDeleting files:');
    for (const file of deleted) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          logger.success(`✓ Deleted: ${file}`);
        }
      } catch (error) {
        logger.error(`Failed to delete ${file}: ${error.message}`);
      }
    }
  }

  // Download new and modified files
  if (filesToDownload.length > 0) {
    logger.info('\nDownloading files:');
    for (const file of filesToDownload) {
      // Skip ignored files
      if (ignorePatterns.includes(file)) {
        continue;
      }

      try {
        const content = await fetchFileContent(owner, repo, file);
        if (content !== null) {
          writeFile(file, content);
          logger.success(`✓ Downloaded: ${file}`);
        }
      } catch (error) {
        logger.error(`Failed to download ${file}: ${error.message}`);
      }
    }
  }
}

async function fetchFileContent(owner, repo, filepath) {
  try {
    const response = await getContent(owner, repo, filepath);
    if (response.content) {
      return Buffer.from(response.content, 'base64').toString('utf-8');
    }
    return null;
  } catch (error) {
    logger.error(`Failed to fetch file ${filepath}: ${error.message}`);
    return null;
  }
}