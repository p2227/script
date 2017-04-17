/*
 * a script to login http://gold.xitu.io/ , input your username,password and run it in snippet
 */
void function(){
    const username = 'your username';
    const password = 'your password';

    document.querySelector('.login').click();

    function processDom(selector,value,e){
        const u = document.querySelector(selector);
        u.value = value;
        u.dispatchEvent(e);
    }

    setTimeout(()=>{
        const e = new Event('input');        

        processDom("[name=loginPhoneOrEmail]",username,e);
        processDom("[name=loginPassword]",password,e);

        document.querySelector(".panel>.btn").click();
    },200);    
}();
