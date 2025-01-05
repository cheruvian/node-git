import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { glob } from 'glob';

import { getGitignorePatterns } from '../utils/gitignore.js';

export async function add(files) {
  try {
    const gitPath = path.join(process.cwd(), '.git');
    const stagingPath = path.join(gitPath, 'staging');

    if (!fs.existsSync(gitPath)) {
      throw new Error('Not a git repository');
    }

    if (!fs.existsSync(stagingPath)) {
      fs.mkdirSync(stagingPath, { recursive: true });
    }

    const patterns = files.length ? files : ['.'];
    const matches = await glob(patterns, { 
      ignore: getGitignorePatterns(),
      dot: true 
    });

    for (const file of matches) {
      if (fs.statSync(file).isFile()) {
        const stagingFile = path.join(stagingPath, file);
        fs.mkdirSync(path.dirname(stagingFile), { recursive: true });
        fs.copyFileSync(file, stagingFile);
        console.log(chalk.green(`Added ${file}`));
      }
    }
  } catch (error) {
    console.error(chalk.red(`Add failed: ${error.message}`));
    process.exit(1);
  }
}
