import fs from 'fs';
import { logger } from '../utils/logger.js';
import { writeConfig } from '../utils/config.js';
import { downloadFiles } from '../utils/download.js';
import { createSnapshot } from '../utils/snapshot.js';
import { getChangedFiles } from '../utils/diff';
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
  
  // Get list of changed files
  const changedFiles = await getChangedFiles(owner, repo);
  
  // Download only changed files
  await downloadFiles(owner, repo, changedFiles);
  
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