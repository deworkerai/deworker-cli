import { Command } from 'commander';
import handleGenerate from './generate';
import handleStartPeer from './start';
import handleRegisterPeer from './register';

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
  .option('--subworkerId <subworkerId>', 'subworker ID')
  .action(handleRegisterPeer);

cmd
  .command('start')
  .description('start run a subworker as a miner')
  .option('--key <key>', 'deworker api key')
  .action(handleStartPeer);

export default cmd;
