/*
 * a script to login http://gold.xitu.io/ , input your username,password and run it in snippet
 */
void function(){
    const username = 'your username';
    const password = 'your password';

    document.querySelector('.login-button').click();

    function processDom(selector,value,e){
        const u = document.querySelector(selector);
        u.value = value;
        u.dispatchEvent(e);
    }

    setTimeout(()=>{
        const e = new Event('input');        

        processDom("[name=emailOrPhone]",username,e);
        processDom("[name=password]",password,e);

        document.querySelector(".welcome-large-btn").click();
    },200);    
}();
