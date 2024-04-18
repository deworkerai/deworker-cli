import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

import { DeworkerAPI } from '../../lib/deworker-api/index.js';

export default async function handleRegisterWorker(options: any) {
  if (!options.key) {
    console.log(chalk.red('API key is required'));
    process.exit(1);
  }

  const deworkerAPI = new DeworkerAPI({
    apiKey: options.key,
  });

  console.log(chalk.green('generating a peer key...'));
  const res = await deworkerAPI.generateKey();

  if (res.status === 'success') {
    console.log(chalk.green('peer key generated successfuly!'));
    console.log(options);

    if (options.file) {
      const peerKeyPath = path.join(process.cwd(), 'peerKey.json');
      fs.writeFileSync(peerKeyPath, JSON.stringify(res.data, null, 2));
    } else {
      console.log(JSON.stringify(res.data, null, 2));
    }
  } else {
    console.log(chalk.red(`peer key generate failed, ${res.msg}`));
  }
}
