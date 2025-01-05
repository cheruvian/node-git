import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { logger } from '../utils/logger.js';
import { getRepo, createCommit } from '../github/api.js';
import { createSnapshot } from '../utils/snapshot.js';
import { getGitignorePatterns } from '../utils/patterns/gitignore.js';
import { validateGitHubToken } from '../utils/validation.js';
import { readConfig, writeConfig } from '../utils/config.js';

export async function push(message, options) {
  try {
    validateGitHubToken();

    if (!message) {
      throw new Error('Commit message is required');
    }

    // Read remote configuration
    const config = readConfig();
    if (!config.remote?.origin) {
      throw new Error('No remote repository configured. Use "remote add" first.');
    }

    const { owner, repo } = config.remote.origin;
    const directory = options.directory || '.';

    // Verify repository exists
    await getRepo(owner, repo);
    logger.info(`Pushing to ${owner}/${repo}...`);

    // Get all files except ignored ones
    const files = await glob('**/*', { 
      cwd: directory,
      nodir: true,
      ignore: getGitignorePatterns(directory)
    });

    // Prepare changes for commit
    const changes = files.map(file => ({
      path: file,
      mode: '100644',
      type: 'blob',
      content: fs.readFileSync(path.join(directory, file), 'utf-8')
    }));

    // Create commit with changes
    const newCommit = await createCommit(owner, repo, message, changes);
    
    // Update config with new commit SHA
    writeConfig({
      ...config,
      lastCommit: newCommit.sha
    });
    
    // Update snapshot after successful push
    await createSnapshot(directory);
    
    logger.success(`✓ Code pushed to https://github.com/${owner}/${repo}`);
  } catch (error) {
    logger.error(`Push failed: ${error.message}`);
    process.exit(1);
  }
}