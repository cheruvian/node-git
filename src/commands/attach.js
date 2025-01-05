import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import { validateGitHubToken } from '../utils/validation.js';
import { validateRepoPath } from '../utils/validation/repository.js';
import { initializeRepository } from '../utils/repository.js';
import { fetchFileContent, fetchDirectoryContents } from '../utils/github/content.js';
import { writeFile } from '../utils/fs.js';

export async function attach(argv) {
  try {
    logger.info('Starting attach operation...');
    validateGitHubToken();
    
    const { owner, repo } = validateRepoPath(argv.repo);
    await attachRepository(owner, repo, argv);
    
    logger.success(`✓ Repository ${owner}/${repo} attached successfully!`);
  } catch (error) {
    logger.error(`Attach failed: ${error.message}`);
    logger.debug(`Stack trace: ${error.stack}`);
    process.exit(1);
  }
}

async function attachRepository(owner, repo, options) {
  logger.info(`Attaching ${owner}/${repo}...`);
  
  // Initialize repository
  const { commitHash } = await initializeRepository(owner, repo, {
    commit: options.commit
  });
  
  // Download all repository contents recursively
  await downloadAllFiles(owner, repo, '', commitHash);
}

async function downloadAllFiles(owner, repo, currentPath = '', commit = '') {
  logger.info(`Fetching contents for ${owner}/${repo}/${currentPath}`);
  const contents = await fetchDirectoryContents(owner, repo, currentPath, commit);
  
  for (const item of contents) {
    const itemPath = currentPath ? path.join(currentPath, item.name) : item.name;
    
    if (item.type === 'dir') {
      fs.mkdirSync(itemPath, { recursive: true });
      await downloadAllFiles(owner, repo, itemPath, commit);
    } else if (item.type === 'file') {
      const content = await fetchFileContent(owner, repo, itemPath, commit);
      if (content === null) {
        logger.warn(`Failed to download ${itemPath}`);
        continue;
      }
      writeFile(itemPath, content);
      logger.info(`Downloaded: ${itemPath}`);
    }
  }
}