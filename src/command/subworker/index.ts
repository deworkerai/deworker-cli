import { Command } from 'commander';
import handleRegisterSubworker from './register.js';

const cmd = new Command('subworker');

cmd
  .command('register')
  .description('register a subworker to deworker network')
  .option('--key <key>', 'deworker api key')
  .option('--endpoint <endpoint>', 'deworker api endpoint')
  .action(handleRegisterSubworker);

export default cmd;
