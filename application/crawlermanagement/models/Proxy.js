var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var GlobalRequest = require('../../../core/global_request');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
Proxy = GlobalFunction.cloneFunc(GlobalActiveRecord);
Proxy.prototype.tableName = function () {
    return 'proxy';
}
Proxy.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
Proxy.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "port": "Port",
    "mofidied_by": "Mofidied By",
    "is_delete": "Is Delete",
    "language": "Language",
    "status": "Status",
    "protocol": "Protocol",
    "username": "Username",
    "pass": "Pass"
};
Proxy.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "name": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 20
        },
        "size": 20
    },
    "port": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 20
        },
        "size": 20
    },
    "mofidied_by": {
        "type": "int",
        "size": 11,
        "default": "NULL"
    },
    "is_delete": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "language": {
        "default": "'vn'",
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "protocol": {
        "type": "varchar",
        "require": {
            "size": 50
        },
        "size": 50,
        "default": "NULL"
    },
    "username": {
        "default": "NULL",
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "pass": {
        "default": "NULL",
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    }
};

Proxy.get_list_free_proxy = async function (page = 0) {
    page = parseInt(page);
    console.log('bat dau chay page ' + page);
    let driver = await new Builder().forBrowser('chrome').build();
    var data = [];
    var link = 'http://free-proxy.cz/en/proxylist/country/VN/all/ping/all';
    if(page > 1) {
        link += '/' + page;
    }
    await driver.get(link);
    var list_tr = await driver.findElements(By.xpath("//table[@id='proxy_list']/tbody/tr"));
    for (var i in list_tr) {
        var list_td = await driver.findElements(By.xpath("//table[@id='proxy_list']/tbody/tr[" + i + "]/td"));
        if (list_td && list_td.length == 11) {
            var item = {language:'vn',is_delete:0,status:1};
            item.name = await list_td[0].getText();
            item.port = await list_td[1].getText();
            item.protocol = await list_td[2].getText();
            // item.country = await list_td[3].getText();
            item.region = await list_td[4].getText();
            // item.city = await list_td[5].getText();
            item.anonymity = await list_td[6].getText();
            item.speed = await list_td[7].getText();
            item.uptime = await list_td[8].getText();
            item.response = await list_td[9].getText();
            // item.last_checked = await list_td[10].getText();
            data.push(item);
        }
    }
    await driver.quit();
    console.log('ket thuc chay page ' + page,data.length);
    return data;
}

Proxy.get_list_free_proxy_all = async function() {
    var list_data_obj = {};
    var a = await GlobalFunction.runMultiRequest(new Array(5), async function(data,index){
        var rs = await Proxy.get_list_free_proxy(index + 1);
        for(var item of rs) {
            list_data_obj[item.name] = item;
        }
        return rs;
    })
    if(a){}
    var list_ip = Object.keys(list_data_obj);
    console.log('bat dau check insert update cua ', list_ip.length,'ban ghi');
    var model = new Proxy();
    var list_old = await model.findAll({name:list_ip});
    var list_old_obj = {};
    for(var item of list_old) {
        list_old_obj[item.name] = 1;
    }
    var list_insert = [];
    var list_update = [];
    for(var name in list_data_obj) {
        if(list_old_obj[name]) {
            list_update.push(list_data_obj[name]);
        } else {
            list_insert.push(list_data_obj[name]);
        }
    }
    if(list_update.length) {
        console.log('bat dau update ', list_update.length, 'ban ghi');
        var c = await GlobalFunction.runMultiRequest(list_update, async function(data,index){
            return model.query(`update proxy set status = 1, port = '` + data[index].port + `' where name = '` + data[index].name + `';`);
        })
        if(c){}
    }
    console.log('bat dau insert ', list_insert.length, 'ban ghi');
    if(list_insert.length) {
        var b = await model.insertMany(list_insert);
        if(b){}
    }
    console.log('thanh cong');
}

Proxy.list_ip = [];
Proxy.list_ip_index = 0;
Proxy.get_list_proxy = async function() {
    var model = new Proxy();
    var list = await model.query(`select concat('http://',name,':',port) ip from proxy where status = 1 and is_delete = 0 and time_request < 2000;`);
    Proxy.list_ip = GlobalFunction.indexArray(list,'ip');
    return Proxy.list_ip;
}

Proxy.getProxy = function() {
    if(Proxy.list_ip.length == 1) {
        return Proxy.list_ip[0];    
    }
    if(Proxy.list_ip_index >= Proxy.list_ip.length) {
        Proxy.list_ip_index = 0;
    } else {
        Proxy.list_ip_index++;
    }
    return Proxy.list_ip[Proxy.list_ip_index];
}

Proxy.check_proxy = async function() {
    var model = new Proxy();
    var list = await model.findAll();
    return GlobalFunction.runMultiRequest(list, async function(data,index){
        var start = new Date().getTime();
        var r = await GlobalRequest.get('https://www.five9.vn/five9/main/checkip',{proxy: 'http://' + data[index].name + ':' + data[index].port,timeout:10000});
        console.log(index,data[index].name+ ':' + data[index].port,r, new Date().getTime() - start);
        if(r) {
            return model.query(`update proxy set status = 1, time_request = ` + (new Date().getTime() - start) + ` where id = ` + data[index].id);
        } else {
            return model.query(`update proxy set status = 0, time_request = ` + (new Date().getTime() - start) + ` where id = ` + data[index].id);
        }
    },10);
}

Proxy.get_driver = async function() {
    var proxy_address = Proxy.getProxy();
    if(proxy_address) {
        return new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().addArguments(`--proxy-server=` + Proxy.getProxy())).build();
    } else {
        return new Builder().forBrowser('chrome').build();
    }
}

Proxy.get_model_instance = false;
Proxy.get_model = function () {
    if (!Proxy.get_model_instance) {
        Proxy.get_model_instance = new Proxy();
    }
    return Proxy.get_model_instance;
}

Proxy.get_list_proxy_instance = {};
Proxy.get_list_proxy = async function () {
    var list = await Proxy.get_model().findAll({ });
    if (list && list.length) {
        Proxy.get_list_proxy_instance = {};
        for (var item of list) {
            Proxy.get_list_proxy_instance[item.id] = item;
        }
    }
    return list;
}

Proxy.get_proxy_name_by_id = function(id) {
    var result = '';
    if(id && Proxy.get_list_proxy_instance[id]) {
        var item = Proxy.get_list_proxy_instance[id];
        result += (item.protocol ? item.protocol : 'http') + '://';
        if(item.username && item.pass) {
            result += item.username + ':' + item.pass + '@';
        }
        result += item.name + ':' + item.port ;
    }
    return result;
}

Proxy.init_server = async function () {
    Proxy.get_list_proxy();
    setInterval(function () {
        Proxy.get_list_proxy();
    }, 8 * 60 * 1000);
}

exports = module.exports = Proxy;