import { logger } from '../utils/logger.js';
import { validateGitHubToken } from '../utils/validation.js';
import { validateRepoPath } from '../utils/validation/repository.js';
import { initializeRepository } from '../utils/repository.js';
import { getRepo, downloadContents } from '../github/api.js';
import { writeFile, createDirectory, ensureDir } from '../utils/fs.js';
import path from 'path';

export async function clone(argv) {
  try {
    logger.info('Starting clone operation...');
    validateGitHubToken();
    
    const { owner, repo } = validateRepoPath(argv.repo, { checkExists: true });
    await cloneRepository(owner, repo);
    
    logger.success(`✓ Repository ${owner}/${repo} cloned successfully!`);
    logger.info(`Directory: ${repo}`);
  } catch (error) {
    logger.error(`Clone failed: ${error.message}`);
    logger.debug(`Stack trace: ${error.stack}`);
    process.exit(1);
  }
}

async function cloneRepository(owner, repo) {
  logger.info(`Cloning ${owner}/${repo}...`);
  
  await getRepo(owner, repo);
  createDirectory(repo);
  const currentDir = process.cwd();
  
  try {
    process.chdir(repo);
    
    // Initialize repository
    await initializeRepository(owner, repo);
    
    // Download repository contents
    await processContents(owner, repo);
  } catch (error) {
    logger.error(`Failed to download contents: ${error.message}`);
    throw error;
  } finally {
    process.chdir(currentDir);
  }
}

async function processContents(owner, repo, currentPath = '') {
  const contents = await downloadContents(owner, repo, currentPath);
  
  for (const item of contents) {
    const itemPath = path.join(currentPath, item.name);
    logger.debug(`Processing: ${itemPath}`);
    
    if (item.type === 'dir') {
      createDirectory(itemPath);
      await processContents(owner, repo, itemPath);
    } else if (item.type === 'file' && item.content) {
      writeFile(itemPath, item.content);
    }
  }
}