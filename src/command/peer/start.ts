import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import { identify } from '@libp2p/identify';
import { webSockets } from '@libp2p/websockets';
import { multiaddr } from '@multiformats/multiaddr';
import { createLibp2p } from 'libp2p';
import { createFromJSON } from '@libp2p/peer-id-factory';
import { pipe } from 'it-pipe';
import { decode, encode } from '@msgpack/msgpack';

import { DeworkerAPI } from '../../lib/deworker-api/index.js';

export default async function handleStartWorker(options: any) {
  if (!options.key) {
    console.log(chalk.red('API key is required'));
    process.exit(1);
  }

  const yamlPath = path.join(process.cwd(), 'deworker.yaml');
  if (!fs.existsSync(yamlPath)) {
    console.log(chalk.red('deworker.yaml not found.'));
    process.exit(1);
  }
  const file = fs.readFileSync(yamlPath, 'utf8');
  const schema = YAML.parse(file);

  const entryPath = path.join(process.cwd(), schema.schema.entry);

  console.log(chalk.green('checking whether the entry file exist...'));
  if (!fs.existsSync(entryPath)) {
    console.log(
      `${chalk.red('the entry file is not found, please make sure the file:' + schema.schema.file + ' exists')}`,
    );
    process.exit(1);
  }

  console.log(chalk.green('choosing a best one relay node address...'));
  const deworkerAPI = new DeworkerAPI({
    apiKey: options.key,
    endpoint: options.endpoint,
  });

  const addr = await deworkerAPI.getBestRelay();
  if (addr.status === 'fail') {
    console.log(chalk.red(`get relay node address failed, ${addr.msg}`));
    process.exit(1);
  }

  console.log(chalk.green(`the best one relay node address is ${chalk.cyan(addr.data)}`));

  const keyPath = path.join(process.cwd(), 'peerKey.json');

  if (!fs.existsSync(keyPath)) {
    console.log(
      `${chalk.red('peerKey.json not found, please run the following command:')}
      1. ${chalk.cyan('deworker peer generate')}
      2. ${chalk.cyan('deworker peer register --key=your_api_key --peerId=your_peer_id --workerId=your_worker_id')}`,
    );
    process.exit(1);
  }

  const key = fs.readFileSync(keyPath, { encoding: 'utf8' });

  const id = await createFromJSON(JSON.parse(key));

  const node = await createLibp2p({
    peerId: id,
    transports: [
      webSockets(),
      circuitRelayTransport({
        discoverRelays: 2,
      }),
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    services: {
      identify: identify(),
    },
  });
  await node.start();
  console.log(chalk.green(`peer started with id ${chalk.cyan(node.peerId.toString())}`));

  await node.dial(multiaddr(addr.data));

  console.log(chalk.green(`connected to the relay ${chalk.cyan(addr.data)}`));

  const entry = await import(path.join(process.cwd(), schema.schema.entry));

  if (schema.schema.hooks?.post) {
    console.log(chalk.green(`executing post hooks...`));
    await entry[schema.schema.hooks.post]();
  }

  await node.handle(
    '/call/1.0.0',
    async ({ stream }) => {
      return pipe(stream.source, async function (source) {
        // For each chunk of data
        for await (const msg of source) {
          // Output the data as a utf8 string
          const message = decode(msg.subarray()) as {
            skill: string;
            workerName: string;
            workerId?: string;
            params: any;
          };
          console.log(chalk.green(`calling the skill ${chalk.cyan(message.skill)} ...`));

          // run handler
          const skill = schema.schema.skills.find((sk: any) => sk.name.model === message.skill);
          const res = await entry[skill.handler]({ params: message.params });

          // Encode the reply message
          const replyMessage = encode(res);

          // Send the reply
          await pipe(
            [replyMessage], // Source data
            stream, // Target stream
          );
        }
      });
    },
    {
      runOnTransientConnection: true,
      maxInboundStreams: 1000000,
      maxOutboundStreams: 10000000,
    },
  );
  // Log a message when a remote peer connects to us
  node.addEventListener('peer:connect', (evt) => {
    const remotePeer = evt.detail;
    console.log(chalk.cyan(remotePeer.toString()) + chalk.green(' connected'));
  });

  // Wait for connection and relay to be bind for the example purpose
  node.addEventListener('self:peer:update', () => {
    // Updated self multiaddrs?
    console.log(chalk.green(`advertising with a relay address of ${chalk.cyan(node.getMultiaddrs()[0]?.toString())}`));
  });

  // node.addEventListener('connection:close', (evt) => {
  //   console.log(evt);
  //   // console.log(chalk.cyan(remotePeer.toString()) + chalk.green(' connected'));
  // });
}
