const fs = require('fs');
const butternut = require('butternut');
let fsConf = { encoding: 'utf8' };

let tuple = [{file:'./index.js', tmpl: /{{script}}/},{file:'./gitlab.js', tmpl: /{{gitlab}}/}]
let fav = fs.readFileSync('index.tpl.html',fsConf);

tuple.forEach(item=>{
    fav = fav.replace(item.tmpl,function(){
        let result = butternut.squash(fs.readFileSync(item.file, fsConf));
        return result.code;
    });
})

fs.writeFileSync('index.html',fav);