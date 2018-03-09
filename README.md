# protobuf2json

Command-line utility to convert protobuf-encoded messages to JSON and vice versa.

## Installation

```
$ npm install -g protobuf2json
```

## Usage

### Convert protobuf to JSON

```
$ protobuf2json -h

  Usage: protobuf2json [options]

  Convert protobuf to JSON


  Options:

    -V, --version           output the version number
    -d, --directory <path>  path to base directory containing proto file and all its imports
    -p, --proto <path>      path to proto file relative to base directory
    -t, --type <name>       protobuf message type
    -m, --multi             multiple protobuf messages with prefixed signed 32-bit big endian message length
    -h, --help              output usage information
```

The protobuf-encoded message(s) is given as stdin. For example, suppose all of our proto files are in
the `protos` directory. Inside the directory there is `my_message.proto` containing the `MyMessage` message.
`my_message.proto` may import other proto files located inside the `protos` directory and subdirectories.
The following command will decode the `my_message.bin` file containing a single protobuf-encoded `MyMessage`
and emit the JSON to stdout:

```
$ protobuf2json -d protos -p my_message.proto -t MyMessage < my_message.bin
```

If multiple messages are combined in the input, each message must be prefixed with a signed, 32-bit
big endian integer indicating the length of the message. A file in this encoding can be converted to
JSON as follows:

```
$ protobuf2json -d protos -p my_message.proto -t MyMessage -m < my_messages.bin
```

### Convert JSON to protobuf

```
$ json2protobuf -h

  Usage: json2protobuf [options]

  Convert JSON to protobuf


  Options:

    -V, --version           output the version number
    -d, --directory <path>  path to base directory containing proto file and all its imports
    -p, --proto <path>      path to proto file relative to base directory
    -t, --type <name>       protobuf message type
    -m, --multi             multiple JSON messages separated by newlines
    -h, --help              output usage information
```

The JSON message(s) is given as stdin. For example, suppose all of our proto files are in
the `protos` directory. Inside the directory there is `my_message.proto` containing the `MyMessage` message.
`my_message.proto` may import other proto files located inside the `protos` directory and subdirectories.
The following command will encode the `my_message.json` file containing a single `MyMessage` in JSON form
and emit the encoded protobuf to stdout:

```
$ json2protobuf -d protos -p my_message.proto -t MyMessage < my_message.json
```

If multiple JSON messages are combined in the input, each message must be a single line, and terminated
by a newline. A file in this encoding can be converted to protobuf as follows:

```
$ json2protobuf -d protos -p my_message.proto -t MyMessage -m < my_messages.json
```

### Usage with kafkacat

This utility can be used with [kafkacat](https://github.com/edenhill/kafkacat) to publish protobuf-encoded
messages to Kafka topics, and to examine the contents of Kafka topics containing protobuf-encoded messages.

To publish a protobuf-encoded message to Kafka:

```
$ json2protobuf -d protos -p my_message.proto -t MyMessage < my_message.json | kafkacat -P -b <broker> -t <topic> -D zxzzqx
```

To print the contents of a protobuf-encoded Kafka topic to stdout:

```
$ kafkacat -C -b <broker> -t <topic> -e -o beginning -f '%R%s' | protobuf2json -d protos -p my_message.proto -t MyMessage -m
```

Note the use of the `-f '%R%s'` argument to `kafkacat` to produce length-prefixed message output and
the `-m` argument to `protobuf2json` to support multiple messages as input.
