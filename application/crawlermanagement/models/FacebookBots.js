var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var GlobalRequest = require('../../../core/global_request');
var GlobalFacebook = require('../../../core/global_facebook');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
FacebookBots = GlobalFunction.cloneFunc(GlobalActiveRecord);
FacebookBots.prototype.tableName = function() {
    return 'facebook_bots';
}
FacebookBots.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
FacebookBots.prototype.LABEL = {
    "id": "Id",
    "instance_id": "Instance Id",
    "chrome_id": "Chrome Id",
    "facebook_id": "Facebook Id",
    "email": "Email",
    "pass": "Pass",
    "mobile_phone": "Mobile Phone",
    "first_name": "First Name",
    "last_name": "Last Name",
    "name": "Name",
    "gender": "Gender",
    "birthday": "Birthday",
    "list_friend": "List Friend",
    "list_group": "List Group",
    "status_login": "Status Login",
    "is_delete": "Is Delete",
    "token": "Token",
    "cookie": "Cookie",
    "is_active": "Is Active"
};
FacebookBots.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "instance_id": {
        "type": "int",
        "size": 11,
        "fk": {
            "table": "instance",
            "ref_id": "id"
        }
    },
    "chrome_id": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    },
    "facebook_id": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 50
        },
        "size": 50
    },
    "email": {
        "type": "varchar",
        "require": {
            "size": 255,
            "email": true
        },
        "size": 255
    },
    "pass": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 50
        },
        "size": 50
    },
    "mobile_phone": {
        "type": "varchar",
        "require": {
            "size": 20,
            "phone": true
        },
        "size": 20
    },
    "first_name": {
        "type": "varchar",
        "require": {
            "size": 50
        },
        "size": 50
    },
    "last_name": {
        "type": "varchar",
        "require": {
            "size": 50
        },
        "size": 50
    },
    "name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "gender": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    },
    "birthday": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    },
    "list_friend": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "list_group": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "status_login": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "is_delete": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "token": {
        "type": "varchar",
        "require": {
            "size": 500
        },
        "size": 500
    },
    "cookie": {
        "type": "varchar",
        "require": {
            "size": 500
        },
        "size": 500
    },
    "is_active": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "fk_table_instance_id": {
        "type": "any"
    }
};

FacebookBots.get_model_instance = false;
FacebookBots.get_model = function () {
    if (!FacebookBots.get_model_instance) {
        FacebookBots.get_model_instance = new FacebookBots();
    }
    return FacebookBots.get_model_instance;
}


FacebookBots.refresh_information = async function() {
    var model = FacebookBots.get_model();
    var list = await model.query(`select * from facebook_bots where name is null or name = '';`);
    var list = [
        {
            facebook_id :'100000201729964',
            cookie      : 'datr=c2UAWejaDOgw6pDR4_ZHnFZN; sb=dWUAWYLsNSDBw-2DkfcHi78X; _fbp=fb.1.1560931701911.266293989; ; locale=vi_VN; c_user=100000201729964; xs=22%3AUL0NIRjROrQNiA%3A2%3A1562223916%3A5893%3A6381; spin=r.1000915303_b.trunk_t.1562552654_s.1_v.2_; presence=EDvF3EtimeF1562556068EuserFA21B00201729964A2EstateFDsb2F1562314441747EatF1562315444119Et3F_5b_5dEutc3F1562315444129G562556068996CEchFDp_5f1B00201729964F1CC; wd=1326x937; fr=1m4OwwDNwtJkTsA0p.AWV4QpaeJQNdsNtjU9_xSTg06Wc.Bc62cR.vH.F0e.0.0.BdIrk8.AWW2oD80; act=1562556732769%2F11; x-src=%2Fanhdung.17041986%7Cpagelet_bluebar; pnl_data2=eyJhIjoib25hZnRlcmxvYWQiLCJjIjoiWEV2ZW50c0Rhc2hib2FyZEJpcnRoZGF5c0NvbnRyb2xsZXIiLCJiIjpmYWxzZSwiZCI6Ii9hbmhkdW5nLjE3MDQxOTg2IiwiZSI6W119;',
        },
    ];
    return GlobalFunction.runMultiRequest(list, async function(data,index){
        var item = data[index];
        var rs = await GlobalRequest.get('https://www.facebook.com/settings',{
            "origin": "https://www.facebook.com",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36",
            "authority": "www.facebook.com",
            "accept": "*/*",
            "accept-encoding": "gzip, deflate, br",
            'cookie': item.cookie,
        })
        if(rs) {
            var dom = new JSDOM(body);
            var document = dom.window.document;
            var list_item = document.querySelectorAll('.fbSettingsListLink .fbSettingsListItemContent.fcg strong');
            var name = list_item[0].innerHTML;
            var username = list_item[1].innerHTML;
            var email = list_item[2].innerHTML;
        }
    })
}

FacebookBots.refresh_email = async function() {
    var model = FacebookBots.get_model();
    var list = await model.query(`select * from facebook_bots where email = '' or email is null;`);
    var data = [];
    for(var item of list) {
        var a = item.cookie.split(';');
        var a_cookie = [];
        for(var it of a) {
            a_cookie.push(`document.cookie = "` + it + `;expires=0; path=/;"`);
        }
        var item_new = {
            facebook_id : item.facebook_id,
            cookie      : a_cookie.join(";")
        };
        data.push(item_new);
        console.log(item_new);
    }
}

FacebookBots.refresh_token = async function() {
    var FacebookToken = require('./FacebookToken');
    var model = FacebookBots.get_model();
    var list = await model.query(`
        select * from facebook_bots a 
        where a.is_delete = 0 and 
        a.facebook_id in (select facebook_id from facebook_token where status = 0 and is_delete = 0 and group_name = '` + FacebookToken.get_ip_server() + `')
    `);
    return GlobalFunction.runMultiRequest(list, async function(data,index){
        var item = data[index];
        var rs_token = await GlobalFacebook.refresh_token(item.mobile_phone ? item.mobile_phone : item.email, item.pass);
        if(rs_token && rs_token.access_token) {
            console.log('refresh thanh cong', item.facebook_id, item.name);
            return model.query(`update facebook_token set token = '` + rs_token.access_token + `',status = 1, is_delete = 0, error_message = null 
                    where facebook_id = '` + item.uid + `';
            `);
        } else {
            console.log('khong lay duoc token', item.facebook_id, item.name);
            return Promise.resolve(false);
        }
    })
}

exports = module.exports = FacebookBots;