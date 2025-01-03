import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { createPatch } from 'diff';

export async function diff(filepath) {
  try {
    const gitPath = path.join(process.cwd(), '.git');
    const stagingPath = path.join(gitPath, 'staging');

    if (!fs.existsSync(gitPath)) {
      throw new Error('Not a git repository');
    }

    if (filepath) {
      showFileDiff(filepath, stagingPath);
    } else {
      const files = fs.readdirSync(stagingPath);
      for (const file of files) {
        showFileDiff(file, stagingPath);
      }
    }
  } catch (error) {
    console.error(chalk.red(`Diff failed: ${error.message}`));
    process.exit(1);
  }
}

function showFileDiff(filepath, stagingPath) {
  const stagingFile = path.join(stagingPath, filepath);
  const workingFile = path.join(process.cwd(), filepath);

  if (!fs.existsSync(workingFile)) {
    console.log(chalk.red(`File ${filepath} not found in working directory`));
    return;
  }

  const stagedContent = fs.existsSync(stagingFile) 
    ? fs.readFileSync(stagingFile, 'utf-8')
    : '';
  const workingContent = fs.readFileSync(workingFile, 'utf-8');

  const patch = createPatch(filepath, stagedContent, workingContent);
  
  console.log(chalk.bold(`\nDiff for ${filepath}:`));
  patch.split('\n').forEach(line => {
    if (line.startsWith('+')) {
      console.log(chalk.green(line));
    } else if (line.startsWith('-')) {
      console.log(chalk.red(line));
    } else {
      console.log(line);
    }
  });
}