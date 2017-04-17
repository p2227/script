var fs = require('fs');
var fileName = 'othelper.min.js';

var UglifyJS = require("uglify-js");

// var result = UglifyJS.minify("src/index.js");
// fs.writeFileSync('dist/ophelper.min.js',result.code);

// uglify 暂时不支持 async await 
fs.createReadStream('othelper.js').pipe(fs.createWriteStream(fileName));

var url = `http://gh.p2227.com/script/othelper/${fileName}`;

var result = UglifyJS.minify(`
    (function(d){
        var elem = d.createElement('script');
        elem.src = '${url}?'+Math.random().toString(36).slice(4,7);
        elem.async = true;
        d.head.appendChild(elem);
    })(document);
`,{
    fromString:true
});


var fav = fs.readFileSync('index.tpl.html',{ encoding: 'utf8' }).replace(/{{script}}/,result.code);
fs.writeFileSync('index.html',fav);