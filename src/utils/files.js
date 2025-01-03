import fs from 'fs';

export function getAllFiles() {
  return fs.readdirSync('.')
    .filter(f => fs.statSync(f).isFile());
}

export function readSnapshotFile() {
  const snapshotPath = '_git/snapshot.json';
  if (!fs.existsSync(snapshotPath)) {
    throw new Error('Not a git repository');
  }
  return JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
}