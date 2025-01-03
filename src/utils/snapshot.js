import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { logger } from './logger.js';
import { getIgnorePatterns } from './ignore.js';

export async function createSnapshot(directory = '.') {
  const files = await glob('**/*', { 
    dot: true,
    nodir: true,
    ignore: getIgnorePatterns(directory)
  });

  const snapshot = {};
  for (const file of files) {
    snapshot[file] = fs.readFileSync(path.join(directory, file), 'utf-8');
  }

  const snapshotPath = path.join('_git', 'snapshot.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
  logger.debug('Created repository snapshot');
}