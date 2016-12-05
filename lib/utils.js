'use strict';

var MAX_SAFE_INTEGER = 9007199254740991;

function isString(value) {
  return (typeof value == 'string') ||
    (Object.prototype.toString.call(value) == '[object String]');
}

function isObject(value) {
  return (value !== null) && (typeof value == 'object');
}

function isFunction(value) {
  return typeof value == 'function';
}

function isLength(value) {
  return (typeof value == 'number') &&
    (value > -1) && (value % 1 == 0) &&
    (value <= MAX_SAFE_INTEGER);
}

function isArray(value) {
  return Object.prototype.toString.call(value) == '[object Array]';
}

function isArrayLike(value) {
  return isObject(value) && !isFunction(value) && isLength(value.length);
}

function isArrayBuffer(value) {
  return Object.prototype.toString.call(value) == '[object ArrayBuffer]';
}

function map(array, iteratee) {
  return Array.prototype.map.call(array, iteratee);
}

function extend(target /* ...sources */) {
  return Object.assign.apply(null, arguments);
}

function toUint8Array(value) {
  var i;
  var length;
  var result;

  if (isString(value)) {
    length = value.length;
    result = new Uint8Array(length);
    for (i = 0; i < length; i++) {
      result[i] = value.charCodeAt(i) & 0xFF;
    }
    return result;
  }

  if (isArrayBuffer(value)) {
    return new Uint8Array(value);
  }

  if (isObject(value) && isArrayBuffer(value.buffer)) {
    return new Uint8Array(value.buffer);
  }

  if (isArrayLike(value)) {
    return new Uint8Array(value);
  }

  if (isObject(value) && isFunction(value.toString)) {
    return toUint8Array(value.toString());
  }

  return new Uint8Array();
}

module.exports.MAX_SAFE_INTEGER = MAX_SAFE_INTEGER;

module.exports.isString = isString;
module.exports.isObject = isObject;
module.exports.isFunction = isFunction;
module.exports.isArray = isArray;
module.exports.isArrayLike = isArrayLike;
module.exports.isArrayBuffer = isArrayBuffer;
module.exports.map = map;
module.exports.extend = extend;
module.exports.toUint8Array = toUint8Array;
