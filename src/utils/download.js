import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';
import { writeFile } from './fs.js';
import { getContent } from '../github/api.js';

export async function downloadFiles(owner, repo, ignorePatterns = [], changedFiles = {}, commitRef = '') {
  if (!changedFiles) {
    logger.info('No changes to process');
    return;
  }

  const { added = [], modified = [], deleted = [], renamed = [] } = changedFiles;
  const filesToDownload = [...added, ...modified];

  // Handle renamed files first
  if (renamed.length > 0) {
    logger.info('\nRenaming files:');
    for (const { from, to } of renamed) {
      try {
        // Skip if source file doesn't exist
        if (fs.existsSync(from)) {
          // Create target directory if it doesn't exist
          fs.mkdirSync(path.dirname(to), { recursive: true });
          fs.renameSync(from, to);
          logger.success(`✓ Renamed: ${from} → ${to}`);
        } else {
          // If source doesn't exist, treat it as a new file to download
          filesToDownload.push(to);
          logger.debug(`Source file ${from} not found, will download ${to} as new file`);
        }
      } catch (error) {
        logger.error(`Failed to rename ${from} to ${to}: ${error.message}`);
        throw error; // Propagate error to fail the entire operation
      }
    }
  }

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
        const content = await fetchFileContent(owner, repo, file, commitRef);
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

async function fetchFileContent(owner, repo, filepath, ref = '') {
  try {
    const response = await getContent(owner, repo, filepath, ref);
    if (response.content) {
      return Buffer.from(response.content, 'base64').toString('utf-8');
    }
    // Handle empty files
    if (response.size === 0) {
      return '';
    }
    return null;
  } catch (error) {
    logger.error(`Failed to fetch file ${filepath}: ${error.message}`);
    return null;
  }
}