import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';

import { DeworkerAPI } from '../../lib/deworker-api/index.js';

export default async function handleRegisterSubworker(options: any) {
  if (!options.key) {
    console.log(chalk.red('API key is required'));
    process.exit(1);
  }

  const deworkerAPI = new DeworkerAPI({
    apiKey: options.key,
    endpoint: options.endpoint,
  });

  const yamlPath = path.join(process.cwd(), 'deworker.yaml');
  if (!fs.existsSync(yamlPath)) {
    console.log(chalk.red('deworker.yaml not found.'));
    process.exit(1);
  }

  const file = fs.readFileSync(yamlPath, 'utf8');
  const schema = YAML.parse(file);
  if (schema.type !== 'subworker') {
    console.log(chalk.red('type must be subworker, found ', schema.type));
    process.exit(1);
  }

  console.log(chalk.green('registering subworker...'));
  const { id: subworkerId, name, description, avatar, skills } = schema.schema;
  const res = await deworkerAPI.registerSubworker({
    subworkerId,
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
      };
    }),
  });

  if (res.status === 'success') {
    console.log(chalk.green('the subworker has been successfuly registered!'));
  } else {
    console.log(chalk.red(`subworker register failed, ${res.msg}`));
  }
}
