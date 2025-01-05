import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { getStagingPath } from '../utils/gitPaths.js';

export async function remove(files) {
  try {
    const stagingPath = getStagingPath();

    if (!fs.existsSync(stagingPath)) {
      throw new Error('Not a git repository');
    }

    for (const file of files) {
      const stagingFile = path.join(stagingPath, file);
      if (fs.existsSync(stagingFile)) {
        fs.unlinkSync(stagingFile);
        console.log(chalk.green(`Removed ${file}`));
      } else {
        console.log(chalk.yellow(`File ${file} not found in staging`));
      }
    }
  } catch (error) {
    console.error(chalk.red(`Remove failed: ${error.message}`));
    process.exit(1);
  }
}