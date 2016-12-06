'use strict';

var fs = require('fs');
var tar = require('../index').tar;
// var gzip = require('pako').gzip;

var data = tar([
  {
    name: 'dir/test.txt',
    data: 'Hello, world!',
    modifyTime: new Date(0)
  },
  {
    name: 'test.json',
    modifyTime: 60,
    data: JSON.stringify({
      title: 'test file',
      author: 'Levko Kravets'
    }),
    prefix: 'dir'
  },
  {
    name: 'a.txt',
    modifyTime: 0,
    data: {  // 'Hello'
      0: 72,
      1: 101,
      2: 108,
      3: 108,
      4: 111,
      length: 5
    }
  },
  {
    name: 'long.txt',
    data: (function() {
      var result = '';
      for (var i = 0; i < 3000; i++) {
        result += 'abcdefg'.charAt(i % 7);
      }
      return result;
    })()
  },
  {
    name: 'b.txt',
    data: new Uint16Array([101 * 256 + 72, 111 * 256 + 108])  // 'Helo'
  }
]);

fs.writeFileSync(__dirname + '/test3.tar', new Buffer(data));