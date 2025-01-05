import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import { fetchFileContent, fetchDirectoryContents } from '../utils/github/content.js';
import { writeConfig } from '../utils/config.js';
import { writeFile } from '../utils/fs.js';
import { createSnapshot } from '../utils/snapshot.js';
import { getLatestCommit } from '../utils/commits.js';
import { validateGitHubToken } from '../utils/validation.js';
import { getGitignorePatterns } from '../utils/gitignore.js';

export async function attach(repoPath, options = {}) {
  try {
    logger.info('Starting attach operation...');
    validateInput(repoPath);
    validateGitHubToken();
    
    const [owner, repo] = repoPath.split('/');
    await attachRepository(owner, repo, options.commit);
    
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

async function attachRepository(owner, repo, commitHash) {
  logger.info(`Attaching ${owner}/${repo}...`);
  
  // Create _git directory first
  fs.mkdirSync('_git', { recursive: true });
  
  // Get commit hash (specified or latest)
  const targetCommit = commitHash || await getLatestCommit(owner, repo);
  logger.info(`Target commit: ${targetCommit}`);
  
  // Download all repository contents recursively
  await downloadAllFiles(owner, repo, '', targetCommit);
  
  // Initialize config with remote info and commit hash
  const config = {
    remote: {
      origin: {
        owner,
        repo,
        url: `https://github.com/${owner}/${repo}.git`
      }
    },
    lastCommit: targetCommit
  };
  writeConfig(config);

  // Create initial snapshot after all files are downloaded
  await createSnapshot('.');
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