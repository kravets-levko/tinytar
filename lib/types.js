'use strict';

var utils = require('./utils');
var constants = require('./constants');

var recordSize = 512;
var defaultFileMode = constants.TPERMALL;  // rwxrwxrwx
var defaultUid = 0;  // root
var defaultGid = 0;  // root

/*
 struct posix_header {           // byte offset
 char name[100];               //   0
 char mode[8];                 // 100
 char uid[8];                  // 108
 char gid[8];                  // 116
 char size[12];                // 124
 char mtime[12];               // 136
 char chksum[8];               // 148
 char typeflag;                // 156
 char linkname[100];           // 157
 char magic[6];                // 257
 char version[2];              // 263
 char uname[32];               // 265
 char gname[32];               // 297
 char devmajor[8];             // 329
 char devminor[8];             // 337
 char prefix[131];             // 345
 char atime[12];               // 476
 char ctime[12];               // 488
 };
 */

var posixHeader = [
  // <field name>, <size>, <offset>, <used>, <format>, <parse>, [ <check> ]
  ['name', 100, 0, function(file, field) {
    return formatTarString(file[field[0]], field[1]);
  }, function(buffer, offset, field) {
    return parseTarString(buffer.slice(offset, offset + field[1]));
  }],
  ['mode', 8, 100, function(file, field) {
    var mode = file[field[0]] || defaultFileMode;
    mode = mode & constants.TPERMMASK;
    return formatTarNumber(mode, field[1], defaultFileMode);
  }, function(buffer, offset, field) {
    var result = parseTarNumber(buffer.slice(offset, offset + field[1]));
    result &= constants.TPERMMASK;
    return result;
  }],
  ['uid', 8, 108, function(file, field) {
    return formatTarNumber(file[field[0]], field[1], defaultUid);
  }, function(buffer, offset, field) {
    return parseTarNumber(buffer.slice(offset, offset + field[1]));
  }],
  ['gid', 8, 116, function(file, field) {
    return formatTarNumber(file[field[0]], field[1], defaultGid);
  }, function(buffer, offset, field) {
    return parseTarNumber(buffer.slice(offset, offset + field[1]));
  }],
  ['size', 12, 124, function(file, field) {
    return formatTarNumber(file.data.length, field[1]);
  }, function(buffer, offset, field) {
    return parseTarNumber(buffer.slice(offset, offset + field[1]));
  }],
  ['modifyTime', 12, 136, function(file, field) {
    return formatTarDateTime(file[field[0]], field[1]);
  }, function(buffer, offset, field) {
    return parseTarDateTime(buffer.slice(offset, offset + field[1]));
  }],
  ['checksum', 8, 148, function(file, field) {
    return '        ';  // placeholder
  }, function(buffer, offset, field) {
    return parseTarNumber(buffer.slice(offset, offset + field[1]));
  }],
  ['type', 1, 156, function(file, field) {
    // get last octal digit; 0 - regular file
    return '' + ((parseInt(file[field[0]], 10) || 0) % 8);
  }, function(buffer, offset, field) {
    return (parseInt(String.fromCharCode(buffer[offset]), 10) || 0) % 8;
  }],
  ['linkName', 100, 157, function(file, field) {
    return '';  // only regular files are supported
  }, function(buffer, offset, field) {
    return parseTarString(buffer.slice(offset, offset + field[1]));
  }],
  ['ustar', 8, 257, function(file, field) {
    return constants.TMAGIC;  // magic + version
  }, function(buffer, offset, field) {
    return fixUstarMagic(
      parseTarString(buffer.slice(offset, offset + field[1]), true)
    );
  }, function(file, field) {
    return (file[field[0]] == constants.TMAGIC) ||
      (file[field[0]] == constants.OLDGNU_MAGIC);
  }],
  ['owner', 32, 265, function(file, field) {
    return formatTarString(file[field[0]], field[1]);
  }, function(buffer, offset, field) {
    return parseTarString(buffer.slice(offset, offset + field[1]));
  }],
  ['group', 32, 297, function(file, field) {
    return formatTarString(file[field[0]], field[1]);
  }, function(buffer, offset, field) {
    return parseTarString(buffer.slice(offset, offset + field[1]));
  }],
  ['majorNumber', 8, 329, function(file, field) {
    return '';  // only regular files are supported
  }, function(buffer, offset, field) {
    return parseTarNumber(buffer.slice(offset, offset + field[1]));
  }],
  ['minorNumber', 8, 337, function(file, field) {
    return '';  // only regular files are supported
  }, function(buffer, offset, field) {
    return parseTarNumber(buffer.slice(offset, offset + field[1]));
  }],
  ['prefix', 131, 345, function(file, field) {
    return formatTarString(file[field[0]], field[1]);
  }, function(buffer, offset, field) {
    return parseTarString(buffer.slice(offset, offset + field[1]));
  }],
  ['accessTime', 12, 476, function(file, field) {
    return formatTarDateTime(file[field[0]], field[1]);
  }, function(buffer, offset, field) {
    return parseTarDateTime(buffer.slice(offset, offset + field[1]));
  }],
  ['createTime', 12, 488, function(file, field) {
    return formatTarDateTime(file[field[0]], field[1]);
  }, function(buffer, offset, field) {
    return parseTarDateTime(buffer.slice(offset, offset + field[1]));
  }]
];

var effectiveHeaderSize = (function(header) {
  var last = header[header.length - 1];
  return last[2] + last[1];  // offset + size
})(posixHeader);

function fixUstarMagic(value) {
  if (value.length == 8) {
    var chars = value.split('');

    if (chars[5] == constants.NULL_CHAR) {
      // TMAGIC ?
      if ((chars[6] == ' ') || (chars[6] == constants.NULL_CHAR)) {
        chars[6] = '0';
      }
      if ((chars[7] == ' ') || (chars[7] == constants.NULL_CHAR)) {
        chars[7] = '0';
      }
      chars = chars.join('');
      return chars == constants.TMAGIC ? chars : value;
    } else if (chars[7] == constants.NULL_CHAR) {
      // OLDGNU_MAGIC ?
      if (chars[5] == constants.NULL_CHAR) {
        chars[5] = ' ';
      }
      if (chars[6] == constants.NULL_CHAR) {
        chars[6] = ' ';
      }
      return chars == constants.OLDGNU_MAGIC ? chars : value;
    }
  }
  return value;
}

function formatTarString(value, length) {
  length -= 1;  // preserve space for trailing null-char
  if (utils.isUndefined(value)) {
    value = '';
  }
  value = ('' + value).substr(0, length);
  return value + constants.NULL_CHAR;
}

function formatTarNumber(value, length, defaultValue) {
  defaultValue = parseInt(defaultValue) || 0;
  length -= 1;  // preserve space for trailing null-char
  value = (parseInt(value) || defaultValue)
    .toString(8).substr(-length, length);
  while (value.length < length) {
    value = '0' + value;
  }
  return value + constants.NULL_CHAR;
}

function formatTarDateTime(value, length) {
  if (utils.isDateTime(value)) {
    value = Math.floor(1 * value / 1000);
  } else {
    value = parseInt(value, 10);
    if (isFinite(value)) {
      if (value <= 0) {
        return '';
      }
    } else {
      value = Math.floor(1 * new Date() / 1000);
    }
  }
  return formatTarNumber(value, length, 0);
}

function parseTarString(bytes, returnUnprocessed) {
  var result = String.fromCharCode.apply(null, bytes);
  if (returnUnprocessed) {
    return result;
  }
  var index = result.indexOf(constants.NULL_CHAR);
  return index >= 0 ? result.substr(0, index) : result;
}

function parseTarNumber(bytes) {
  var result = String.fromCharCode.apply(null, bytes);
  return parseInt(result.replace(/^0+$/g, ''), 8) || 0;
}

function parseTarDateTime(bytes) {
  if ((bytes.length == 0) || (bytes[0] == 0)) {
    return null;
  }
  return new Date(1000 * parseTarNumber(bytes));
}

function calculateChecksum(buffer, offset, skipChecksum) {
  var from = parseInt(offset, 10) || 0;
  var to = Math.min(from + effectiveHeaderSize, buffer.length);
  var result = 0;

  // When calculating checksum, `checksum` field should be
  // threat as filled with space char (byte 32)
  var skipFrom = 0;
  var skipTo = 0;
  if (skipChecksum) {
    posixHeader.every(function(field) {
      if (field[0] == 'checksum') {
        skipFrom = from + field[2];
        skipTo = skipFrom + field[1];
        return false;
      }
      return true;
    });
  }

  var whitespace = ' '.charCodeAt(0);
  for (var i = from; i < to; i++) {
    // 262144 = 8^6 - 6 octal digits - maximum possible value for checksum;
    // wrap to avoid numeric overflow
    var byte = (i >= skipFrom) && (i < skipTo) ? whitespace : buffer[i];
    result = (result + byte) % 262144;
  }
  return result;
}

module.exports.recordSize = recordSize;
module.exports.defaultFileMode = defaultFileMode;
module.exports.defaultUid = defaultUid;
module.exports.defaultGid = defaultGid;
module.exports.posixHeader = posixHeader;
module.exports.effectiveHeaderSize = effectiveHeaderSize;

module.exports.calculateChecksum = calculateChecksum;
module.exports.formatTarString = formatTarString;
module.exports.formatTarNumber = formatTarNumber;
module.exports.formatTarDateTime = formatTarDateTime;
module.exports.parseTarString = parseTarString;
module.exports.parseTarNumber = parseTarNumber;
module.exports.parseTarDateTime = parseTarDateTime;

