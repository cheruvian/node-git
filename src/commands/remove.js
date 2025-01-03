import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export async function remove(files) {
  try {
    const gitPath = path.join(process.cwd(), '.git');
    const stagingPath = path.join(gitPath, 'staging');

    if (!fs.existsSync(gitPath)) {
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