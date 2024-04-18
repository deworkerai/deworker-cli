import { Command } from 'commander';
import handleRegisterWorker from './register.js';

const cmd = new Command('worker');

cmd
  .command('register')
  .description('register a AI worker to deworker network')
  .option('--key <key>', 'deworker api key')
  .option('--endpoint <endpoint>', 'deworker api endpoint')
  .action(handleRegisterWorker);

export default cmd;
