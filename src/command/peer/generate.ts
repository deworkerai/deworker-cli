import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

import { DeworkerAPI } from '../../lib/deworker-api/index.js';
import { checkAPIKey } from '../../helpers/config.js';
import config from '../../lib/config/index.js';

export default async function handleRegisterWorker(options: any) {
  checkAPIKey(options.key);

  const deworkerAPI = new DeworkerAPI({
    apiKey: options.key || config.get('key'),
    endpoint: options.endpoint || config.get('endpoint'),
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
