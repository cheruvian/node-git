import { logger } from '../utils/logger.js';
import { readConfig, updateConfig } from '../utils/config.js';
import { downloadFiles } from '../utils/download.js';
import { displayChanges } from '../utils/display.js';
import { syncWithRemote } from '../utils/sync.js';
import { getRemoteState } from '../utils/remoteState.js';
import { getGitignorePatterns } from '../utils/gitignore.js';
import { detectLocalChanges } from '../utils/changes.js';
import { validateGitHubToken } from '../utils/validation.js';
import { createSnapshot, readSnapshot } from '../utils/snapshot.js';

export async function pull(options = { force: false, dryRun: false }) {
  try {
    validateGitHubToken();
    
    const remote = getRemoteState();
    if (!remote) {
      throw new Error('No remote repository configured. Use "remote add" first.');
    }

    // Check for local changes
    const snapshot = readSnapshot();
    const ignorePatterns = getGitignorePatterns();
    
    const { hasChanges, changes } = await detectLocalChanges(snapshot, ignorePatterns);
    
    if (hasChanges && !options.force) {
      displayChanges(changes, snapshot);
      throw new Error('Cannot pull with local changes. Commit or reset your changes first, or use --force to override.');
    }

    const config = readConfig();
    const currentCommit = config.lastCommit;
    logger.info(`${options.dryRun ? '[DRY RUN] ' : ''}Pulling from ${remote.owner}/${remote.repo}`);
    logger.info(`Current commit: ${currentCommit}`);
    
    // Get remote changes based on commit diff
    const { remoteCommit, changes: remoteChanges } = await syncWithRemote(
      remote.owner, 
      remote.repo, 
      snapshot,
      ignorePatterns
    );

    logger.info(`Remote commit: ${remoteCommit}`);

    // Show changes that would be pulled
    if (remoteChanges) {
      logger.info('\nChanges to pull:');
      if (remoteChanges.renamed?.length) {
        logger.info('\nRenamed files:');
        remoteChanges.renamed.forEach(({ from, to }) => 
          logger.info(`  * ${from} → ${to}`)
        );
      }
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

    // Exit early if this is a dry run
    if (options.dryRun) {
      logger.info('\n[DRY RUN] No changes were made');
      return;
    }

    // Actually perform the changes
    await downloadFiles(remote.owner, remote.repo, ignorePatterns, remoteChanges);
    
    // Update config with new commit SHA
    updateConfig({
      remote: {
        origin: {
          owner: remote.owner,
          repo: remote.repo,
          url: `https://github.com/${remote.owner}/${remote.repo}.git`
        }
      },
      lastCommit: remoteCommit
    });
    
    // Create new snapshot
    await createSnapshot('.');
    
    logger.success('✓ Pull completed successfully');
  } catch (error) {
    logger.error(`Pull failed: ${error.message}`);
    process.exit(1);
  }
}