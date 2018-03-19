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
      const out = encodeStr(datatype, line);
      const sizeBuf = Buffer.alloc(4);
      sizeBuf.writeInt32BE(out.length, 0);
      process.stdout.write(sizeBuf);
      process.stdout.write(out);
    });
  } else {
    getStdin.buffer().then(buf => {
      const out = encodeStr(datatype, buf.toString());
      process.stdout.write(out);
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
        console.log(decodeBuf(datatype, buf.slice(begin + 4, end)));
        begin = end;
      } while (begin < length)
    } else {
      console.log(decodeBuf(datatype, buf));
    }
  }).catch(error => console.error(error));
};

const encodeStr = (datatype, str) => {
  const msg = datatype.fromObject(JSON.parse(str));
  return datatype.encode(msg).finish();
};

const decodeBuf = (datatype, buf) =>
  JSON.stringify(datatype.toObject(datatype.decode(buf), {
    longs: String,
    enums: String,
    bytes: String,
    defaults: true,
    json: true
  }), (key, value) => {
    if (value === null) {
      return undefined;
    } else {
      return value;
    }
  });
