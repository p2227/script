void (function (factory) {
    try{
        factory()
    }catch(e){
        alert('当前浏览器不支持，建议升级到最新版本chrome');
    }
})(function () {

    const __DEV__ = localStorage.getItem('__DEV__') === '1';
    const delay = location.hostname === 'gzehr.zuzuche.cn' ? 850 : 650;
    const otLen = 11;
    const localKey = 'otData';

    const page = {
        'getOtData': 'W03030200',//考勤查询,
        'fillOtData': 'zzcOT'//加班申请
    };

    const url = {
        'fillOtData': '/Workflow/form/New-zzcOT'
    }

    const tbId = 'tbStaffDaily';//数据表格的id

    const tdKey = {
        'fnOT1': 'fnOT1', //平时加班
        'fnOT2': 'fnOT2', //周末加班
        'fnOT3': 'fnOT3', //节假日加班
        'OTSwitchHours': __DEV__ ? 'fnOT3' : 'OTSwitchHours',//已经申请加班
        'GetRangeStartDate': 'GetRangeStartDate',//上班时间
        'GetRangeEndDate': 'GetRangeEndDate',//下班时间
        'DateFormat': 'DateFormat', //打卡日期
    };

    const tuple = {
        'prev': '[data-handler="prev"]',
        'SwitchType': '[data-bind*="SwitchType"]'
    }

    function sleep(time) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, time);
        });
    }

    function getTd(type) {
        return `td[data-bind*="${tdKey[type] || type}"]`;
    }

    function getOtTd(type) {
        var td = $(`#${tbId} ${getTd(type)}:not(:empty)`); //加班
        var applyTd = [];
        td.each((idx, item) => {
            var $item = $(item);
            if ($item.siblings(getTd('OTSwitchHours')).html() == '') {
                applyTd.push($item); //todo:只用选择器把这个做了？
            }
        });
        return applyTd; //未申请的加班
    }

    function checklength(arr) {
        if (arr.length > otLen) {
            alert(`你太勤奋了，加班已经达到${arr.length}次，但是我们试过，一次性提交太多会失败，建议一次提交${otLen}个，等这次审批完之后再提交`);
            return arr.slice(0, 11);
        }
        return arr;
    }

    //获取平时加班的数据，针对21：30的情况特殊处理
    function getOT1() {
        var usualOt = getOtTd('fnOT1');
        var RangeEnd = $(`#${tbId} ${getTd('GetRangeEndDate')}`);
        var r = [];
        RangeEnd.each((idx, item) => {
            var $item = $(item);
            if (
                $item.text() === '21:30'
                && $item.siblings(getTd('fnOT1')).text() === ''
                && $item.siblings(getTd('GetShiftName')).text() === '正常行政班'
                && $item.siblings(getTd('OTSwitchHours')).html() == ''
            ) {
                r.push($item.siblings(getTd('fnOT1')));
            }
        })
        return usualOt.concat(r);
    }

    //获得加班时间，考勤页面主函数 
    function getOtData() {
        var usualOt = getOT1();
        var weekEndOt = getOtTd('fnOT2');
        weekEndOt = weekEndOt.concat(getOtTd('fnOT3'));

        var usualOtArr = usualOt.map($td => {
            return {
                DateFormat: $td.siblings(getTd('DateFormat')).text().match(/\d{4}-\d{2}-\d{2}/)[0],
                GetRangeStartDate: '21:00',
                GetRangeEndDate: $td.siblings(getTd('GetRangeEndDate')).text(),
                type: 'fnOT1'
            }
        })

        var weekEndArr = weekEndOt.map($td => {
            return {
                DateFormat: $td.siblings(getTd('DateFormat')).text().match(/\d{4}-\d{2}-\d{2}/)[0],
                GetRangeStartDate: $td.siblings(getTd('GetRangeStartDate')).text(),
                GetRangeEndDate: $td.siblings(getTd('GetRangeEndDate')).text(),
                type: 'fnOT2'
            }
        })

        var r = usualOtArr//.concat(weekEndArr); //20171126不填写周末加班了。

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
        if (r.length > 0) {
            localStorage.setItem(localKey, JSON.stringify(r));
            alert('已成功获取加班数据');
            __DEV__ || location.assign(url['fillOtData']);
        } else {
            alert(`没检测到你的加班信息，是不是要查询上一个月加班？`);
            $('#dvStartDate,#dvEndDate').css({ 'border-color': 'red' });
        }
    }

    //填写加班申请，申请页主函数
    async function fillOtData() {
        __DEV__ && ($('[data-bind*="$root.Delete"]:gt(0)').click(), await sleep(delay))

        var data = localStorage.getItem(localKey);
        __DEV__ && console.log(data);
        data = JSON.parse(data);

        async function op(item, idx) {
            //是否有吃饭时间
            $(`select.form-controlText[data-bind*=OTMealMinutes]`).val(0).trigger('change');
            await sleep(delay);
            
            //填写日期
            var d = new Date(item.DateFormat);
            var dataInput = $(`#Date${idx}`).val(item.DateFormat).trigger('blur').trigger('click');
            await sleep(delay);

            var str = `td[data-year=${d.getFullYear()}][data-month=${d.getMonth()}]:contains(${d.getDate()})`;

            let canler = $('.ui-datepicker-calendar').find(str);
            if (canler.length === 0) {
                $(tuple['prev']).click(); //如果不是当前月，则往前一个月
                canler = $('.ui-datepicker-calendar').find(str);
            }
            canler.each(function () {
                var $item = $(this);
                if ($item.text() === '' + d.getDate()) {
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

            let GetRangeEndDateNum = +item.GetRangeEndDate.slice(0, 2);
            if (item.type === 'fnOT1' && GetRangeEndDateNum < 21) { //工作日 加班到次日
                $(`#dvEnd${idx}display`).siblings('.k-dropdown').click();
                await sleep(0);
                $(`.k-animation-container #dvEnd${idx}popup_listbox`).last().find('li:eq(1)').click();
                await sleep(delay);
            }
            //加班转换[调休/工资]
            // if(item.type !== 'fnOT1'){
            //     $(`#dvEnd${idx}display`).closest('tr').find(tuple['SwitchType']).attr('disabled','').val(0).trigger('change');
            // }

            //原因
            if (idx === data.length - 1) {
                $('input[data-bind*=Remark]').val('项目加班').trigger('change');
                $('a[data-bind*="$root.Add"]').click();
                await sleep(delay);
                $('[data-bind*="$root.Delete"]:last').click();
            } else {
                $('a[data-bind*="$root.Add"]').click();
            }
            await sleep(delay);
        }

        for (let i = 0; i < data.length; i++) {
            op(data[i], i);
            await sleep(delay * 6);
        }

        //side effect
        $('#loadingDiv').hide();
        __DEV__ || localStorage.removeItem(localKey);

        await sleep(delay);
        $('#hlp-tips').remove();
        $('.navbar-fixed-top').append(`<span id="hlp-tips" style="color:red;position: relative;left: -400px;">1.请检查后提交，尤其是吃饭时间。 2.str_StartEndTimeRequired 是因为网速太慢，以至于吃饭时间选择不了 3.加班助手网址已经迁移到<a target="_blank" href="//sp.easyrentcars.com/othelper/index.html">这里</a>了，支付内外网填写，赶紧升级吧。</span>`);
        $(tuple['SwitchType']).css('border-color', 'red').removeAttr('disabled', '');
    }

    //begin
    var { href } = location;
    if (href.indexOf(page.getOtData) > 0) {
        getOtData();
    } else {
        // __DEV__ && eval(window.ChangeTime.toString().replace(/\bdebugger;/g,''));
        fillOtData();
    }
})