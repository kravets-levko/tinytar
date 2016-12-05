'use strict';

var recordSize = 512;
var NULL_CHAR = '\u0000';
var defaultFileMode = parseInt('777', 8);  // rwxrwxrwx
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
  // [<field name>, <size>, <offset>, <value format/retrieve function>]
  ['name', 100, 0, function(file, field) {
    return tarString(file[field[0]], field[1]);
  }],
  ['mode', 8, 100, function(file, field) {
    var mode = file[field[0]] || defaultFileMode;
    mode = mode & parseInt('777', 8);
    return tarNumber(mode, field[1], defaultFileMode);
  }],
  ['uid', 8, 108, function(file, field) {
    return tarNumber(file[field[0]], field[1], defaultUid);
  }],
  ['gid', 8, 116, function(file, field) {
    return tarNumber(file[field[0]], field[1], defaultGid);
  }],
  ['size', 12, 124, function(file, field) {
    return tarNumber(file.data.length, field[1]);
  }],
  ['modifyTime', 12, 136, function(file, field) {
    return tarNumber(file[field[0]], field[1], currentTime());
  }],
  ['checksum', 8, 148, function(file, field) {
    return '        ';  // placeholder
  }],
  ['type', 1, 156, function(file, field) {
    return '0';  // regular file
  }],
  ['linkName', 100, 157, function(file, field) {
    return '';  // only regular files are supported
  }],
  ['ustar', 8, 257, function(file, field) {
    return 'ustar' + NULL_CHAR + '  ';  // magic + version
  }],
  ['owner', 32, 265, function(file, field) {
    return tarString(file[field[0]], field[1]);
  }],
  ['group', 32, 297, function(file, field) {
    return tarString(file[field[0]], field[1]);
  }],
  ['majorNumber', 8, 329, function(file, field) {
    return '';  // only regular files are supported
  }],
  ['minorNumber', 8, 337, function(file, field) {
    return '';  // only regular files are supported
  }],
  ['prefix', 131, 345, function(file, field) {
    return tarString(file[field[0]], field[1]);
  }],
  ['accessTime', 12, 476, function(file, field) {
    return tarNumber(file[field[0]], field[1], currentTime());
  }],
  ['createTime', 12, 488, function(file, field) {
    return tarNumber(file[field[0]], field[1], currentTime());
  }]
];

function currentTime() {
  return Math.floor((new Date()).getTime() / 1000);
}

function tarString(value, length) {
  length -= 1;  // preserve space for trailing null-char
  if (typeof value == 'undefined') {
    value = '';
  }
  value = ('' + value).substr(0, length);
  return value + NULL_CHAR;
}

function tarNumber(value, length, defaultValue) {
  defaultValue = parseInt(defaultValue) || 0;
  length -= 1;  // preserve space for trailing null-char
  value = (parseInt(value) || defaultValue)
    .toString(8).substr(-length, length);
  while (value.length < length) {
    value = '0' + value;
  }
  return value + NULL_CHAR;
}

module.exports.recordSize = recordSize;
module.exports.NULL_CHAR = NULL_CHAR;
module.exports.defaultFileMode = defaultFileMode;
module.exports.defaultUid = defaultUid;
module.exports.defaultGid = defaultGid;
module.exports.posixHeader = posixHeader;

module.exports.currentTime = currentTime;
module.exports.tarString = tarString;
module.exports.tarNumber = tarNumber;

