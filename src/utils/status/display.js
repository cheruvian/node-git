import chalk from 'chalk';

export function displayCommitInfo(commitInfo) {
  if (!commitInfo) {
    console.log(chalk.yellow('\nNo commits yet'));
    return;
  }

  console.log(chalk.blue(`\nOn commit: ${commitInfo.shortHash}`));
}