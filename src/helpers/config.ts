import chalk from 'chalk';

import config from '../lib/config/index.js';

export const checkAPIKey = (key: string) => {
  if (!key && !config.all.key) {
    console.log(chalk.red('An API key is required, please configure it by choosing one of the following options:'));
    console.log(`1. global set with ` + chalk.cyan(`deworker config set key <your-api-key>`));
    console.log('2. append option with ' + chalk.cyan(`--key <your-api-key>`));
    process.exit(1);
  }

  // if (!endpoint && !config.all.endpoint) {
  //   console.log(chalk.red('endpoint is required, you can configure it using the following options: '));
  //   console.log(`1. global set with ` + chalk.cyan(`deworker config set endpoint <your-endpoint>`));
  //   console.log('2. append option with ' + chalk.cyan(`--endpoint <your-endpoint>`));
  //   process.exit(1);
  // }
};
