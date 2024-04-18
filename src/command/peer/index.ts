import { Command } from 'commander';
import handleGenerate from './generate.js';
import handleStartPeer from './start.js';
import handleRegisterPeer from './register.js';

const cmd = new Command('peer');

cmd
  .command('generate')
  .description('generate a peer key')
  .option('--key <key>', 'deworker api key')
  .option('-f, --file', 'whether save as a json file', false)
  .action(handleGenerate);

cmd
  .command('register')
  .description('register a peer')
  .option('--key <key>', 'deworker api key')
  .option('--peerId <peerId>', 'peer ID, can obtain with "deworker peer generate command"')
  .option('--workerId <workerId>', 'worker ID')
  .option('--endpoint <endpoint>', 'deworker api endpoint')
  .action(handleRegisterPeer);

cmd
  .command('start')
  .description('start run a worker as a miner')
  .option('--key <key>', 'deworker api key')
  .option('--endpoint <endpoint>', 'deworker api endpoint')
  .action(handleStartPeer);

export default cmd;
