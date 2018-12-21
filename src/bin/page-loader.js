#!/usr/bin/env node

import program from 'commander';
import pageLoader from '..';

program
  .version('0.0.9')
  .description('Download web pages')
  .arguments('<url>')
  .option('--output [type]', 'Output folder')
  .action((url, options) => {
    pageLoader(url, options)
      .then(() => {
        console.log('Page download succesful!');
      }).catch((e) => {
        console.error(e.message);
        process.exit(1);
      });
  })
  .parse(process.argv);
