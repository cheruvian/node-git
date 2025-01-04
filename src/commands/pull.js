import { logger } from '../utils/logger.js';
import { validateGitHubToken } from '../utils/validation.js';
import { getRemoteState } from '../utils/remoteState.js';
import { downloadFiles } from '../utils/download.js';
import { createSnapshot, readSnapshot } from '../utils/snapshot.js';
import { getIgnorePatterns } from '../utils/ignore.js';
import { detectLocalChanges } from '../utils/changes.js';
import { displayChanges } from '../utils/display.js';
import { syncWithRemote } from '../utils/sync.js';
import { updateLocalCommit } from '../utils/commits.js';
import { writeConfig, readConfig } from '../utils/config.js';

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
    
    if (hasChanges && !options.force) {
      displayChanges(changes, snapshot);
      throw new Error('Cannot pull with local changes. Commit or reset your changes first, or use --force to override.');
    }

    logger.info(`Pulling from ${remote.owner}/${remote.repo}...`);
    
    // Get remote changes based on commit diff
    const { remoteCommit, changes: remoteChanges } = await syncWithRemote(
      remote.owner, 
      remote.repo, 
      snapshot,
      ignorePatterns
    );

    // Download and sync only changed files
    if (remoteChanges) {
      logger.info('\nChanges to pull:');
      if (remoteChanges.added?.length) {
        logger.info('\nNew files:');
        remoteChanges.added.forEach(f => logger.info(`  + ${f}`));
      }
      if (remoteChanges.modified?.length) {
        logger.info('\nModified files:');
        remoteChanges.modified.forEach(f => logger.info(`  * ${f}`));
      }
      if (remoteChanges.deleted?.length) {
        logger.info('\nDeleted files:');
        remoteChanges.deleted.forEach(f => logger.info(`  - ${f}`));
      }
    }

    await downloadFiles(remote.owner, remote.repo, ignorePatterns, remoteChanges);
    
    // Update config with new commit SHA
    const config = readConfig();
    config.lastCommit = remoteCommit;
    writeConfig(config);
    
    // Create new snapshot
    await createSnapshot('.');
    
    logger.success('✓ Pull completed successfully');
  } catch (error) {
    logger.error(`Pull failed: ${error.message}`);
    process.exit(1);
  }
}