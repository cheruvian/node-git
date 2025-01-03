import { logger } from '../utils/logger.js';
import { validateGitHubToken } from '../utils/validation.js';
import { getRepo } from '../github/api.js';
import { createCommit } from '../github/commits.js';
import { readConfig } from '../utils/config.js';
import { createSnapshot } from '../utils/snapshot.js';
import { glob } from 'glob';
import { getIgnorePatterns } from '../utils/ignore.js';
import fs from 'fs';
import path from 'path';

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
      ignore: getIgnorePatterns(directory)
    });

    // Prepare changes for commit
    const changes = files.map(file => ({
      path: file,
      mode: '100644',
      type: 'blob',
      content: fs.readFileSync(path.join(directory, file), 'utf-8')
    }));

    // Create commit with changes
    await createCommit(owner, repo, message, changes);
    
    // Update snapshot after successful push
    await createSnapshot(directory);
    
    logger.success(`✓ Code pushed to https://github.com/${owner}/${repo}`);
  } catch (error) {
    logger.error(`Push failed: ${error.message}`);
    process.exit(1);
  }
}