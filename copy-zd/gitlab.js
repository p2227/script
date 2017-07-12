(function(d){
    let list = $('#commits-list .commit');
    let r = [];
    list.each((key,item)=>{
        let title = $('.item-title',item).text();
        if (['打包', 'ignore', 'Merge branch'].indexOf(title) > -1) {
            return ;
        }
        let auther = $('.commit-author-link',item).text();
        if(auther === 'despair'){
            auther = '强哥'
        }
        if(auther === 'hm'){
            return ;
        }
        r.push({title,auther});
    });

    var str = r.map(item=>`${item.title} -- ${item.auther}\n`).join('');

    var t = d.createElement('textarea');
    t.value = str;
    d.body.appendChild(t);
    t.select();
    d.execCommand('copy');
    t.remove(t);
})(document);