'use strict';

var constants = require('./constants');
var utils = require('./utils');
var types = require('./types');

function headerSize(file) {
  // header has fixed size
  return types.recordSize;
}

function dataSize(file) {
  // align to record boundary
  return Math.ceil(file.data.length / types.recordSize) * types.recordSize;
}

function allocateBuffer(files) {
  var totalSize = 0;

  // Calculate space that will be used by each file
  files.forEach(function(file) {
    totalSize += headerSize(file) + dataSize(file);
  });

  // TAR must end with two empty records
  totalSize += types.recordSize * 2;

  // Array SHOULD be initialized with zeros:
  // from TypedArray constructor docs:
  // > When creating a TypedArray instance (i.e. instance of Int8Array
  // > or similar), an array buffer is created internally
  // from ArrayBuffer constructor docs:
  // > A new ArrayBuffer object of the specified size.
  // > Its contents are initialized to 0.
  return new Uint8Array(totalSize);
}

function writeHeader(buffer, file, offset) {
  offset = parseInt(offset) || 0;

  var currentOffset = offset;
  types.posixHeader.forEach(function(field) {
    var value = field[3](file, field);
    var length = value.length;
    for (var i = 0; i < length; i += 1) {
      buffer[currentOffset + i] = value.charCodeAt(i) & 0xFF;
    }
    currentOffset += field[1];  // move to the next field
  });

  var field = utils.find(types.posixHeader, function(field) {
    return field[0] == 'checksum';
  });

  if (field) {
    // Patch checksum field
    var checksum = types.calculateChecksum(buffer, offset, true);
    var value = types.formatTarNumber(checksum, field[1] - 2) +
      constants.NULL_CHAR + ' ';
    currentOffset = offset + field[2];
    for (var i = 0; i < value.length; i += 1) {
      // put bytes
      buffer[currentOffset] = value.charCodeAt(i) & 0xFF;
      currentOffset++;
    }
  }

  return offset + headerSize(file);
}

function writeData(buffer, file, offset) {
  offset = parseInt(offset, 10) || 0;
  buffer.set(file.data, offset);
  return offset + dataSize(file);
}

function tar(files) {
  files = utils.map(files, function(file) {
    return utils.extend({}, file, {
      data: utils.toUint8Array(file.data)
    });
  });

  var buffer = allocateBuffer(files);

  var offset = 0;
  files.forEach(function(file) {
    offset = writeHeader(buffer, file, offset);
    offset = writeData(buffer, file, offset);
  });

  return buffer;
}

module.exports.tar = tar;
