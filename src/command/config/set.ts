import config from '../../lib/config/index.js';

export default async function handleSetConfig(field: string, value: string) {
  config.set(field, value);
}
