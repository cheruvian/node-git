import fs from 'fs';
import path from 'path';
import { minimatch } from 'minimatch';

// Git directory management
export function initGitDir(directory = '.') {
  const gitDir = path.join(directory, '.git');
  if (fs.existsSync(gitDir)) return;

  // Create basic structure
  ['objects', 'refs/heads', 'refs/tags', 'info', 'hooks'].forEach(dir => {
    fs.mkdirSync(path.join(gitDir, dir), { recursive: true });
  });

  // Initialize basic files
  fs.writeFileSync(path.join(gitDir, 'config'), '[core]\n\tbare = false');
  fs.writeFileSync(path.join(gitDir, 'HEAD'), 'ref: refs/heads/main\n');
}

// Remote state handling
export function getRemoteInfo() {
  try {
    const config = fs.readFileSync(path.join('.git', 'config'), 'utf-8');
    const match = config.match(/url = https:\/\/github\.com\/(.+)\/(.+)\.git/);
    return match ? { owner: match[1], repo: match[2] } : null;
  } catch {
    return null;
  }
}

// Gitignore handling
export function getIgnoredFiles(files, directory = '.') {
  const patterns = getIgnorePatterns(directory);
  return files.filter(file => !patterns.some(pattern => 
    minimatch(file.replace(/\\/g, '/'), pattern, { dot: true, matchBase: true })
  ));
}

function getIgnorePatterns(directory) {
  try {
    const content = fs.readFileSync(path.join(directory, '.gitignore'), 'utf-8');
    return content.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(pattern => pattern.startsWith('/') ? pattern.slice(1) : `**/${pattern}`);
  } catch {
    return [];
  }
}