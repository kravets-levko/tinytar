# Tiny TAR

This library provides a simple way to create POSIX TAR files. 
Library has no additional dependencies and will work both 
on a server-side and in a browser.

More info about TAR format can be found 
[here](http://www.gnu.org/software/tar/manual/html_node/Standard.html)

## Install

Use `npm install tinytar` to install library.
 
## Usage

Add `dist/tinytar.js` or `dist/tinytar.min.js` to your html page and use
global `tinyTar` variable to access library API.

To use this library in CommonJS style use `require`:
```javascript
var tinytar = require('tinytar');
```

### Creating archive

Use `require('tinytar').tar` function. It accepts an array with objects; each
object describes a single file. Objects properties are directly mapped to
TAR header fields ([see here](lib/types.js)). Property `data` may contain
data for a file (if omitted - empty file will be added). Library supports 
almost everything that can contain data: strings, any array-like objects (
including built-in `Array` and all typed arrays of course), `ArrayBuffer` and
Node.js `Buffer` objects. Be careful: characters from string and values 
from `Array` will be clamped and only low byte will be used; 
typed arrays and `ArrayBuffer` will be saved properly.
  
Function returns `Uint8Array` with TAR data which can be saved or used 
somehow else.
  
For examples, see `examples` folder.  

### .tar.gz

This library works great with `pako`: together they can 
create `.tar.gz` archives:

```javascript
var tar = require('tinytar').tar;
var gzip = require('pako').gzip;

var gzipped = gzip(tar([
  /* ... file objects */
]));
```
