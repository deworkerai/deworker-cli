import chalk from 'chalk';
import config from '../../lib/config/index.js';

export default async function handleGetConfig(fields: string[]) {
  if (fields.length === 0) {
    const allConfig = config.all;
    for (const [key, value] of Object.entries(allConfig)) {
      console.log(`${chalk.yellow(key)}=${chalk.green(String(value))}`);
    }
    process.exit(1);
  }

  const selectedConfig = fields.reduce(
    (acc, field) => {
      acc[field] = config.get(field);
      return acc;
    },
    {} as Record<string, unknown>,
  );

  for (const [key, value] of Object.entries(selectedConfig)) {
    console.log(`${chalk.yellow(key)}=${chalk.green(String(value))}`);
  }
}
