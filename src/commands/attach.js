import { logger } from '../utils/logger.js';
import { validateGitHubToken } from '../utils/validation.js';
import { downloadContents } from '../github/content.js';
import { writeFile } from '../utils/fs.js';
import { createSnapshot } from '../utils/snapshot.js';
import { writeConfig } from '../utils/config.js';
import { getLatestCommit } from '../utils/commits.js';
import fs from 'fs';
import path from 'path';

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
  
  // Download repository contents
  await processContents(owner, repo);
  
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

async function processContents(owner, repo, currentPath = '') {
  const contents = await downloadContents(owner, repo, currentPath);
  
  for (const item of contents) {
    const itemPath = path.join(currentPath, item.name);
    logger.debug(`Processing: ${itemPath}`);
    
    if (item.type === 'dir') {
      fs.mkdirSync(itemPath, { recursive: true });
      await processContents(owner, repo, itemPath);
    } else if (item.type === 'file' && item.content) {
      writeFile(itemPath, item.content);
    }
  }
}