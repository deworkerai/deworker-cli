#!/usr/bin/env tsx

import { Command } from 'commander';

import subworkerCMD from './command/subworker';
import peerCMD from './command/peer';

const program = new Command('deworker');

program.addCommand(subworkerCMD, { hidden: false });
program.addCommand(peerCMD, { hidden: false });

program.parse(process.argv);
