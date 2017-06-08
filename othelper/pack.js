var fs = require('fs');
var fileName = 'othelper.min.js';

const sourceCode = fs.readFileSync('./othelper.js').toString();
const butternut = require('butternut');
const { code, map } = butternut.squash(sourceCode);


fs.writeFileSync(`./${fileName}`,code);

var url = `http://gh.p2227.com/script/othelper/${fileName}`;

var result = butternut.squash(`
    (function(d){
        var elem = d.createElement('script');
        elem.src = '${url}?'+Math.random().toString(36).slice(4,7);
        elem.async = true;
        d.head.appendChild(elem);
    })(document);
`);


var fav = fs.readFileSync('index.tpl.html',{ encoding: 'utf8' }).replace(/{{script}}/,result.code);
fs.writeFileSync('index.html',fav);