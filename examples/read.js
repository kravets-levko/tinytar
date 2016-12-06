'use strict';

var fs = require('fs');
var untar = require('../index').untar;
// var ungzip = require('pako').ungzip;

// var data = fs.readFileSync(__dirname + '/test2.tar.gz');
// data = ungzip(data);
// fs.writeFileSync(__dirname + '/test2.tar', new Buffer(data));

var data = fs.readFileSync(__dirname + '/test2.tar');
data = untar(data);
data.forEach(function(file) {
  file.data = Object.prototype.toString.call(file.data);
  console.log(file);
});
