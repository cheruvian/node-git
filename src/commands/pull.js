import { logger } from '../utils/logger.js';
import { validateGitHubToken } from '../utils/validation.js';
import { getRemoteState } from '../utils/remoteState.js';
import { downloadFiles } from '../utils/download.js';
import { createSnapshot, readSnapshot } from '../utils/snapshot.js';
import { getIgnorePatterns } from '../utils/ignore.js';
import { detectLocalChanges } from '../utils/changes.js';
import { displayChanges } from '../utils/display.js';

export async function pull(options = { force: false }) {
  try {
    validateGitHubToken();
    
    const remote = getRemoteState();
    if (!remote) {
      throw new Error('No remote repository configured. Use "remote add" first.');
    }

    // Check for local changes
    const snapshot = readSnapshot();
    const ignorePatterns = getIgnorePatterns();
    
    const { hasChanges, changes } = await detectLocalChanges(snapshot, ignorePatterns);
    
    if (hasChanges) {
      displayChanges(changes, snapshot);
      
      if (!options.force) {
        throw new Error('Cannot pull with local changes. Commit or reset your changes first, or use --force to override.');
      }
    }

    logger.info(`Pulling from ${remote.owner}/${remote.repo}...`);
    
    // Download latest files from GitHub
    await downloadFiles(remote.owner, remote.repo);
    
    // Create new snapshot after pull
    await createSnapshot('.');
    
    logger.success('✓ Pull completed successfully');
  } catch (error) {
    logger.error(`Pull failed: ${error.message}`);
    process.exit(1);
  }
}