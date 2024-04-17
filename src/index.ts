#!/usr/bin/env node

import { Command } from 'commander';

import subworkerCMD from './command/subworker/index.js';
import peerCMD from './command/peer/index.js';

const program = new Command('deworker');

program.addCommand(subworkerCMD, { hidden: false });
program.addCommand(peerCMD, { hidden: false });

program.parse(process.argv);
