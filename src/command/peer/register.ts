import chalk from 'chalk';

import { DeworkerAPI } from '../../lib/deworker-api';

export default async function handleRegisterPeer(options: any, command: any) {
  const { key, peerId, subworkerId } = options;
  if (!key) {
    console.log(chalk.red('API key is required'));
    process.exit(1);
  }

  if (!peerId) {
    console.log(
      chalk.red('peerId is required, it can obtain with ') +
        chalk.cyan('deworker peer generate') +
        chalk.red(' command'),
    );
    process.exit(1);
  }
  if (!subworkerId) {
    console.log(chalk.red('subworker ID is required, please add --subworkerId option'));
    process.exit(1);
  }

  const deworkerAPI = new DeworkerAPI({
    apiKey: options.key,
  });

  console.log(chalk.green('registering peer...'));

  const res = await deworkerAPI.registerPeer({
    peerId,
    subworkerId,
  });

  if (res.status === 'success') {
    console.log(chalk.green('the peer has been successfully registered!'));
    console.log(chalk.cyan(`peer id: ${res.data.peerId}`));
    console.log(chalk.cyan(`subworker id: ${res.data.subworkerId}`));
  } else {
    console.log(chalk.red(`peer register failed, ${res.msg}`));
  }
}
