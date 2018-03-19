#!/usr/bin/env node

'use strict';

const program = require('commander');
const protobuf2json = require('../lib');

program
  .version('0.2.1')
  .description('Convert JSON to protobuf')
  .option('-d, --directory <path>', 'path to base directory containing proto file and all its imports', '.')
  .option('-p, --proto <path>', 'path to proto file relative to base directory')
  .option('-t, --type <name>', 'protobuf message type')
  .option('-m, --multi', 'multiple JSON messages separated by newlines')
  .parse(process.argv);

if (!program.directory) {
  console.log('Error: `directory` should be a valid path to base directory containing the proto file');
  program.help();
}

if (!program.proto || program.proto.length < 3) {
  console.log('Error: `proto` should be path to a valid proto file relative to the base directory');
  program.help();
}

if (!program.type) {
  console.log('Error: `type` should be a valid protobuf message type contained in the proto file');
  program.help();
}

protobuf2json(true, program.directory, program.proto, program.type, program.multi);
