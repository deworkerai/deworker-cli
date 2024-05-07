import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { identify } from '@libp2p/identify';
import { webSockets } from '@libp2p/websockets';
import { Libp2p, createLibp2p } from 'libp2p';
import { createFromJSON } from '@libp2p/peer-id-factory';
import { pipe } from 'it-pipe';
import { decode, encode } from '@msgpack/msgpack';
import map from 'it-map';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import * as lp from 'it-length-prefixed';
import { multiaddr } from '@multiformats/multiaddr';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import express, { Express, Request, Response } from 'express';

export type ISendRequest =
  | {
      node: Libp2p;
      autoRelayNodeAddr: string;
      message: any;
      stream: true;
      onStream: (chunk: Buffer | Uint8Array) => void;
      onStreamEnd?: () => void;
    }
  | {
      node: Libp2p;
      autoRelayNodeAddr: string;
      message: any;
      stream: false | undefined;
    };

async function dialPeerConnect() {
  const id = await createFromJSON({
    id: '12D3KooWRLirPVvV5JRHG9YGX7LYcH726WGkBBCUcBvfKGWUZ237',
    privKey: 'CAESQDIwoCcqRVweMwZnHal1W1Hj3XLMrHUHNqv4WrZSLDSJ5qYddzhIGiY23T4kuR5RLxoU6v0aRu6XGwlN6don+S4=',
    pubKey: 'CAESIOamHXc4SBomNt0+JLkeUS8aFOr9GkbulxsJTenaJ/ku',
  });

  const node = await createLibp2p({
    peerId: id,
    transports: [webSockets()],
    connectionEncryption: [noise()],
    streamMuxers: [
      yamux({
        keepAliveInterval: 5000,
      }),
    ],
  });

  await node.start();
  return node;
}

async function dialSend(args: ISendRequest): Promise<string | void> {
  try {
    const { node, autoRelayNodeAddr, message, stream } = args;

    const co = await node.dial(multiaddr(autoRelayNodeAddr));
    console.log(`[P2P] dialed ${autoRelayNodeAddr}`);
    const newStream = await co.newStream('/call/1.0.0', {
      runOnTransientConnection: true,
    });
    const encodedMessage = encode(message);

    await pipe(
      [encodedMessage], // 源数据
      newStream.sink, // 目标流
    );

    let result;

    if (stream) {
      await pipe(
        newStream.source,
        (source) => lp.decode(source),
        // // (source) => decode(source),
        (source) => map(source, (buf: any) => uint8ArrayToString(buf.subarray())),
        async function (source) {
          // For each chunk of data
          // eslint-disable-next-line
          for await (const msg of source) {
            // Output the data as a utf8 string
            args?.onStream?.(msg as any);
          }
        },
      );
    } else {
      // Listen for a reply
      await pipe(newStream.source, async function (source) {
        // For each chunk of data
        // eslint-disable-next-line
        for await (const msg of source) {
          // Output the data as a utf8 string
          const reply = decode(msg.subarray());
          result = reply;
        }
      });
    }

    if (!stream) {
      return result;
    }
    args?.onStreamEnd?.();
  } catch (err) {
    // eslint-disable-next-line
    console.error(`[P2P send error]`, err);
    throw err;
  }
}
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

  const keyPath = path.join(process.cwd(), 'peerKey.json');

  if (!fs.existsSync(keyPath)) {
    console.log(
      `${chalk.red('peerKey.json not found, please run the following command:')}
      1. ${chalk.cyan('deworker peer generate --file')}
      2. ${chalk.cyan('deworker peer register --key=your_api_key --peerId=your_peer_id --workerId=your_worker_id')}`,
    );
    process.exit(1);
  }

  // start api server
  const app: Express = express();

  const key = fs.readFileSync(keyPath, { encoding: 'utf8' });

  const id = await createFromJSON(JSON.parse(key));

  const dialNode = await dialPeerConnect();
  const router = express.Router();
  router.post('/api/v1/worker/call', async (req: Request, res: Response) => {
    const {
      workerId,
      workerName,
      skill,
      params,
      stream = false,
    } = req.body as {
      workerId?: string;
      workerName?: string;
      skill: string;
      params?: any;
      stream?: boolean;
    };
    const tartPeerAddr = `/ip4/127.0.0.1/tcp/8443/ws/p2p/${id}`;
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      await dialSend({
        node: dialNode,
        autoRelayNodeAddr: tartPeerAddr,
        message: {
          workerId,
          workerName,
          skill,
          params,
          stream: true,
        },
        stream: true,
        onStream(chunk) {
          res.write(`data: ${chunk}\n\n`);
        },
        onStreamEnd() {
          res.end();
        },
      });
    } else {
      const result = await dialSend({
        node: dialNode,
        autoRelayNodeAddr: tartPeerAddr,
        message: {
          workerId,
          workerName,
          skill,
          params,
          stream: false,
        },
        stream: false,
      });

      res.json({
        status: 'success',
        data: result,
      });
    }
  });
  app.use(express.json());
  app.use(router);

  const node = await createLibp2p({
    peerId: id,
    addresses: {
      listen: ['/ip4/127.0.0.1/tcp/8443/ws'],
    },
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
    app.listen(options.port || 4000, () => {
      console.log(chalk.green(`listening to port ${options.port || 4000}`));
    });
  });
}
