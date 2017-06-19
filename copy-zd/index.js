(function(d){
    let h = d.querySelector('.heading');
    let i = d.createElement('input');
    d.body.appendChild(i);
    i.value = `fixed #${h.innerText}`;
    i.select();
    var r = d.execCommand('copy',true);
    console.log(r);
    i.remove(i);
})(document);