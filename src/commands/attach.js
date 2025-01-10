import fs from 'fs';
import path from 'path';
import os from 'os';
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
    
    // Handle destructive mode
    if (argv.destructive) {
      const currentDir = process.cwd();
      const dirName = path.basename(currentDir);
      
      // Move up one directory
      process.chdir('..');
      
      // Remove the target directory if it exists
      if (fs.existsSync(dirName)) {
        logger.info(`Removing existing directory: ${dirName}`);
        fs.rmSync(dirName, { recursive: true, force: true });
      }
      
      // Create fresh directory and move into it
      fs.mkdirSync(dirName);
      process.chdir(dirName);
      logger.info(`Created fresh directory: ${dirName}`);
    }
    
    const snapshot = await attachRepository(owner, repo, argv);
    
    // Create _git directory and save snapshot
    fs.mkdirSync('_git', { recursive: true });
    fs.writeFileSync('_git/snapshot.json', JSON.stringify(snapshot, null, 2));
    
    logger.success(`✓ Repository ${owner}/${repo} attached successfully!`);
  } catch (error) {
    logger.error(`Attach failed: ${error.message}`);
    logger.debug(`Stack trace: ${error.stack}`);
    process.exit(1);
  }
}

async function attachRepository(owner, repo, options) {
  logger.info(`Attaching ${owner}/${repo}...`);
  
  // Create temporary directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-attach-'));
  logger.debug(`Created temporary directory: ${tmpDir}`);
  
  // Initialize repository
  const { commitHash } = await initializeRepository(owner, repo, {
    commit: options.commit
  });
  
  // Download all repository contents recursively
  const snapshot = await downloadAllFiles(owner, repo, tmpDir, '', commitHash);
  
  // Clean up temporary directory
  fs.rmSync(tmpDir, { recursive: true, force: true });
  logger.debug('Cleaned up temporary directory');
  
  return snapshot;
}

async function downloadAllFiles(owner, repo, tmpDir, currentPath = '', commit = '') {
  logger.info(`Fetching contents for ${owner}/${repo}/${currentPath}`);
  const contents = await fetchDirectoryContents(owner, repo, currentPath, commit);
  
  const snapshot = {};
  
  for (const item of contents) {
    const itemPath = currentPath ? path.join(currentPath, item.name) : item.name;
    const tmpPath = path.join(tmpDir, itemPath);
    
    if (item.type === 'dir') {
      fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
      const subSnapshot = await downloadAllFiles(owner, repo, tmpDir, itemPath, commit);
      Object.assign(snapshot, subSnapshot);
    } else if (item.type === 'file') {
      const content = await fetchFileContent(owner, repo, itemPath, commit);
      if (content === null) {
        logger.warn(`Failed to download ${itemPath}`);
        continue;
      }
      writeFile(tmpPath, content);
      snapshot[itemPath] = content;
      logger.info(`Downloaded: ${itemPath}`);
    }
  }
  
  return snapshot;
}