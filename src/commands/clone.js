import { logger } from '../utils/logger.js';
import { validateGitHubToken } from '../utils/validation.js';
import { getRepo, downloadContents } from '../github/api.js';
import { writeFile, createDirectory, ensureDir } from '../utils/fs.js';
import { createSnapshot } from '../utils/snapshot.js';
import { getLatestCommit } from '../utils/commits.js';
import { writeConfig } from '../utils/config.js';
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
  
  const repoResp = await getRepo(owner, repo);
  logger.info(JSON.stringify(repoResp))
  createDirectory(repo);
  const currentDir = process.cwd();
  
  try {
    process.chdir(repo);
    
    // Create _git directory first
    ensureDir('_git');
    
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