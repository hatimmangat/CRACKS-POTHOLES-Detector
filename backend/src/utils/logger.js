/**
 * logger.js — Simple console logger with [API] prefix and timestamps.
 */

const chalk = (() => {
  // Use ANSI codes directly — no external dependency needed
  const colors = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    gray: '\x1b[90m',
  };
  return colors;
})();

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info: (message) => {
    console.log(`${chalk.gray}${timestamp()}${chalk.reset} ${chalk.cyan}[API]${chalk.reset} ${message}`);
  },
  warn: (message) => {
    console.warn(`${chalk.gray}${timestamp()}${chalk.reset} ${chalk.yellow}[API WARN]${chalk.reset} ${message}`);
  },
  error: (message, err) => {
    console.error(`${chalk.gray}${timestamp()}${chalk.reset} ${chalk.red}[API ERROR]${chalk.reset} ${message}`);
    if (err) {
      console.error(err);
    }
  },
  success: (message) => {
    console.log(`${chalk.gray}${timestamp()}${chalk.reset} ${chalk.green}[API]${chalk.reset} ${message}`);
  },
};

module.exports = logger;
