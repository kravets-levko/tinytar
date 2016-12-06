'use strict';

// http://www.gnu.org/software/tar/manual/html_node/Standard.html

var utils = require('./lib/utils');
var constants = require('./lib/constants');
var tar = require('./lib/tar');
var untar = require('./lib/untar');

utils.extend(module.exports, tar, untar, constants);
