import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

export async function getGitStatus() {
  const gitPath = path.join(process.cwd(), '.git');
  const stagingPath = path.join(gitPath, 'staging');
  
  if (!fs.existsSync(gitPath)) {
    throw new Error('Not a git repository');
  }

  const workingFiles = await glob('**/*', { 
    ignore: getGitignorePatterns(),
    dot: true,
    nodir: true
  });

  const staged = fs.existsSync(stagingPath) 
    ? await glob('**/*', { cwd: stagingPath, nodir: true })
    : [];

  return {
    staged,
    workingFiles: workingFiles.filter(file => !staged.includes(file))
  };
}

export async function status() {
  try {
    const { staged, workingFiles } = await getGitStatus();

    console.log(chalk.bold('\nChanges staged for commit:'));
    if (staged.length === 0) {
      console.log(chalk.yellow('  No changes staged'));
    } else {
      staged.forEach(file => {
        console.log(chalk.green(`  ${file}`));
      });
    }

    console.log(chalk.bold('\nChanges not staged for commit:'));
    if (workingFiles.length === 0) {
      console.log(chalk.yellow('  No changes'));
    } else {
      workingFiles.forEach(file => {
        console.log(chalk.red(`  ${file}`));
      });
    }
    console.log();
  } catch (error) {
    console.error(chalk.red(`Status failed: ${error.message}`));
    process.exit(1);
  }
}

function getGitignorePatterns() {
  try {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      return fs.readFileSync(gitignorePath, 'utf-8')
        .split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(pattern => pattern.trim());
    }
    return [];
  } catch (error) {
    return [];
  }
}