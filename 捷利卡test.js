//-----------------------------------------------------------------設定基本資料
//var url = 'http://211.72.231.7:7010/VipappService/ServiceVipApp.asmx'
var sale_begindate = '20200818'
var sale_enddate = '20300818'
var dash_location = 2
car_no = car_no.replace("-", "")
//---------------------------------取得品項
var prod_list = FR.remoteEvaluate('=SQL("' + db_name + '","SELECT t2.prod_id FROM ProdCategory t1 join ProdDetailInfo t2 on t1.category_id = t2.category_id where is_show = 1",1)').toString().split(',')
if (prod_list[0].length == 0) {
    prod_list = (1).toString().split(',')
}




//-----------------------------------------------------------------取得今天日期
var today = new Date();
var mm = today.getMonth() + 1; // getMonth() is zero-based
var dd = today.getDate();
var yyyy = today.getFullYear()

if (mm <= 9) {
    mm = "0" + mm
}
if (dd <= 9) {
    dd = "0" + dd
}

today = yyyy + "-" + mm + "-" + dd


// setTimeout(( () => {
//     ping(cam_ip, function(status, e) {
//         if(status == "timeout"){

//             //alert(cam_ip+" 攝像頭異常！請檢查後重新整理！")
//         }else{
//             main()
//         }
//     })

// } ), 500);


main()

//-----------------------------------------------------------------換車





function main() {
    if (manual == 0) {
        ping(cam_ip, function (status, e) {
            if (status == "timeout") {
                _g().setCellValue("C2", null, cam_ip + "-鏡頭異常！")
                $('td[id^=C2-0-0]').css('color', '#FF0000');
                clearInterval(window.timeoutID)
                window.timeoutID = setTimeout((() => {
                    main()
                }), 10000);
            } else {
                clearInterval(window.timer)
                var get_cam_info = FR.remoteEvaluate('API_GET("http://' + cam_ip + '/get_search_info?select=log&limit=1","' + account + '","' + password + '")')

                if (get_cam_info == "ERROR") {
                    clearInterval(window.timeoutID)
                    window.timeoutID = setTimeout((() => {
                        main()
                    }), 10000);
                    return
                }
                _g().setCellValue("C2", null, seq)
                $('td[id^=C2-0-0]').css('color', '#000000');

                //var get_cam_info = "{\"LPR_COUNT\": 1,\"INFORMATION\": [{\"INDEX\":1,\"TS\":\"1635131787041227\",\"MOD_TS\":\"2021-10-25 11:16:27 GMT\",\"CAR_ID\":\"97899\",\"LPR\":\"RCM3692\",\"RTIME\":\"363.0\",\"ACTION\":\"0\",\"ACT_PARAM\":\"Visitor\",\"THRESHOLD\":\"0.788941383361816\",\"ROI_X\":\"19\",\"ROI_Y\":\"10\",\"ROI_W\":\"1881\",\"ROI_H\":\"1059\",\"LP_X\":\"1395\",\"LP_Y\":\"464\",\"LP_W\":\"109\",\"LP_H\":\"68\",\"LP_BMP\":\"LPR_IMAGE/20211025111627_41243lp_RCM3692_1013144.png\",\"ROI_BMP\":\"\",\"COUNTRY\":\"TWN\",\"LPR_USER\":\"\",\"LPR_PHONE\":\"\",\"LPR_ADDRESS\":\"\",\"LPR_PAYSTATUS\":\"\",\"LPR_EXIST\":\"\",\"LPR_SCHEDULE_S\":\"\",\"LPR_SCHEDULE_E\":\"\",\"LPR_OTHER\":\"\",\"LPR_DETECT_ENDTIME\":\"\"}],\"LIST_TYPE\": \"log\"}"
                var send_msg = get_cam_info.substring(0, get_cam_info.length - 1);
                send_msg += ",\"island\":\"" + island + "\",\"island_face\":\"" + seq + "\"}";
                window.send_msg_record = send_msg

                get_cam_info = JSON.parse(get_cam_info)

                if (parseFloat(get_cam_info.INFORMATION[0].THRESHOLD) >= 0.7) {


                    if (parseInt(get_cam_info.INFORMATION[0].LP_X, 10) <= 940 && parseInt(get_cam_info.INFORMATION[0].LP_Y, 10) >= (906 * y_percent / 100) && (seq == 1 || seq == 4 || seq == 5) && car_no != get_cam_info.INFORMATION[0].LPR) {
                        //console.log(get_cam_info.INFORMATION[0].LPR + "-Left")
                        car_no = get_cam_info.INFORMATION[0].LPR
                        send_to_pos(island, send_msg)


                    }
                    else if (parseInt(get_cam_info.INFORMATION[0].LP_X, 10) > 940 && parseInt(get_cam_info.INFORMATION[0].LP_Y, 10) >= (906 * y_percent / 100) && (seq == 2 || seq == 3 || seq == 6) && car_no != get_cam_info.INFORMATION[0].LPR) {


                        //console.log(get_cam_info.INFORMATION[0].LPR + "-Right")
                        car_no = get_cam_info.INFORMATION[0].LPR
                        send_to_pos(island, send_msg)
                        //change_car()


                    }

                }
                clearInterval(window.timeoutID)
                window.timeoutID = setTimeout((() => {
                    main()
                }), 500);
            }
        })

    }
    else {
        var timer1 = window.setTimeout((() => {
            var url = window.location.href;
            if (url.indexOf('P_MANUAL') > -1) {
                url = url.substring(0, url.indexOf('P_MANUAL') - 1)

            }
            url += '&P_MANUAL=0'
            window.location.href = url;
            //alert(url)

        }), 1000 * 600);
        setTimeout(function () {
            let ws = new WebSocket("ws://" + ip + ":" + port + "/webroot/msg_center")
            ws.onopen = () => {
                msg = {
                    type: "register",
                    topic: island + "_OK"
                }

                ws.send(JSON.stringify(msg))
                //ws.send("register-msg_center_emp")

            }
            ws.onmessage = event => {
                if (event.data == seq) {
                    var url = window.location.href;
                    if (url.indexOf('P_MANUAL') > -1) {
                        url = url.substring(0, url.indexOf('P_MANUAL') - 1)

                    }
                    url += '&P_MANUAL=0'
                    //alert(url)
                    window.location.href = url;
                }
            }

        }, 50)
    }
}

//-----------------------------------------------------------------模擬換車
/*
var time = getRandomInt(20,40)
var timeoutID = window.setTimeout(( () => {
    var car_no_random = getRandomInt(0,5)
    //alert(car_no_random)
    if(car_no_random == 0){
        car_no = 'DEF9999'
    }
    else if(car_no_random == 1){
        car_no = 'ABC8888'
    }
    else if(car_no_random == 2){
        car_no = 'DEF8888'
    }
    else if(car_no_random == 3){
        car_no = 'GHI8888'
    }
    else if(car_no_random == 4){
        car_no = 'ABC1111'
    }
    var url = window.location.href;  
    if (url.indexOf('car_no') > -1){
        url = url.substring(0,url.indexOf('car_no')-1)

    }
    url += '&car_no=' + car_no
    
    

    window.location.href = url;
} ), time*1000);

*/

//alert(car_no.substring(0,dash_location)+"-"+car_no.substring(dash_location,car_no.length))
//-----------------------------------------------------------------呼叫ＡＰＩ並進行前端更新

API(url, car_no, sale_begindate, sale_enddate, prod_list)
function API(url, car_no, sale_begindate, sale_enddate, prod_list) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', url, true);
    var sr =
        '<?xml version="1.0" encoding="utf-8"?>' +
        '<soap:Envelope ' +
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
        'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        '<SearchVipCar xmlns="http://tempuri.org/">' +
        ' <car_no>' + car_no.substring(0, dash_location) + "-" + car_no.substring(dash_location, car_no.length) + '</car_no> ' +
        ' <sale_begindate>' + sale_begindate + '</sale_begindate>' +
        ' <sale_enddate>' + sale_enddate + '</sale_enddate>' +
        ' <prod_list>'

    for (var i = 0; i < prod_list.length; i++) {
        sr += '  <string>' + prod_list[i].toString() + '</string>'
    }

    sr += '</prod_list>' +
        '</SearchVipCar>' +
        '</soap:Body>' +
        '</soap:Envelope>';

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {

                var result = xmlhttp.responseText
                result = result.substring(288, result.length - 72)

                result = JSON.parse(result)
                //-----------------------------------------------------------------呼叫函示進行更新前端
                refresh(result)

            }
        }
    }

    xmlhttp.setRequestHeader('Content-Type', 'text/xml;charset=utf-8');

    xmlhttp.send(sr);
}

function refresh(data) {

    //-----------------------------------------------------------------判斷是哪種會員，隱藏掉ＱＲ＿ＣＯＤＥ或隱藏掉普通文字匡

    let car_no_replace = filter(car_no);

    //----------禮遇卡折扣
    let courtesy_discount = FR.remoteEvaluate('=SQL("' + db_name + '","select discount from courtesy_carlist where REPLACE( car_no, \'-\' , \'\' ) = \'' + car_no_replace + '\' and start_date <= date(now()) and end_date >= date(now())",1,1)');
    console.log('禮遇卡折扣: ' + courtesy_discount);

    //----------簽帳客戶統編
    let subcustcar_uid = FR.remoteEvaluate('=SQL("local_mysql","SELECT p.CustId FROM st_oil_credit_car c join st_oil_credit_parent p on c.ParentId = p.id where c.status = 1 and REPLACE( c.carNo, \'-\' , \'\' ) = \'' + car_no_replace + '\'",1,1)');
    console.log('簽帳客戶統編: ' + subcustcar_uid);
    //----------簽帳客戶名稱
    let subcustcar_name = FR.remoteEvaluate('=SQL("local_mysql","SELECT p.shortname FROM st_oil_credit_car c join st_oil_credit_parent p on c.ParentId = p.id where c.status = 1 and REPLACE( c.carNo, \'-\' , \'\' ) = \'' + car_no_replace + '\'",1,1)');
    console.log('簽帳客戶名稱: ' + subcustcar_name);
    //----------簽帳客戶餘額
    let subcustcar_amt = FR.remoteEvaluate('=SQL("finereport_data","SELECT amt FROM finereport_data.charge_realquota where uid = \'' + subcustcar_uid + '\' ",1,1)');
    console.log('簽帳客戶餘額: ' + subcustcar_amt);
    // SELECT p.CustId FROM st_oil_credit_car c join st_oil_credit_parent p on c.ParentId = p.id where c.status = 1 and REPLACE( c.carNo, \'-\' , \'\' ) = \'' + car_no_replace + '\'

    //----------簽帳現銷車號
    let cash_car = FR.remoteEvaluate('=SQL("local_mysql","SELECT carno FROM oil.st_oil_credit_cash_car where status = 1 and REPLACE( carno, \'-\' , \'\' ) = \'' + car_no_replace + '\'",1,1)');


    if (courtesy_discount != '') {
        _g().setCellValue("C8", null, "禮遇卡")
        _g().setCellValue("C7", null, iccardno + car_no)

        if (_g().getWidgetByName("delete_qr") != null) {
            _g().getWidgetByName("delete_qr").fireEvent("click")
            _g().getWidgetByName("delete_qr").setEnable(false)
            return
        }
    } else if (subcustcar_uid != '') {
        _g().setCellValue("C4", null, subcustcar_uid);
        _g().setCellValue("C5", null, subcustcar_name);
        _g().setCellValue("C8", null, "簽帳客戶");
        _g().setCellValue("C7", null, "$" + subcustcar_amt);

        $('td[id^=C3-0-0]').css('color', '#FF0000');
        $('td[id^=C5-0-0]').css('color', '#FF0000');
        $('td[id^=C6-0-0]').css('color', '#FF0000');
        $('td[id^=C7-0-0]').css('color', '#FF0000');
        $('td[id^=C8-0-0]').css('color', '#FF0000');
        //var timeoutID = window.setTimeout(( () => {
        //_g().setCellValue("E1",null,1)

        //} ), 1000);
        if (_g().getWidgetByName("delete_qr") != null) {
            _g().getWidgetByName("delete_qr").fireEvent("click")
            _g().getWidgetByName("delete_qr").setEnable(false)
            return
        }
    } else if (cash_car != '') {
        _g().setCellValue("C8", null, "簽帳現銷")
        _g().setCellValue("C7", null, cash_car)
        $('td[id^=C3-0-0]').css('color', '#004B97');
        $('td[id^=C5-0-0]').css('color', '#004B97');
        $('td[id^=C6-0-0]').css('color', '#004B97');
        $('td[id^=C7-0-0]').css('color', '#004B97');
        $('td[id^=C8-0-0]').css('color', '#004B97');

        if (_g().getWidgetByName("delete_qr") != null) {
            _g().getWidgetByName("delete_qr").fireEvent("click")
            _g().getWidgetByName("delete_qr").setEnable(false)
            return

        }
    } else {
        // let last_point = '';
        _g().setCellValue("C8", null, "會員")
        // _g().setCellValue("C7", null, last_point + "點")

        if (_g().getWidgetByName("delete_qr") != null) {
            _g().getWidgetByName("delete_qr").fireEvent("click")
            _g().getWidgetByName("delete_qr").setEnable(false)
            return

        }
    };
    var retCode = data.objStatus.retCode
    var retMsg = data.objStatus.retMsg
    //-----------------------------------------------------------------判斷是否有此車牌
    if (retCode == -1) {
        //------------------------------------無此車牌，遞迴
        //------------------------------------遞迴找尋車牌的 “-” 位置
        if (dash_location < 4) {
            dash_location += 1
            //alert(car_no.substring(0,dash_location)+"-"+car_no.substring(dash_location,car_no.length))
            API(url, car_no, sale_begindate, sale_enddate, prod_list)
            return
        }
        //------------------------------------無此車牌，進行無車牌的前端設定
        else {
            if (_g().getWidgetByName("delete_qr") != null) {
                _g().getWidgetByName("delete_qr").fireEvent("click")
                _g().getWidgetByName("delete_qr").setEnable(false)
            }

            _g().setCellValue("C3", null, car_no)
            var cate_id = FR.remoteEvaluate('=SQL("' + db_name + '","SELECT t1.category_id FROM ProdCategory t1  where is_show=1 limit 6",1)')
            for (var i = 0; i < cate_id.length; i++) {
                _g().setCellValue("C" + (11 + i).toString(), null, cate_id[i])
                _g().getWidgetByCell("D" + (11 + i).toString()).setVisible(true)
            }
            return
        }
    }







    //-----------------------------------------------------------------抽取ＡＰＩ吐回的資料

    var vip_id = data.vipInfo.vip_id
    var name = data.vipInfo.name
    var zip = data.vipInfo.zip
    var address = data.vipInfo.address
    var telephone = data.vipInfo.telephone
    var sex = data.vipInfo.sex.toString()
    var birthday = data.vipInfo.birthday
    var email = data.vipInfo.email
    var mobile = data.vipInfo.mobile
    var last_point = data.vipInfo.last_point
    var last_amt = data.vipInfo.last_amt
    var vip_level = data.vipInfo.vip_level
    var vip_level_name = data.vipInfo.vip_level_name
    var end_date = data.vipInfo.end_date
    var id_card = data.vipInfo.id_card
    var iccardno = data.vipInfo.iccardno
    var searchtyp = data.vipInfo.searchtyp
    var fax = data.vipInfo.fax
    var occupation = data.vipInfo.occupation
    var company = data.vipInfo.company
    var linkman = data.vipInfo.linkman
    var contact = data.vipInfo.contact
    var work_title = data.vipInfo.work_title
    var company_zip = data.vipInfo.company_zip
    var company_addr = data.vipInfo.company_addr
    var black = data.vipInfo.black
    var discount = data.vipInfo.discount
    var buyer_number = data.vipInfo.buyer_number
    var vip_code = data.vipInfo.vip_code
    var last_examination_date = data.vipInfo.last_examination_date.substring(0, 10)
    var oil_prodid = data.vipInfo.oil_prodid
    var issued_date = data.vipInfo.issued_date.substring(0, 10)
    var car_type = data.vipInfo.car_type
    var memo = data.vipInfo.memo
    var SaleInfo = data.vipInfo.SaleInfo


    //-----------------------------------------------------------------整理ＡＰＩ吐回的商品資訊 存入陣列
    var ProdID = []
    var ProdDate = []
    console.log(2);
    for (var i = 0; i < SaleInfo.length; i++) {
        var shop_id = SaleInfo[i].shop_id
        var sale_id = SaleInfo[i].sale_id
        var sale_date = SaleInfo[i].sale_date.substring(0, 10)
        var SaleDetailInfo = SaleInfo[i].SaleDetailInfo

        for (var j = 0; j < SaleDetailInfo.length; j++) {
            var prod_id = SaleDetailInfo[j].prod_id
            var prod_name = SaleDetailInfo[j].prod_name
            var qty = SaleDetailInfo[j].qty

            var flag = 0
            for (var k = 0; k < ProdID.length; k++) {
                if (ProdID[k] == prod_id) {
                    flag = 1;
                    if (date_bigger(sale_date, ProdDate[k])) {
                        ProdDate[k] = sale_date
                    }
                    break;
                }
            }

            if (flag == 0) {
                ProdID.push(prod_id)
                ProdDate.push(sale_date)
            }
        }
    }


    //-----------------------------------------------------------------判斷下次驗車日期
    if (last_examination_date.length < 10) {
        _g().setCellValue("C9", null, date_add(issued_date, 60))
    }
    else if (date_bigger(date_add(last_examination_date, 6), date_add(issued_date, 120))) {
        _g().setCellValue("C9", null, date_add(last_examination_date, 6))
    } else {
        _g().setCellValue("C9", null, date_add(last_examination_date, 12))
    }


    //-----------------------------------------------------------------設定前端資料 如車牌 會員號碼 名稱等等

    _g().setCellValue("B2", null, vip_id)
    _g().setCellValue("C3", null, car_no.substring(0, dash_location) + "-" + car_no.substring(dash_location, car_no.length))

    if (vip_code != null) {
        _g().setCellValue("C4", null, vip_code)
    }

    if (name != null) {
        if (sex == "0") {
            _g().setCellValue("C5", null, name.substring(0, 1) + "先生")
        }
        else if (sex == "1") {
            _g().setCellValue("C5", null, name.substring(0, 1) + "女士")
        }
        else {
            _g().setCellValue("C5", null, name)
        }
    }

    //若C8為會員，將C7設為API所得到的點數
    if (_g().getCellValue("C8", null) == "會員") {
        _g().setCellValue("C7", null, last_point + "點");
    }



    //-----------------------------------------------------------------判斷是哪種會員，隱藏掉ＱＲ＿ＣＯＤＥ或隱藏掉普通文字匡

    // if(vip_level == 11 ){
    //     _g().setCellValue("C8",null,"簽帳客戶")
    //     _g().setCellValue("C7",null,"$"+last_amt)

    //     $('td[id^=C3-0-0]').css('color','#FF0000');
    //     $('td[id^=C5-0-0]').css('color','#FF0000');
    //     $('td[id^=C6-0-0]').css('color','#FF0000');
    //     $('td[id^=C7-0-0]').css('color','#FF0000');
    //     $('td[id^=C8-0-0]').css('color','#FF0000');
    //     //var timeoutID = window.setTimeout(( () => {
    //     //_g().setCellValue("E1",null,1)

    //     //} ), 1000);
    //     if(_g().getWidgetByName("delete_qr") != null){
    //         _g().getWidgetByName("delete_qr").fireEvent("click")
    //         _g().getWidgetByName("delete_qr").setEnable(false)
    //         return
    //     }
    // }
    // else if(vip_level == 12){
    //     _g().setCellValue("C8",null,"禮遇卡")
    //     _g().setCellValue("C7",null,iccardno+car_no)

    //     if(_g().getWidgetByName("delete_qr") != null){
    //         _g().getWidgetByName("delete_qr").fireEvent("click")
    //         _g().getWidgetByName("delete_qr").setEnable(false)
    //         return
    //     }

    // }
    // else{
    //     _g().setCellValue("C8",null,"會員")
    //     _g().setCellValue("C7",null,last_point +"點")

    //     if(_g().getWidgetByName("delete_qr") != null){
    //         _g().getWidgetByName("delete_qr").fireEvent("click")
    //         _g().getWidgetByName("delete_qr").setEnable(false)
    //         return

    //     }

    // }

    //-----------------------------------------------------------------判斷油品來更改顏色


    if (oil_prodid == '00') {
        $('td[id^=C3-0-0]').css('background-color', '#2894FF');
    }
    else if (oil_prodid == '92') {
        $('td[id^=C3-0-0]').css('background-color', '#CA8EC2');
    }
    else if (oil_prodid == '95') {
        $('td[id^=C3-0-0]').css('background-color', '#FFA042');
    }
    else if (oil_prodid == '98') {
        $('td[id^=C3-0-0]').css('background-color', '#8CEA00');
    }

    //-----------------------------------------------------------------獲取推銷週期和售出的週期

    //var recommend_period = FR.remoteEvaluate('=SQL("'+db_name+'","SELECT days FROM ProdPeriod t1  where type= 0 order by period_id ",1)')
    //var sold_period = FR.remoteEvaluate('=SQL("'+db_name+'","SELECT days FROM ProdPeriod t1  where type= 1 order by period_id ",1)')

    //var recommend_period_cate = FR.remoteEvaluate('=SQL("'+db_name+'","SELECT category_id FROM ProdPeriod t1  where type= 0 order by period_id ",1)')
    //var sold_period_cate = FR.remoteEvaluate('=SQL("'+db_name+'","SELECT category_id FROM ProdPeriod t1  where type= 1 order by period_id ",1)')

    //-----------------------------------------------------------------獲取所有有效品項
    var cate_id = FR.remoteEvaluate('=SQL("' + db_name + '","SELECT t1.category_id FROM ProdCategory t1  where is_show=1 limit 6 ",1)')


    //-----------------------------------------------------------------獲取對此會員已推銷的項目以及其週期到達時間
    //var recommended_id_array = FR.remoteEvaluate('=SQL("'+db_name+'","select t1.category_id,DATEADD (dd , '+recommend_period.toString()+' , t1.recommended_time ) as re_time from ProdRecommeded t1 join ProdCategory t2 on t1.category_id = t2.category_id where is_show = 1  and vip_id = \''+vip_id+'\' order by t1.category_id",1)').toString().split(',')
    //var recommended_date_array = FR.remoteEvaluate('=SQL("'+db_name+'","select t1.category_id,DATEADD (dd , '+recommend_period.toString()+' , t1.recommended_time ) as re_time from ProdRecommeded t1 join ProdCategory t2 on t1.category_id = t2.category_id where is_show = 1  and vip_id = \''+vip_id+'\' order by t1.category_id",2)').toString().split(',')

    var recommended_id_array = FR.remoteEvaluate('=SQL("' + db_name + '","select t1.category_id from ProdRecommeded t1 join ProdCategory t2 on t1.category_id = t2.category_id where is_show = 1  and vip_id = \'' + vip_id + '\' order by t1.category_id",1)').toString().split(',')
    var recommended_date_array = FR.remoteEvaluate('=SQL("' + db_name + '","select t1.recommended_time as re_time from ProdRecommeded t1 join ProdCategory t2 on t1.category_id = t2.category_id where is_show = 1  and vip_id = \'' + vip_id + '\' order by t1.category_id",1)').toString().split(',')

    for (var j = 0; j < recommended_id_array.length; j++) {

        var re_period = parseInt(FR.remoteEvaluate('=SQL("' + db_name + '","SELECT days FROM ProdPeriod t1  where type= 0 and category_id = \'' + recommended_id_array[j] + '\' order by period_id ",1,1)').toString(), 10)
        recommended_date_array[j] = date_add_day(recommended_date_array[j], re_period)

    }

    //alert(   FR.remoteEvaluate('=SQL("'+db_name+'","select ADDDATE( t1.recommended_time '+recommend_period.toString()+') as re_time from ProdRecommeded t1 join ProdCategory t2 on t1.category_id = t2.category_id where is_show = 1  and vip_id = \''+vip_id+'\' order by t1.category_id",1)'))


    //-----------------------------------------------------------------判斷是否已達收出週期，如果沒達到則改為999999999，已達到則將值改為品項ID方便等等判斷要不要隱藏此項目
    for (var j = 0; j < ProdID.length; j++) {

        var cate = FR.remoteEvaluate('=SQL("' + db_name + '","SELECT t1.category_id FROM ProdCategory t1 join ProdDetailInfo t2 on t1.category_id = t2.category_id where t2.prod_id =  \'' + ProdID[j] + '\'",1,1)')
        var sold_period = parseInt(FR.remoteEvaluate('=SQL("' + db_name + '","SELECT days FROM ProdPeriod t1  where type= 1 and category_id = \'' + cate + '\' order by period_id ",1,1)').toString(), 10)
        var sold_date = date_add_day(ProdDate[j], sold_period)

        if (date_bigger(sold_date, today)) {
            //ProdID[j] = FR.remoteEvaluate('=SQL("'+db_name+'","SELECT t1.category_id FROM ProdCategory t1 join ProdDetailInfo t2 on t1.category_id = t2.category_id where t2.prod_id =  \'' + ProdID[j] +'\'",1,1)')
            ProdID[j] = cate
        }
        else {
            ProdID[j] = "9999999999"
        }
    }


    //alert(cate_id +"---" + recommended_id_array + "---" + recommended_date_array)
    //-----------------------------------------------------------------將六個品項放上前端
    for (var i = 0; i < cate_id.length; i++) {

        _g().setCellValue("C" + (11 + i).toString(), null, cate_id[i])
        _g().getWidgetByCell("D" + (11 + i).toString()).setVisible(true)

        //-----------------------------------------------------------------未達推銷週期的不用推銷
        for (var j = 0; j < recommended_id_array.length; j++) {
            if (recommended_id_array[j] == cate_id[i] && date_bigger(recommended_date_array[j], today)) {
                _g().setCellValue("C" + (11 + i).toString(), null, "")
                _g().getWidgetByCell("D" + (11 + i).toString()).setVisible(false)
                break;
            }
        }

        //-----------------------------------------------------------------未達購買週期的不用推銷
        for (var j = 0; j < ProdID.length; j++) {
            if (ProdID[j] == cate_id[i]) {
                _g().setCellValue("C" + (11 + i).toString(), null, "")
                _g().getWidgetByCell("D" + (11 + i).toString()).setVisible(false)
                break;
            }
        }


    }


    //-----------------------------------------------------------------會員重點提示

    var info = FR.remoteEvaluate('=SQL("' + db_name + '","select detail from VipMemo where vip_id = \'' + vip_id + '\' and used_flag = 2 and type = \'habit\' order by used_flag,memo_id DESC",1,1)')
    if (info.length != 0) {
        var timeoutID = window.setTimeout((() => {
            var iframe = $("<iframe id='inp' name='inp' width='100%' height='100%' scrolling='yes' frameborder='0'>");
            var url = "${servletURL}?reportlet=" + path_vip + "&op=write&P_INFO=" + info;
            iframe.attr("src", url);
            var o = {
                title: name,
                width: 250,
                height: 250
            };
            window.FR.showDialog(o.title, o.width, o.height, iframe, o);
        }), 50);
    }
}


//-----------------------------------------------------------------判斷第一個日期是否比第二個大
function date_bigger(date1, date2) {
    var g1 = new Date(date1);
    var g2 = new Date(date2);
    if (g1.getTime() > g2.getTime())
        return true;
    else
        return false

}

//-----------------------------------------------------------------將日期加上某個月份的數量
function date_add(date, month) {
    var get_date = new Date(date)
    var newDate = new Date(get_date.setMonth(get_date.getMonth() + month));
    return newDate
}

//-----------------------------------------------------------------將日期加上某個天數的數量
function date_add_day(date, day) {
    var get_date = new Date(date)
    var newDate = new Date(get_date.setDate(get_date.getDate() + day));
    var mm = newDate.getMonth() + 1; // getMonth() is zero-based
    var dd = newDate.getDate();
    var yyyy = newDate.getFullYear()
    if (mm <= 9) {
        mm = "0" + mm
    }
    if (dd <= 9) {
        dd = "0" + dd
    }
    return yyyy + "-" + mm + "-" + dd
}

//-----------------------------------------------------------------產生亂數

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}


function change_car() {
    var url = window.location.href;
    if (url.indexOf('car_no') > -1) {
        url = url.substring(0, url.indexOf('car_no') - 1)

    }
    url += '&car_no=' + car_no
    if (url.indexOf('P_MANUAL') > -1) {
        url = url.substring(0, url.indexOf('P_MANUAL') - 1)

    }

    //window.parent.FR.doHyperlinkByGet(url, {}, 'RHIFRAME'+(seq-1).toString());
    //window.location.href = url;
    FR.ajax({
        url: FR.servletURL + '?op=fr_dialog&cmd=parameters_d',
        type: 'POST',
        data: { car_no: car_no },
        headers: { sessionID: sessionID },
        complete: function (res, status) {
            if (FR && FR.Chart && FR.Chart.WebUtils) {
                FR.Chart.WebUtils.clearCharts()
            }
            if (FR && FR.destroyDialog) {
                _g().loadContentPane()
            }
            API(url, car_no, sale_begindate, sale_enddate, prod_list)
        }
    })
}


document.getElementById('C7-0-0').onclick = QR_CODE_BIG;

function QR_CODE_BIG() {
    let car_no_replace = filter(car_no);
    var iframe = $("<iframe id='inp' name='inp' width='100%' height='100%' scrolling='yes' frameborder='0'>");
    // var qr_code = _g().getCellValue("C7",null)

    if (_g().getCellValue("C8", null) == "禮遇卡") {
        //禮遇卡折扣
        let courtesy_discount = FR.remoteEvaluate('=SQL("' + db_name + '","select discount from courtesy_carlist where REPLACE( car_no, \'-\' , \'\' ) = \'' + car_no_replace + '\' and start_date <= date(now()) and end_date >= date(now())",1,1)');
        //禮遇卡卡號
        let gmvip = 'GMVIP%';
        var courtesy_cardNo = FR.remoteEvaluate('=SQL("3s_db","select dcard_no from dcard_mbr where car_no = \'' + courtesy_discount + '\' and cust_id like \'' + gmvip + '\' ",1,1)');
        console.log(courtesy_cardNo);
        var courtesy_carNo = courtesy_discount;
        var url = "${servletURL}?reportlet=" + path + "&op=write&P_QR_CODE=" + courtesy_cardNo + "&P_QR=" + courtesy_carNo + "&category=1";
        console.log(car_no_replace);
    } else if (_g().getCellValue("C8", null) == "簽帳現銷") {
        var url = "${servletURL}?reportlet=" + path + "&op=write&P_QR_CODE=" + car_no + "&category=0";

    };
    iframe.attr("src", url);
    var o = {
        title: "QR_CODE",
        width: 250,
        height: 250
    };

    window.FR.showDialog(o.title, o.width, o.height, iframe, o);

}



// function QR_CODE_BIG() {
//     let car_no_replace = filter(car_no);
//     //禮遇卡折扣
//     let courtesy_discount = FR.remoteEvaluate('=SQL("' + db_name + '","select discount from courtesy_carlist where REPLACE( car_no, \'-\' , \'\' ) = \'' + car_no_replace + '\' and start_date <= date(now()) and end_date >= date(now())",1,1)');
//     //禮遇卡卡號
//     var courtesy_cardNo = FR.remoteEvaluate('=SQL("3s_db","select dcard_no from dcard_mbr where car_no = \'' + courtesy_discount + '\' and cust_id like \'GMVIP% \' ",1,1)');
//     var courtesy_carNo = courtesy_discount;
//     var iframe = $("<iframe id='inp' name='inp' width='100%' height='100%' scrolling='yes' frameborder='0'>");
//     // var qr_code = _g().getCellValue("C7",null)
//     var url = "${servletURL}?reportlet=" + path + "&op=write&P_QR_CODE=" + courtesy_cardNo + "&P_QR=" + courtesy_carNo;;
//     iframe.attr("src", url);

//     var o = {
//         title: "QR_CODE",
//         width: 250,
//         height: 250
//     };
//     if (_g().getCellValue("C8", null) == "禮遇卡") {
//         window.FR.showDialog(o.title, o.width, o.height, iframe, o);
//     }
// }


document.getElementById('C2-0-0').onclick = cancel;
function cancel() {
    var url = window.location.href;
    if (url.indexOf('car_no') > -1) {
        url = url.substring(0, url.indexOf('car_no') - 1)

    }
    if (url.indexOf('P_MANUAL') > -1) {
        url = url.substring(0, url.indexOf('P_MANUAL') - 1)

    }
    url += '&P_MANUAL=0'
    window.location.href = url;
}

function send_to_pos(island, send_msg) {

    var ws = new WebSocket("ws://" + ip + ":" + port + "/webroot/msg_center")
    ws.onopen = () => {
        msg = {
            type: "msg",
            topic: island,
            msg: send_msg
        }
        ws.send(JSON.stringify(msg))
        change_car()
    }


}

function ping(ip, callback) {
    if (!this.inUse) {
        this.status = 'unchecked';
        this.inUse = true;
        this.callback = callback;
        this.ip = ip;
        var _that = this;
        this.img = new Image();
        this.img.onload = function () {
            _that.inUse = false;
            //clearTimeout(_thst.timer)
            _that.callback('responded');

        };
        this.img.onerror = function (e) {
            if (_that.inUse) {
                _that.inUse = false;
                //clearTimeout(_thst.timer)
                _that.callback('responded', e);
            }

        };
        this.start = new Date().getTime();
        this.img.src = "http://" + ip;
        this.timer = setTimeout(function () {
            if (_that.inUse) {
                _that.inUse = false;
                _that.callback('timeout');
            }
        }, 3000);
    }
};


//忽略車號的 - 
function filter(str) {
    var pattern = /-/g;
    return str.replace(pattern, "");
}