import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { identify } from '@libp2p/identify';
import { webSockets } from '@libp2p/websockets';
import { createLibp2p } from 'libp2p';
import { createFromJSON } from '@libp2p/peer-id-factory';
import { pipe } from 'it-pipe';
import { decode, encode } from '@msgpack/msgpack';
import map from 'it-map';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import * as lp from 'it-length-prefixed';
import express, { Express } from 'express';

export default async function handleTestWorker(options: any) {
  const yamlPath = path.join(process.cwd(), 'deworker.yaml');
  if (!fs.existsSync(yamlPath)) {
    console.log(chalk.red('deworker.yaml not found.'));
    process.exit(1);
  }
  const file = fs.readFileSync(yamlPath, 'utf8');
  const schema = YAML.parse(file);
  if (schema.type !== 'worker') {
    console.log(chalk.red('type must be worker, found ', schema.type));
    process.exit(1);
  }

  const entryPath = path.join(process.cwd(), schema.schema.entry);

  console.log(chalk.green('checking whether the entry file exist...'));
  if (!fs.existsSync(entryPath)) {
    console.log(
      `${chalk.red('the entry file is not found, please make sure the file:' + schema.schema.file + ' exists')}`,
    );
    process.exit(1);
  }

  console.log(chalk.green('choosing a best one relay node address...'));

  const keyPath = path.join(process.cwd(), 'peerKey.json');

  if (!fs.existsSync(keyPath)) {
    console.log(
      `${chalk.red('peerKey.json not found, please run the following command:')}
      1. ${chalk.cyan('deworker peer generate')}
      2. ${chalk.cyan('deworker peer register --key=your_api_key --peerId=your_peer_id --workerId=your_worker_id')}`,
    );
    process.exit(1);
  }

  // start api server
  const app: Express = express();
  app.listen(options.port || 4000, () => {
    console.log(chalk.green(`Listening to port ${options.port || 4000}`));
  });

  const key = fs.readFileSync(keyPath, { encoding: 'utf8' });

  const id = await createFromJSON(JSON.parse(key));

  const node = await createLibp2p({
    peerId: id,
    transports: [webSockets()],
    connectionEncryption: [noise()],
    streamMuxers: [
      yamux({
        keepAliveInterval: 5000,
      }),
    ],
    services: {
      identify: identify(),
    },
  });
  await node.start();
  console.log(chalk.green(`peer started with id ${chalk.cyan(node.peerId.toString())}`));

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
            stream?: boolean;
          };
          console.log(chalk.green(`calling the skill ${chalk.cyan(message.skill)} ...`));

          // run handler
          const skill = schema.schema.skills.find((sk: any) => sk.name.model === message.skill);
          if (!skill) {
            stream.abort(new Error('Skill not found'));
            return;
          }
          const res = await entry?.[skill?.handler]?.(message);
          if (message.stream) {
            // Send the reply
            await pipe(
              res, // Source data
              // Turn strings into buffers
              (source) => map(source, (string: string) => uint8ArrayFromString(string)),
              // Encode with length prefix (so receiving side knows how much data is coming)
              (source) => lp.encode(source),
              stream.sink, // Target stream
            );
          } else {
            // Encode the reply message
            const replyMessage = encode(res);

            // Send the reply
            await pipe(
              [replyMessage], // Source data
              stream, // Target stream
            );
          }
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
