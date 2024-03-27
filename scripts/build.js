'use strict';

const path = require('path');
const fs = require('fs');
import chalk from 'chalk';
const tsconfig = require('../tsconfig.json');

const { outDir } = tsconfig.compilerOptions;

const dir = path.join(process.cwd(), outDir);

function readFold(foldPath) {
  const files = fs.readdirSync(foldPath);

  for (const file of files) {
    const directory = path.join(foldPath, file);
    const stats = fs.statSync(directory);
    if (stats.isDirectory()) {
      readFold(directory);
    }
    if (stats.isFile() && path.extname(directory) === '.js') {
      const content = fs.readFileSync(directory, 'utf-8');
      const reg = /require\("(@\/)(.*)"\)/g;
      const relativePath = path.relative(foldPath, dir);
      const replacePath = path.join(relativePath, '$2');
      if (reg.test(content)) {
        console.log(chalk.yellowBright(`Replaced "${RegExp.$1}" with "${relativePath}" in "${directory}".`));
        const resolvedContent = content.replace(reg, `require("${replacePath}")`);
        fs.writeFileSync(directory, resolvedContent, 'utf-8');
      }
    }
  }
}

readFold(dir);
console.log();
console.log(chalk.green('Build successed.'));
