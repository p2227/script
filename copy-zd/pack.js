var fs = require('fs');
const butternut = require('butternut');

var result = butternut.squash(fs.readFileSync('./index.js',{ encoding: 'utf8' }));


var fav = fs.readFileSync('index.tpl.html',{ encoding: 'utf8' }).replace(/{{script}}/,result.code);
fs.writeFileSync('index.html',fav);