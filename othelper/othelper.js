void function(factory){
    try{
        factory()
    }catch(e){
        alert('当前浏览器不支持，建议升级到最新版本chrome');
    }
}(function(){

    const delay = 500;
    const localKey = 'otData';

    const page = {
        'getOtData':'W03030200',//考勤查询,
        'fillOtData':'zzcOT'//加班申请
    };

    const tbId = 'tbStaffDaily_tableData';//数据表格的id

    const tdKey = {
        'fnOT1':'fnOT1', //平时加班
        'fnOT2':'fnOT2', //周末加班
        'fnOT3':'fnOT3', //节假日加班
        'OTSwitchHours':'OTSwitchHours',//已经申请加班
        'GetRangeStartDate':'GetRangeStartDate',//上班时间
        'GetRangeEndDate':'GetRangeEndDate',//下班时间
        'DateFormat':'DateFormat' //加卡日期
    };

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

    //获得加班时间，考勤页面主函数 
    function getOtData(){
        var usualOt = getOtTd('fnOT1');
        var weekEndOt = getOtTd('fnOT2');
        weekEndOt = weekEndOt.concat(getOtTd('fnOT3'));

        var usualOtArr = usualOt.map($td=>{
            return {
                DateFormat:$td.siblings(getTd('DateFormat')).text().match(/\d{4}-\d{2}-\d{2}/)[0],
                GetRangeStartDate:'21:00',
                GetRangeEndDate:$td.siblings(getTd('GetRangeEndDate')).text(),
            }
        })

        var weekEndArr = weekEndOt.map($td=>{
            return {
                DateFormat:$td.siblings(getTd('DateFormat')).text().match(/\d{4}-\d{2}-\d{2}/)[0],
                GetRangeStartDate:$td.siblings(getTd('GetRangeStartDate')).text(),
                GetRangeEndDate:$td.siblings(getTd('GetRangeEndDate')).text(),
            }
        })

        var r = usualOtArr.concat(weekEndArr)   

        /*
            [{
                DateFormat:'加班日期',
                GetRangeStartDate:'打卡时间',
                GetRangeEndDate:'下班时间',
            }]
        */
        localStorage.setItem(localKey,JSON.stringify(r));    
        alert('已成功获取加班数据');
    }

    //填写加班申请，申请页主函数
    async function fillOtData(){
        var data = localStorage.getItem(localKey);
        console.log(data);
        data = JSON.parse(data);

        async function op(item,idx){
            var d = new Date(item.DateFormat);
            var dataInput = $(`#Date${idx}`).val(item.DateFormat).trigger('blur').trigger('click');
            await sleep(delay);

            var str = `td[data-year=${d.getFullYear()}][data-month=${d.getMonth()}]:contains(${d.getDate()})`;
            $('.ui-datepicker-calendar').find(str).each(function(){
                var $item = $(this);
                if($item.text() === ''+d.getDate()){
                    $item.find('a').trigger('click');
                    console.log($item)
                }
            });
            await sleep(delay);

            $(`#dvStart${idx}display`).val(item.GetRangeStartDate).trigger('blur');
            await sleep(delay);

            $(`#dvEnd${idx}display`).val(item.GetRangeEndDate).trigger('blur');
            await sleep(delay);

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

        localStorage.clear(localKey);
        alert('请检查后提交加班申请');
    }

    (function init(){
        var { href } = location;
        if(href.indexOf(page.getOtData) > 0){
            getOtData();
        }else{
            fillOtData();
        }
    })()

})
