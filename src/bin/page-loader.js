#!/usr/bin/env node

import program from 'commander';
import pageLoader from '..';

program
  .version('0.0.6')
  .description('Download web pages')
  .arguments('<url>')
  .option('--output [type]', 'Output folder')
  .action((url, options) => {
    pageLoader(url, options);
  })
  .parse(process.argv);
