import { logger } from '../utils/logger.js';
import { validateGitHubToken } from '../utils/validation.js';
import { clone } from './clone.js';
import { push } from './push.js';
import { readConfig, writeConfig } from '../utils/config.js';
import { createDirectory } from '../utils/fs.js';
import fs from 'fs';

export async function submodule(command, repoPath, options) {
  try {
    switch (command) {
      case 'add':
        await addSubmodule(repoPath, options.path);
        break;
      case 'status':
        await submoduleStatus();
        break;
      case 'push':
        await pushSubmodule(repoPath, options);
        break;
      default:
        throw new Error('Invalid command. Use "add", "status", or "push"');
    }
  } catch (error) {
    logger.error(`Submodule operation failed: ${error.message}`);
    process.exit(1);
  }
}

async function addSubmodule(repoPath, targetPath) {
  validateGitHubToken();
  
  if (!repoPath) {
    throw new Error('Repository path required (format: owner/repo)');
  }

  const [owner, repo] = repoPath.split('/');
  if (!owner || !repo) {
    throw new Error('Invalid repository format. Use owner/repo');
  }

  // Create submodule directory
  createDirectory(targetPath);

  // Save current directory
  const currentDir = process.cwd();

  try {
    // Change to submodule directory and clone
    process.chdir(targetPath);
    await clone(repoPath);

    // Update config with submodule info
    process.chdir(currentDir);
    const config = readConfig();
    config.submodules = config.submodules || {};
    config.submodules[targetPath] = { owner, repo };
    writeConfig(config);

    // Add submodule path to .gitignore
    updateGitignore(targetPath);

    logger.success(`✓ Submodule added at ${targetPath}`);
  } finally {
    process.chdir(currentDir);
  }
}

async function submoduleStatus() {
  const config = readConfig();
  if (!config.submodules || Object.keys(config.submodules).length === 0) {
    logger.info('No submodules configured');
    return;
  }

  logger.info('\nSubmodules:');
  for (const [path, { owner, repo }] of Object.entries(config.submodules)) {
    logger.info(`  ${path} -> ${owner}/${repo}`);
  }
}

async function pushSubmodule(repoPath, options) {
  const config = readConfig();
  if (!config.submodules) {
    throw new Error('No submodules configured');
  }

  const currentDir = process.cwd();
  let targetPath = null;

  // Find the submodule path
  for (const [path, info] of Object.entries(config.submodules)) {
    if (`${info.owner}/${info.repo}` === repoPath) {
      targetPath = path;
      break;
    }
  }

  if (!targetPath) {
    throw new Error(`Submodule ${repoPath} not found`);
  }

  try {
    process.chdir(targetPath);
    await push(options.message, { directory: '.' });
  } finally {
    process.chdir(currentDir);
  }
}

function updateGitignore(submodulePath) {
  const gitignorePath = '.gitignore';
  let content = '';

  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, 'utf-8');
    if (content && !content.endsWith('\n')) {
      content += '\n';
    }
  }

  if (!content.includes(submodulePath)) {
    content += `${submodulePath}/\n`;
    fs.writeFileSync(gitignorePath, content);
    logger.debug(`Updated .gitignore with ${submodulePath}`);
  }
}