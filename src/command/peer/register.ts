import chalk from 'chalk';

import { DeworkerAPI } from '../../lib/deworker-api/index.js';

export default async function handleRegisterPeer(options: any) {
  const { key, peerId, workerId } = options;
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
  if (!workerId) {
    console.log(chalk.red('worker id is required, please add --workerId option'));
    process.exit(1);
  }

  const deworkerAPI = new DeworkerAPI({
    apiKey: options.key,
    endpoint: options.endpoint,
  });

  console.log(chalk.green('registering peer...'));

  const res = await deworkerAPI.registerPeer({
    peerId,
    workerId,
  });

  if (res.status === 'success') {
    console.log(chalk.green('the peer has been successfully registered!'));
    console.log(chalk.cyan(`peer id: ${res.data.peerId}`));
    console.log(chalk.cyan(`worker id: ${res.data.workerId}`));
  } else {
    console.log(chalk.red(`peer register failed, ${res.msg}`));
  }
}
