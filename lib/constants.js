'use strict';

var NULL_CHAR = '\u0000';

module.exports = {
  /* eslint-disable key-spacing */

  NULL_CHAR: NULL_CHAR,

  TMAGIC: 'ustar' + NULL_CHAR + '00',   // 'ustar', NULL, '00'
  OLDGNU_MAGIC: 'ustar  ' + NULL_CHAR,  // 'ustar  ', NULL

  // Values used in typeflag field.
  REGTYPE:  0,  // regular file
  LNKTYPE:  1,  // link
  SYMTYPE:  2,  // reserved
  CHRTYPE:  3,  // character special
  BLKTYPE:  4,  // block special
  DIRTYPE:  5,  // directory
  FIFOTYPE: 6,  // FIFO special
  CONTTYPE: 7,  // reserved

  // Bits used in the mode field, values in octal.
  TSUID: parseInt('4000', 8),  // set UID on execution
  TSGID: parseInt('2000', 8),  // set GID on execution
  TSVTX: parseInt('1000', 8),  // reserved

  // file permissions
  TUREAD:  parseInt('0400', 8),  // read by owner
  TUWRITE: parseInt('0200', 8),  // write by owner
  TUEXEC:  parseInt('0100', 8),  // execute/search by owner
  TGREAD:  parseInt('0040', 8),  // read by group
  TGWRITE: parseInt('0020', 8),  // write by group
  TGEXEC:  parseInt('0010', 8),  // execute/search by group
  TOREAD:  parseInt('0004', 8),  // read by other
  TOWRITE: parseInt('0002', 8),  // write by other
  TOEXEC:  parseInt('0001', 8),   // execute/search by other

  TPERMALL:  parseInt('0777', 8),   // rwxrwxrwx
  TPERMMASK: parseInt('0777', 8)    // permissions bitmask

  /* eslint-enable key-spacing */
};
