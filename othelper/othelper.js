void (function(factory){
    try{
        factory()
    }catch(e){
        alert('当前浏览器不支持，建议升级到最新版本chrome');
    }
})(function(){

    const delay = 500;
    const otLen = 11;
    const localKey = 'otData';

    const page = {
        'getOtData':'W03030200',//考勤查询,
        'fillOtData':'zzcOT'//加班申请
    };

    const url = {
        'fillOtData':'/Workflow/form/New-zzcOT'
    }

    const tbId = 'tbStaffDaily_tableData';//数据表格的id

    const tdKey = {
        'fnOT1':'fnOT1', //平时加班
        'fnOT2':'fnOT2', //周末加班
        'fnOT3':'fnOT3', //节假日加班
        'OTSwitchHours':'OTSwitchHours',//已经申请加班
        'GetRangeStartDate':'GetRangeStartDate',//上班时间
        'GetRangeEndDate':'GetRangeEndDate',//下班时间
        'DateFormat':'DateFormat', //加卡日期
        'prev':'DateFormat', //加卡日期
    };

    const tuple = {
        'prev':'[data-handler="prev"]',
        'SwitchType':'[data-bind*="SwitchType"]'
    }

    function sleep(time){
        return new Promise((resolve,reject)=>{
            setTimeout(resolve,time);
        });
    }

    function getTd(type){
        return `td[data-bind*="${tdKey[type]}"]`;
    }

    function getOtTd(type){
        var td = $(`#${tbId} ${getTd(type)}:not(:empty)`); //加班
        var applyTd = [];
        td.each((idx,item)=>{
            var $item  = $(item);
            if($item.siblings(getTd('OTSwitchHours')).html() == ''){
                applyTd.push($item); //todo:只用选择器把这个做了？
            }
        });
        return applyTd; //未申请的加班
    }

    function checklength(arr){
        if(arr.length > otLen){
            alert(`你太勤奋了，加班已经达到${arr.length}次，但是我们试过，一次性提交太多会失败，建议一次提交${otLen}个，等这次审批完之后再提交`);
            return arr.slice(0,11);
        }
        return arr;
    }

    //获得加班时间，考勤页面主函数 
    function getOtData(){
        var usualOt = getOtTd('fnOT1');
        var weekEndOt = getOtTd('fnOT2');
        weekEndOt = weekEndOt.concat(getOtTd('fnOT3'));3

        var usualOtArr = usualOt.map($td=>{
            return {
                DateFormat:$td.siblings(getTd('DateFormat')).text().match(/\d{4}-\d{2}-\d{2}/)[0],
                GetRangeStartDate:'21:00',
                GetRangeEndDate:$td.siblings(getTd('GetRangeEndDate')).text(),
                type:'fnOT1'
            }
        })

        var weekEndArr = weekEndOt.map($td=>{
            return {
                DateFormat:$td.siblings(getTd('DateFormat')).text().match(/\d{4}-\d{2}-\d{2}/)[0],
                GetRangeStartDate:$td.siblings(getTd('GetRangeStartDate')).text(),
                GetRangeEndDate:$td.siblings(getTd('GetRangeEndDate')).text(),
                type:'fnOT2'
            }
        })

        var r = usualOtArr.concat(weekEndArr);//周末要工资就不要加班工时了

        //检查加班申请的长度
        r = checklength(r);

        /*
            [{
                DateFormat:'加班日期',
                GetRangeStartDate:'打卡时间',
                GetRangeEndDate:'下班时间',
            }]
        */
        //side effect
        localStorage.setItem(localKey,JSON.stringify(r));    
        alert('已成功获取加班数据');
        location.assign(url['fillOtData']);
    }

    //填写加班申请，申请页主函数
    async function fillOtData(){
        var data = localStorage.getItem(localKey);
        console.log(data);
        data = JSON.parse(data);

        async function op(item,idx){
            //填写日期
            var d = new Date(item.DateFormat);
            var dataInput = $(`#Date${idx}`).val(item.DateFormat).trigger('blur').trigger('click');
            await sleep(delay);

            var str = `td[data-year=${d.getFullYear()}][data-month=${d.getMonth()}]:contains(${d.getDate()})`;

            let canler = $('.ui-datepicker-calendar').find(str);
            if(canler.length === 0){
                $(tuple['prev']).click(); //如果不是当前月，则往前一个月
                canler = $('.ui-datepicker-calendar').find(str);
            }
            canler.each(function(){
                var $item = $(this);
                if($item.text() === ''+d.getDate()){
                    $item.find('a').trigger('click');
                    console.log($item)
                }
            });
            await sleep(delay);

            //加班开始时间
            $(`#dvStart${idx}display`).val(item.GetRangeStartDate).trigger('blur');
            await sleep(delay);

            //加班结束时间
            $(`#dvEnd${idx}display`).val(item.GetRangeEndDate).trigger('blur');
            await sleep(delay);

            //加班转换[调休/工资]
            // if(item.type !== 'fnOT1'){
            //     $(`#dvEnd${idx}display`).closest('tr').find(tuple['SwitchType']).attr('disabled','').val(0).trigger('change');
            // }

            //原因
            if(idx === data.length - 1){
                $('input[data-bind*=Remark]').val('项目加班').trigger('change');
                $('a[data-bind*="$root.Add"]').click();
                await sleep(delay);
                $('[data-bind*="$root.Delete"]:last').click();
            }else{
                $('a[data-bind*="$root.Add"]').click();
            }
            await sleep(delay);
        }

        for(let i=0;i<data.length;i++){
            op(data[i],i);
            await sleep(delay*6);
        }

        //side effect
        $('#loadingDiv').hide();
        $(tuple['SwitchType']).css('border-color','red').removeAttr('disabled','');
        // localStorage.clear(localKey);

        if($('#hlp-tips').length === 0){
            $('.navbar.navbar-fixed-top').append('<span id="hlp-tips" style="color:red">温馨提醒：刚好21:30打卡下班的记录目前无法获取，请自己手动添加；周末加班是调休还是加班费，请联系您的主管确认</span>')
        }
        alert('请检查后提交加班申请');
    }

    //begin
    var { href } = location;
    if(href.indexOf(page.getOtData) > 0){
        getOtData();
    }else{
        fillOtData();
    }

})