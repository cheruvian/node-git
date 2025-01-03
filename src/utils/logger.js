import chalk from 'chalk';

export const logger = {
  info: (message) => console.log(chalk.blue(message)),
  success: (message) => console.log(chalk.green(message)),
  error: (message) => console.error(chalk.red(message)),
  debug: (message) => console.log(chalk.gray(message)),
  warn: (message) => console.log(chalk.yellow(message))
};