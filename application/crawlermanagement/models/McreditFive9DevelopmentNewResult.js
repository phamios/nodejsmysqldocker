var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var GlobalRequest = require('../../../core/global_request');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
McreditFive9DevelopmentNewResult = GlobalFunction.cloneFunc(GlobalActiveRecord);
McreditFive9DevelopmentNewResult.prototype.tableName = function() {
    return 'mcredit_five9_development_new_result';
}
McreditFive9DevelopmentNewResult.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
McreditFive9DevelopmentNewResult.prototype.LABEL = {
    "so_cmnd": "So Cmnd",
    "ma_so_thue": "Ma So Thue",
    "nguoi_dai_dien": "Nguoi Dai Dien",
    "ngay_hoat_dong": "Ngay Hoat Dong",
    "quan_ly_boi": "Quan Ly Boi",
    "tinh_trang": "Tinh Trang",
    "is_delete": "Is Delete",
    "status": "Status"
};
McreditFive9DevelopmentNewResult.prototype.RULE = {
    "so_cmnd": {
        "type": "varchar",
        "primary_key": true,
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "ma_so_thue": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "nguoi_dai_dien": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "ngay_hoat_dong": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "quan_ly_boi": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "tinh_trang": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "is_delete": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    }
};
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

McreditFive9DevelopmentNewResult._model_instance = false;
McreditFive9DevelopmentNewResult.get_model = function() {
    if(!McreditFive9DevelopmentNewResult._model_instance) {
        McreditFive9DevelopmentNewResult._model_instance = new McreditFive9DevelopmentNewResult();
    }
    return McreditFive9DevelopmentNewResult._model_instance;
}

McreditFive9DevelopmentNewResult.get_data_by_status = async function(vi_tri = 0) {
    var model = McreditFive9DevelopmentNewResult.get_model();
    var list = await model.query(`select * from mcredit_five9_development_new where status = 1 limit 100`);
    if(!list || !list.length) {
        console.log('chay thanh cong');
        return false;
    }
    return GlobalFunction.runMultiRequest(list, async function(data,index){
        var item = data[index];
        console.log('chay den vi tri va index',vi_tri, index);
        return McreditFive9DevelopmentNewResult.insert_crawler_data_by_item(item);
    },1).then(async function(r) {
        vi_tri++;
        return McreditFive9DevelopmentNewResult.get_data_by_status(vi_tri);
    })
}

McreditFive9DevelopmentNewResult.insert_crawler_data_by_item = async function(item) {
    var driver = await new Builder().forBrowser('firefox').build();
    await driver.get('https://masothue.vn/');
    var a1 = await driver.findElement(By.id('search')).sendKeys(item.so_cmnd, Key.RETURN);
    if(a1){}
    var a2 = await McreditFive9DevelopmentNewResult.timeout(3000);
    if(a2){}
    var list_tr = await driver.findElements(By.xpath("//table[@class='table-taxinfo']/tbody/tr"));
    if(list_tr && list_tr.length >= 5) {
        console.log('Mã số thuế', await list_tr[0].getText());
        console.log('Người đại diện', await list_tr[1].getText());
        console.log('Ngày hoạt động', await list_tr[2].getText());
        console.log('Quản lý bởi', await list_tr[3].getText());
        console.log('Tình trạng', await list_tr[4].getText());
        var item_insert = {};
        
        item_insert.so_cmnd = item.so_cmnd;
        item_insert.ma_so_thue = (await list_tr[0].getText()).replace('Mã số thuế','').trim();
        item_insert.nguoi_dai_dien = (await list_tr[1].getText()).replace('Người đại diện','').trim();
        item_insert.ngay_hoat_dong = (await list_tr[2].getText()).replace('Ngày hoạt động','').trim();
        item_insert.quan_ly_boi = (await list_tr[3].getText()).replace('Quản lý bởi','').trim();
        item_insert.tinh_trang = (await list_tr[4].getText()).replace('Tình trạng','').trim();
        console.log('item_insert', item_insert);
        var a1 = await McreditFive9DevelopmentNewResult.get_model().insertMany([item_insert]);
        if(a1){}
    }
    var r2 = await driver.quit();
    if(r2){}
    var a2 = await McreditFive9DevelopmentNewResult.get_model().query(`update mcredit_five9_development_new set status = 0 where casenumber = '` + item.casenumber + `';`)
    if(a2){}
    console.log('update thanh cong');
    return Promise.resolve(true);
}

McreditFive9DevelopmentNewResult.timeout = async function (timeout = 1000) {
    var def = Q.defer();
    setTimeout(function(){
        def.resolve(true);
    }, timeout);
    return def.promise;
}

exports = module.exports = McreditFive9DevelopmentNewResult;