'use strict';

var constants = require('./constants');
var utils = require('./utils');
var types = require('./types');

var defaultOptions = {
  extractData: true,
  checkHeader: true,
  checkChecksum: true,
  checkFileSize: true
};

var excludeFields = {
  size: true,
  checksum: true,
  ustar: true
};

var messages = {
  unexpectedEndOfFile: 'Unexpected end of file.',
  fileCorrupted: 'File is corrupted.',
  checksumCheckFailed: 'Checksum check failed.'
};

function headerSize(header) {
  // header has fixed size
  return types.recordSize;
}

function dataSize(size) {
  // align to record boundary
  return Math.ceil(size / types.recordSize) * types.recordSize;
}

function isEndOfFile(buffer, offset) {
  var from = offset;
  var to = Math.min(buffer.length, offset + types.recordSize * 2);
  for (var i = from; i < to; i++) {
    if (buffer[i] != 0) {
      return false;
    }
  }
  return true;
}

function readHeader(buffer, offset, options) {
  if (buffer.length - offset < types.recordSize) {
    if (options.checkFileSize) {
      throw new Error(messages.unexpectedEndOfFile);
    }
    return null;
  }

  offset = parseInt(offset) || 0;

  var result = {};
  var currentOffset = offset;
  types.posixHeader.forEach(function(field) {
    result[field[0]] = field[4](buffer, currentOffset, field);
    currentOffset += field[1];
  });

  if (result.type != 0) {  // only regular files can have data
    result.size = 0;
  }

  if (options.checkHeader) {
    types.posixHeader.forEach(function(field) {
      if (utils.isFunction(field[5]) && !field[5](result, field)) {
        var error = new Error(messages.fileCorrupted);
        error.data = {
          offset: offset + field[2],
          field: field[0]
        };
        throw error;
      }
    });
  }

  if (options.checkChecksum) {
    var checksum = types.calculateChecksum(buffer, offset, true);
    if (checksum != result.checksum) {
      var error = new Error(messages.checksumCheckFailed);
      error.data = {
        offset: offset,
        header: result,
        checksum: checksum
      };
      throw error;
    }
  }

  return result;
}

function readData(buffer, offset, header, options) {
  if (!options.extractData) {
    return null;
  }

  if (header.size <= 0) {
    return new Uint8Array();
  }
  return buffer.slice(offset, offset + header.size);
}

function createFile(header, data) {
  var result = {};
  types.posixHeader.forEach(function(field) {
    var name = field[0];
    if (!excludeFields[name]) {
      result[name] = header[name];
    }
  });

  result.isOldGNUFormat = header.ustar == constants.OLDGNU_MAGIC;

  if (data) {
    result.data = data;
  }

  return result;
}

function untar(buffer, options) {
  options = utils.extend({}, defaultOptions, options);

  var result = [];
  var offset = 0;
  var size = buffer.length;

  while (size - offset >= types.recordSize) {
    buffer = utils.toUint8Array(buffer);
    var header = readHeader(buffer, offset, options);
    if (!header) {
      break;
    }
    offset += headerSize(header);

    var data = readData(buffer, offset, header, options);
    result.push(createFile(header, data));
    offset += dataSize(header.size);

    if (isEndOfFile(buffer, offset)) {
      break;
    }
  }

  return result;
}

module.exports.untar = untar;
