import { Command } from 'commander';
import handleRegisterSubworker from './register';


const cmd = new Command('subworker');

cmd
  .command('register')
  .description('register a subworker to deworker network')
  .option('--key <key>', 'deworker api key')
  .action(handleRegisterSubworker);

export default cmd;
