import { getRepo, getContent } from '../github/api.js';
import { validateGitHubToken } from '../utils/validation.js';
import { logger } from '../utils/logger.js';
import { writeFile, createDirectory } from '../utils/fs.js';
import { initGitRepo } from '../utils/git.js';
import path from 'path';
import fs from 'fs';

export async function clone(repoPath) {
  try {
    logger.info('Starting clone operation...');
    validateInput(repoPath);
    validateGitHubToken();
    
    const [owner, repo] = repoPath.split('/');
    await cloneRepository(owner, repo);
    
    logger.success(`✓ Repository ${owner}/${repo} cloned successfully!`);
    logger.info(`Directory: ${repo}`);
  } catch (error) {
    logger.error(`Clone failed: ${error.message}`);
    process.exit(1);
  }
}

function validateInput(repoPath) {
  const [owner, repo] = repoPath.split('/');
  if (!owner || !repo) {
    throw new Error('Invalid repository format. Use owner/repo');
  }
  
  if (fs.existsSync(repo)) {
    throw new Error(`Directory ${repo} already exists`);
  }
}

async function cloneRepository(owner, repo) {
  logger.info(`Cloning ${owner}/${repo}...`);
  
  await getRepo(owner, repo);
  createDirectory(repo);
  process.chdir(repo);
  
  try {
    await downloadContents(owner, repo);
    initGitRepo('.');
  } catch (error) {
    logger.error(`Failed to download contents: ${error.message}`);
    throw error;
  } finally {
    process.chdir('..');
  }
}

async function downloadContents(owner, repo, currentPath = '') {
  const contents = await getContent(owner, repo, currentPath);
  
  for (const item of contents) {
    const itemPath = path.join(currentPath, item.name);
    logger.debug(`Processing: ${item.name}`);
    
    if (item.type === 'dir') {
      createDirectory(itemPath);
      await downloadContents(owner, repo, itemPath);
    } else if (item.type === 'file') {
      if (!item.content) {
        const fileContent = await getContent(owner, repo, itemPath);
        item.content = fileContent[0].content;
      }
      const content = Buffer.from(item.content, 'base64').toString('utf-8');
      writeFile(itemPath, content);
    }
  }
}