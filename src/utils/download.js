import { logger } from './logger.js';
import { getContent } from '../github/api.js';
import { writeFile } from './fs.js';
import path from 'path';

export async function downloadFiles(owner, repo, ignorePatterns = [], changedFiles = null) {
  // If changedFiles is provided, use that list directly
  const filesToDownload = changedFiles?.added || changedFiles?.modified || [];
  
  if (!filesToDownload.length) {
    logger.info('No files to download');
    return { added: [], updated: [], failed: [] };
  }

  logger.info(`Downloading ${filesToDownload.length} files:`);
  filesToDownload.forEach(file => logger.info(`  ${file}`));

  const changes = {
    added: [],
    updated: [],
    failed: []
  };

  for (const file of filesToDownload) {
    // Skip ignored files
    if (ignorePatterns.includes(file)) {
      continue;
    }

    try {
      const content = await fetchFileContent(owner, repo, file);
      if (content !== null) {
        writeFile(file, content);
        changes.added.push(file);
        logger.success(`✓ Downloaded: ${file}`);
      }
    } catch (error) {
      logger.error(`Failed to download ${file}: ${error.message}`);
      changes.failed.push(file);
    }
  }

  return changes;
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