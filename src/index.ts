#!/usr/bin/env tsx
// install local package: pnpm install -g "deworker-cli@link:$(pwd)"
import { Command } from 'commander';
import dotenv from 'dotenv';

import workerCMD from './command/worker/index.js';
import peerCMD from './command/peer/index.js';
import configCMD from './command/config/index.js';

dotenv.config();

const program = new Command('deworker');

program.addCommand(workerCMD, { hidden: false });
program.addCommand(peerCMD, { hidden: false });
program.addCommand(configCMD, { hidden: false });

program.usage('<command> [options]');

program.parse(process.argv);
