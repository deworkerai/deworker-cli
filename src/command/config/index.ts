import { Command } from 'commander';
import handleSetConfig from './set.js';
import handleGetConfig from './get.js';

const cmd = new Command('config');

cmd
  .command('set')
  .description('set one or more config fields')
  .argument('<field>', 'field name')
  .argument('<value>', 'value to set')
  .usage('<field> <value>')
  .action(handleSetConfig);

cmd
  .command('get')
  .arguments('[field...]')
  .description('get one or more config values')
  .action(handleGetConfig)
  .usage('[field...]');

cmd.usage('<command> [options]');
export default cmd;
