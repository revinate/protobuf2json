'use strict';

const path = require('path');
const protobuf = require('protobufjs');
const readline = require('readline');
const getStdin = require('get-stdin');

module.exports = (isEncode, directory, protobufPath, messageType, multi) => {
  const root = new protobuf.Root();
  root.resolvePath = (origin, target) => path.resolve(directory, target);

  protobuf.load(protobufPath, root).then(root => {
    const datatype = root.lookupType(messageType);

    if (isEncode) {
      encode(datatype, multi);
    } else {
      decode(datatype, multi);
    }
  }).catch(error => console.error(error));
};

const encode = (datatype, multi) => {
  if (multi) {
    const rl = readline.createInterface({
      input: process.stdin
    });

    rl.on('line', line => {
      const buf = datatype.encode(JSON.parse(line)).finish();
      const sizeBuf = Buffer.alloc(4);
      sizeBuf.writeInt32BE(buf.length, 0);
      process.stdout.write(sizeBuf);
      process.stdout.write(buf);
    });
  } else {
    getStdin.buffer().then(buf => {
      process.stdout.write(datatype.encode(JSON.parse(buf.toString())).finish());
    }).catch(error => console.error(error));
  }
};

const decode = (datatype, multi) => {
  getStdin.buffer().then(buf => {
    if (multi) {
      const length = buf.length;
      let begin = 0;
      let end = 0;
      do {
        end = begin + 4 + buf.readInt32BE(begin);
        console.log(JSON.stringify(datatype.decode(buf.slice(begin + 4, end))));
        begin = end;
      } while (begin < length)
    } else {
      console.log(JSON.stringify(datatype.decode(buf)));
    }
  }).catch(error => console.error(error));
};
