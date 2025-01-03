import { logger } from '../utils/logger.js';
import { validateGitHubToken } from '../utils/validation.js';
import { getRepo } from '../github/api.js';
import { readConfig, writeConfig } from '../utils/config.js';
import fs from 'fs';
import path from 'path';

export async function remote(command, repoPath) {
  try {
    if (!fs.existsSync('_git')) {
      throw new Error('Not a git repository');
    }

    switch (command) {
      case 'add':
        await addRemote(repoPath);
        break;
      case 'show':
        await showRemote();
        break;
      default:
        throw new Error('Invalid command. Use "add" or "show"');
    }
  } catch (error) {
    logger.error(`Remote operation failed: ${error.message}`);
    process.exit(1);
  }
}

async function addRemote(repoPath) {
  validateGitHubToken();
  
  if (!repoPath) {
    throw new Error('Repository path required (format: owner/repo)');
  }

  const [owner, repo] = repoPath.split('/');
  if (!owner || !repo) {
    throw new Error('Invalid repository format. Use owner/repo');
  }

  // Verify repository exists
  await getRepo(owner, repo);

  const config = {
    remote: {
      origin: {
        owner,
        repo,
        url: `https://github.com/${owner}/${repo}.git`
      }
    }
  };

  writeConfig(config);
  logger.success(`✓ Remote origin added: ${owner}/${repo}`);
}

async function showRemote() {
  const config = readConfig();
  
  if (!config.remote?.origin) {
    logger.info('No remote repository configured');
    return;
  }

  const { owner, repo } = config.remote.origin;
  logger.info(`origin\thttps://github.com/${owner}/${repo}.git (fetch)`);
  logger.info(`origin\thttps://github.com/${owner}/${repo}.git (push)`);
}