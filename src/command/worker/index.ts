import { Command } from 'commander';
import handleRegisterWorker from './register.js';
import handleTestWorker from './test.js';
import handleUpdateWorker from './update.js';

const cmd = new Command('worker');

cmd
  .command('register')
  .description('register a AI worker to deworker network')
  .option('--key <key>', 'deworker api key')
  .option('--endpoint <endpoint>', 'deworker api endpoint')
  .action(handleRegisterWorker);

cmd
  .command('update')
  .description('update a AI worker')
  .option('--key <key>', 'deworker api key')
  .option('--endpoint <endpoint>', 'deworker api endpoint')
  .action(handleUpdateWorker);

cmd
  .command('test')
  .description('test a AI worker')
  .option('--key <key>', 'deworker api key')
  .option('--endpoint <endpoint>', 'deworker api endpoint')
  .action(handleTestWorker);

export default cmd;
