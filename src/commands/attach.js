import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import { writeConfig } from '../utils/config.js';
import { getContent } from '../github/api.js';
import { writeFile } from '../utils/fs.js';
import { createSnapshot } from '../utils/snapshot.js';
import { getLatestCommit } from '../utils/commits.js';
import { validateGitHubToken } from '../utils/validation.js';

export async function attach(repoPath) {
  try {
    logger.info('Starting attach operation...');
    validateInput(repoPath);
    validateGitHubToken();
    
    const [owner, repo] = repoPath.split('/');
    await attachRepository(owner, repo);
    
    logger.success(`✓ Repository ${owner}/${repo} attached successfully!`);
  } catch (error) {
    logger.error(`Attach failed: ${error.message}`);
    process.exit(1);
  }
}

function validateInput(repoPath) {
  const [owner, repo] = repoPath.split('/');
  if (!owner || !repo) {
    throw new Error('Invalid repository format. Use owner/repo');
  }
}

async function attachRepository(owner, repo) {
  logger.info(`Attaching ${owner}/${repo}...`);
  
  // Create _git directory first
  fs.mkdirSync('_git', { recursive: true });
  
  // Get latest commit hash
  const commitHash = await getLatestCommit(owner, repo);
  logger.info(`Latest commit: ${commitHash}`);
  
  // Download all repository contents
  await downloadAllFiles(owner, repo);
  
  // Initialize config with remote info and commit hash
  const config = {
    remote: {
      origin: {
        owner,
        repo,
        url: `https://github.com/${owner}/${repo}.git`
      }
    },
    lastCommit: commitHash
  };
  writeConfig(config);

  // Create initial snapshot after all files are downloaded
  await createSnapshot('.');
}

async function downloadAllFiles(owner, repo, currentPath = '') {
  logger.info(`Fetching contents for path: "${currentPath}"`);
  const contents = await getContent(owner, repo, currentPath);
  logger.debug(`API Response:`, JSON.stringify(contents, null, 2));
  
  if (!Array.isArray(contents)) {
    logger.debug(`Single file response for ${currentPath}`);
    // Single file response
    if (contents.type === 'file' && contents.content) {
      const content = Buffer.from(contents.content, 'base64').toString('utf-8');
      writeFile(currentPath, content);
      logger.info(`Downloaded: ${currentPath}`);
    } else {
      logger.warn(`No content found for file: ${currentPath}`);
    }
    return;
  }
  
  logger.info(`Found ${contents.length} items in ${currentPath || 'root'}`);
  
  for (const item of contents) {
    const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
    
    if (item.type === 'dir') {
      logger.debug(`Creating directory: ${itemPath}`);
      fs.mkdirSync(path.join(process.cwd(), itemPath), { recursive: true });
      await downloadAllFiles(owner, repo, itemPath);
    } else if (item.type === 'file') {
      logger.info(`Downloading file: ${itemPath}`);
      const fileData = await getContent(owner, repo, itemPath);
      if (fileData.content) {
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        writeFile(itemPath, content);
      } else {
        logger.warn(`No content found for file: ${itemPath}`);
      }
    }
  }
}