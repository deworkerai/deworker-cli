import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import config from '../../lib/config/index.js';

import { DeworkerAPI } from '../../lib/deworker-api/index.js';
import { checkAPIKey } from '../../helpers/config.js';

export default async function handleUpdateWorker(options: any) {
  checkAPIKey(options.key);
  const deworkerAPI = new DeworkerAPI({
    apiKey: options.key || config.get('key'),
    endpoint: options.endpoint || config.get('endpoint'),
  });

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

  console.log(chalk.green('updating worker...'));
  const { id: workerId, name, description, avatar, skills } = schema.schema;
  const res = await deworkerAPI.updateWorker({
    workerId,
    nameForHuman: name.human,
    nameForModel: name.model,
    descriptionForHuman: description.human,
    descriptionForModel: description.model,
    avatar,
    skills: skills.map((skill: any) => {
      return {
        nameForHuman: skill.name.human,
        nameForModel: skill.name.model,
        descriptionForHuman: skill.description.human,
        descriptionForModel: skill.description.model,
        requestSchema: skill.requestSchema,
        responseSchema: skill.responseSchema,
        basePoints: skill.basePoints,
      };
    }),
  });

  if (res.status === 'success') {
    console.log(chalk.green('the worker has been successfuly updated!'));
  } else {
    console.log(chalk.red(`worker update failed, ${res.msg}`));
  }
}
