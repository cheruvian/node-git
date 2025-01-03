import { logger } from '../utils/logger.js';
import { validateGitHubToken } from '../utils/validation.js';
import { getRepo } from '../github/api.js';
import { createCommit } from '../github/commits.js';
import { initializeGitDirectory } from '../utils/gitInit.js';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

export async function push(repoPath, directory = '.') {
  try {
    validateGitHubToken();

    // Parse owner and repo
    const [owner, repo] = repoPath.split('/');
    if (!owner || !repo) {
      throw new Error('Invalid repository format. Use owner/repo');
    }

    // Initialize git directory
    initializeGitDirectory(directory);

    // Verify repository exists
    const repository = await getRepo(owner, repo);
    logger.info(`Pushing to ${repository.full_name}...`);

    // Get all files in directory
    const files = await glob('**/*', { 
      cwd: directory,
      nodir: true,
      ignore: ['node_modules/**', '.git/**', '.env']
    });

    // Prepare changes
    const changes = files.map(file => ({
      path: file,
      mode: '100644',
      type: 'blob',
      content: fs.readFileSync(path.join(directory, file), 'utf-8')
    }));

    // Create commit with all files
    await createCommit(owner, repo, 'Initial commit', changes);

    logger.success(`✓ Code pushed to ${repository.html_url}`);
  } catch (error) {
    logger.error(`Push failed: ${error.message}`);
    process.exit(1);
  }
}