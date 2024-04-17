#!/usr/bin/env tsx
// install local package: pnpm install -g "deworker-cli@link:$(pwd)"
import { Command } from 'commander';

import subworkerCMD from './command/subworker/index.js';
import peerCMD from './command/peer/index.js';

console.log('Welcome to use deworker cli');
console.log();

const program = new Command('deworker');

program.addCommand(subworkerCMD, { hidden: false });
program.addCommand(peerCMD, { hidden: false });

program.parse(process.argv);
