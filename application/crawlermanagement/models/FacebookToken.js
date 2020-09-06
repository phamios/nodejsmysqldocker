var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
const GlobalRequest = require('../../../core/global_request');
var GlobalFile = require('../../../core/global_file');
var GlobalFacebook = require('../../../core/global_facebook');
var CONFIG = require('../../../config/config');
var ENUM = require('../../../config/enum');
var Q = require('q');
var Promise = require('promise');
var os = require('os');
var FacebookTokenLog = require('./FacebookTokenLog');
var FacebookTokenDie = require('./FacebookTokenDie');
var FriendValid = require('./FriendValid');
var GroupValid = require('./GroupValid');
var Proxy = require('./Proxy');

FacebookToken = GlobalFunction.cloneFunc(GlobalActiveRecord);
FacebookToken.prototype.tableName = function () {
    return 'facebook_token';
}
FacebookToken.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
FacebookToken.prototype.LABEL = {
    "id": "Id",
    "facebook_id": "Facebook Id",
    "token": "Token",
    "name": "Name",
    "status": "Status",
    "is_delete": "Is Delete",
    "group_name": "Group Name",
    "error_message": "Error message",
    "test": "Test",
    "is_best": "Is Best",
    "cookie": "Cookie",
    "fb_dtsg_ag": "Fb Dtsg Ag",
    "proxy": "Proxy"
};
FacebookToken.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "facebook_id": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 20
        },
        "size": 20
    },
    "token": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 500
        },
        "size": 500
    },
    "name": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "is_delete": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "group_name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255,
        "default": "NULL"
    },
    "error_message": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255,
        "default": "NULL"
    },
    "test": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "is_best": {
        "type": "tinyint",
        "size": 4,
        "default": "NULL"
    },
    "cookie": {
        "default": "NULL",
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "fb_dtsg_ag": {
        "default": "NULL",
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "proxy": {
        "default": "NULL",
        "type": "int",
        "size": 11,
        "fk": {
            "table": "proxy",
            "ref_id": "id"
        }
    },
    "fk_table_proxy": {
        "type": "any"
    },
};

FacebookToken.upload_token = async function (a) {
    var list_token = [];
    for (var item of a.split('\n')) {
        if (item.trim()) {
            list_token.push(item.trim());
        }
    }
    var count_valid = 0;
    var count_error = 0;
    var count_exists = 0;
    var rs = await GlobalFunction.runMultiRequest(list_token, async function (data, index) {
        var token = data[index];
        var rs = await GlobalRequest.get('https://graph.facebook.com/me?access_token=' + token, { json: {} });
        if (rs && rs.id) {
            var row = {
                "facebook_id": rs.id,
                "token": token,
                "name": rs.name,
                "status": 1,
                "is_delete": 0,
                "group_name": null,
                "error_message": null
            };
            var model = new FacebookToken();
            var b = await model.findOne({ facebook_id: rs.id });
            model.setAttributes(row);
            if (b && b.id && b.status == 1) {
                count_exists++;
                return Promise.resolve(true);
            } else {
                count_valid++;
                return model.save(false);
            }
        } else {
            count_error++;
            return Promise.resolve(true);
        }
    })
    if (rs) { }
    return {
        count_valid: count_valid,
        count_error: count_error,
        count_exists: count_exists,
    }
}

FacebookToken.refresh_row_by_token = async function (group_name = '192.168.8.44', is_best = 0) {
    var a = `
    `;
    var list_token = [];
    for (var item of a.split('\n')) {
        if (item.trim()) {
            var a1 = item.split('|');
            var item_new = a1[a1.length - 2];
            list_token.push(item_new.trim());
        }
    }
    console.log('list_token', list_token);
    var count_sucess = 0;
    return GlobalFunction.runMultiRequest(list_token, async function (data, index) {
        var token = data[index];
        var rs = await GlobalRequest.get('https://graph.facebook.com/me?access_token=' + token, { json: {} });
        console.log('index', index);
        if (rs && rs.id) {
            var row = {
                "facebook_id": rs.id,
                "token": token,
                "name": rs.name,
                "status": 1,
                "is_delete": 0,
                "group_name": group_name,
                "error_message": null,
                "is_best": is_best,
            };
            var model = new FacebookToken();
            var b = await model.findOne({ facebook_id: rs.id });
            if (b) { }
            model.setAttributes(row);
            count_sucess++;
            console.log('thanh cong', count_sucess);
            return model.save(false);
        } else {
            console.log('error', rs, token);
        }
        return Promise.resolve(true);
    }, 1)
}

FacebookToken.refresh_row_by_file = async function (link_file = 'C:/tailieu/crawlerapigetway/200-noveri.txt', group_name = '192.168.8.177', is_best = 0) {
    var content = GlobalFile.readFile(link_file);
    var count_sucess = 0;
    for (var item of content.split('\n')) {
        if (item.trim()) {
            var a1 = item.split('|');
            var row = {
                "facebook_id": a1[0],
                "token": a1[3],
                "name": a1[1],
                "status": 1,
                "is_delete": 0,
                "cookie": a1[2],
                "group_name": group_name,
                "error_message": null,
                "is_best": is_best,
            };
            var model = new FacebookToken();
            var b = await model.findOne({ facebook_id: a1[0] });
            if (b) { }
            model.setAttributes(row);
            count_sucess++;
            console.log('thanh cong', count_sucess);
            var rs1 = await model.save(false);
            console.log('thanh cong', count_sucess, a1[0]);
        }
    }
}

FacebookToken.check_status = async function () {
    var model = new FacebookToken();
    var list = await model.query(`select * from facebook_token where id >= 50`);
    var a = await GlobalFunction.runMultiRequest(list, async function (data, index) {
        var item = data[index];
        var token = item.token;
        var rs = await GlobalRequest.get('https://graph.facebook.com/me?access_token=' + token, { json: {} });
        if (rs && rs.error) {
            console.log(item);
            return model.query(`update facebook_token set status = 0, error_message = '` + rs.error.message.replace(/'/gi, "\\'") + `' where id = ` + item.id);
        } else {
            return Promise.resolve(true);
        }
    })
    if (a) { }
    console.log('thanh cong');
    return a;
}

FacebookToken.get_ip_server = function () {
    var ifaces = os.networkInterfaces();
    var list = Object.keys(ifaces);
    var rs = [];
    for (var ifname of list) {
        for (var iface of ifaces[ifname]) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                continue;
            }
            if (iface.address.match(/192\.168/gi)) {
                rs.push(iface.address);
            }
        }
    }
    var result = rs.length ? rs[0] : false;
    // console.log('get_ip_server',result);
    return result;
}

FacebookToken.get_model_instance = false;
FacebookToken.get_model = function () {
    if (!FacebookToken.get_model_instance) {
        FacebookToken.get_model_instance = new FacebookToken();
    }
    return FacebookToken.get_model_instance;
}

FacebookToken.get_model_die_instance = false;
FacebookToken.get_model_die = function () {
    if (!FacebookToken.get_model_die_instance) {
        FacebookToken.get_model_die_instance = new FacebookTokenDie();
    }
    return FacebookToken.get_model_die_instance;
}

FacebookToken.list_token_id_obj = {};
FacebookToken.list_token_item_obj = {};

FacebookToken.index_token = 0;
FacebookToken.limit_token = 0;
FacebookToken.get_list_token_instance_facebook_id = {};
FacebookToken.get_list_token_instance = {};
FacebookToken.get_list_token_instance_full = {};
FacebookToken.get_list_token_instance_obj = {};
FacebookToken.get_list_token_instance_list_full = [];
FacebookToken.get_list_token = async function (is_best = ENUM.FACEBOOK_TOKEN.NOT_BEST) {
    var group_name = CONFIG.argv.group_name || FacebookToken.get_ip_server();
    var list = await FacebookToken.get_model().findAll({ status: 1, group_name: group_name, is_best: is_best });
    if (list.length < 10) {
        // var a = await FacebookToken.get_model().query(`update facebook_token set group_name = '` + group_name + `' where status = 1 AND group_name is null limit ` + (10 - list.length) + `;`);
        // if(a){}
        // list = await FacebookToken.get_model().findAll({ status: 1, group_name: group_name });
    }
    if (list && list.length) {
        FacebookToken.index_token = 0;
        FacebookToken.limit_token = 0;
        FacebookToken.get_list_token_instance_facebook_id = {};
        FacebookToken.get_list_token_instance = {};
        FacebookToken.get_list_token_instance_full = {};
        FacebookToken.get_list_token_instance_obj = {};

        var list_id_token = [];
        var list_id_token_obj = {};
        var date_1 = GlobalFunction.newDate();
        date_1.setDate(date_1.getDate() + 1);
        var date_now = GlobalFunction.getDateNow();
        var date_now_1 = GlobalFunction.getDateNow(date_1);
        list_id_token.push('99999999' + '_' + date_now);
        list_id_token.push('99999999' + '_' + date_now_1);
        list_id_token_obj['99999999' + '_' + date_now] = { facebook_token_id: 99999999, date_log: date_now };
        list_id_token_obj['99999999' + '_' + date_now_1] = { facebook_token_id: 99999999, date_log: date_now_1 };
        for (var item of list) {
            FacebookToken.get_list_token_instance_facebook_id[item.facebook_id] = item.token;
            FacebookToken.list_token_id_obj[item.token] = item.id;
            FacebookToken.list_token_item_obj[item.token] = item;
            FacebookToken.get_list_token_instance_list_full.push(item.token);
            FacebookToken.get_list_token_instance[FacebookToken.limit_token] = item.token;
            FacebookToken.get_list_token_instance_full[FacebookToken.limit_token] = item.token;
            FacebookToken.get_list_token_instance_obj[item.token] = FacebookToken.limit_token;
            FacebookToken.limit_token++;

            list_id_token.push(item.id + '_' + date_now);
            list_id_token.push(item.id + '_' + date_now_1);
            list_id_token_obj[item.id + '_' + date_now] = { facebook_token_id: item.id, date_log: date_now };
            list_id_token_obj[item.id + '_' + date_now_1] = { facebook_token_id: item.id, date_log: date_now_1 };
        }
        var md_log = FacebookToken.get_model_log_instance();
        md_log.findAll({ uni_key: list_id_token }).then(r => {
            for (var item of r) {
                delete list_id_token_obj[item.uni_key];
            }
            var list_data_insert = [];
            for (var uni_key in list_id_token_obj) {
                list_data_insert.push({
                    "uni_key": uni_key,
                    "facebook_token_id": list_id_token_obj[uni_key].facebook_token_id,
                    "date_log": list_id_token_obj[uni_key].date_log,
                    "count_valid": 0,
                    "count_error": 0,
                    "count_all": 0,
                    "created_time": parseInt(GlobalFunction.newDate().getTime() / 1000)
                });
            }
            if (list_data_insert.length) {
                return md_log.insertMany(list_data_insert);
            }
            return Promise.resolve(true);
        })
    }

    return list;
}

FacebookToken.get_proxy_by_token = function (token) {
    return Proxy.get_proxy_name_by_id(FacebookToken.list_token_item_obj[token] ? FacebookToken.list_token_item_obj[token].proxy : false);
}

FacebookToken.get_token = function () {
    var i = 0;
    do {
        if (FacebookToken.limit_token == 1) {
            FacebookToken.index_token = 0;
        } else {
            FacebookToken.index_token = FacebookToken.index_token >= FacebookToken.limit_token ? 0 : (FacebookToken.index_token + 1);
        }
        i++;
    } while (!FacebookToken.get_list_token_instance[FacebookToken.index_token] && i <= FacebookToken.limit_token);
    if (!FacebookToken.get_list_token_instance[FacebookToken.index_token]) {
        return false;
    }
    return FacebookToken.get_list_token_instance[FacebookToken.index_token];
}

FacebookToken.get_cookie_by_query = function (query, item) {
    var token = FacebookToken.get_token_by_query(query, item);
    if (token && FacebookToken.list_token_item_obj[token]) {
        return FacebookToken.list_token_item_obj[token];
    }
    return false;
}

FacebookToken.get_token_by_query = function (query, item) {
    var object_id = false;
    if (query.OBJECT_ID) {
        object_id = query.OBJECT_ID;
    } else {
        for (var k in item.input_param) {
            var v = item.input_param[k];
            if (query[v] && v.indexOf('_id') >= 0) {
                object_id = query[v];
                break;
            }
        }
    }
    if (object_id) {
        object_id = object_id.replace(/_.*/gi, '');
        var token = FacebookToken.get_list_token_instance_facebook_id[object_id];
        if (token && FacebookToken.get_list_token_instance_obj.hasOwnProperty(token)) {
            return token;
        }
        if (GlobalFunction.validateFacebookid(object_id)) {
            token = FriendValid.get_token_from_friend_id(object_id, FacebookToken.get_list_token_instance_obj);
            if (token) {
                return token;
            }
        }
        return GroupValid.get_token_from_group_id(object_id, FacebookToken.get_list_token_instance_obj);
    } else {
        return false;
    }
}

FacebookToken.delete_token_by_token = function (token, err = false, url = false) {
    if (err && err.error && err.error.message) {
        if (err.error.message.match(/( limit )|(checkpoint)|( validating access token)|( user changed their password )|( OAuth )|(Service temporarily unavailable)|(Please retry your request later)/gi)) {
            if (FacebookToken.get_list_token_instance[FacebookToken.get_list_token_instance_obj[token]]) {
                delete FacebookToken.get_list_token_instance[FacebookToken.get_list_token_instance_obj[token]];
                console.log('so token hien tai', Object.keys(FacebookToken.get_list_token_instance).length);
                if (!err.error.message.match(/ validating access token| user changed their password |checkpoint/gi)) {
                    setTimeout(function () {
                        FacebookToken.get_list_token_instance[FacebookToken.get_list_token_instance_obj[token]] = token;
                        console.log('so token hien tai', Object.keys(FacebookToken.get_list_token_instance).length);
                    }, 5 * 60 * 1000);
                } else {
                    FacebookToken.get_model().query(`update facebook_token set status = 0, error_message = '` + err.error.message.replace(/'/gi, "\\'") + `', modified_time = ` + parseInt(new Date().getTime() / 1000) + ` where id = ` + FacebookToken.list_token_id_obj[token]);
                    setTimeout(function () {
                        FacebookToken.get_list_token_instance[FacebookToken.get_list_token_instance_obj[token]] = token;
                        console.log('so token hien tai', Object.keys(FacebookToken.get_list_token_instance).length);
                    }, 5 * 60 * 1000);
                }
            }
            return false;
        }
    }
    return true;
};

FacebookToken.init_server = async function (is_best = ENUM.FACEBOOK_TOKEN.NOT_BEST) {
    FacebookToken.get_list_token(is_best);
    setInterval(function () {
        FacebookToken.get_list_token(is_best);
    }, 8 * 60 * 1000);
    setInterval(function () {
        FacebookToken.update_log();
    }, 30 * 1000);
}

FacebookToken.update_group_name_by_token = async function () {
    var list_token = `
    `.split("\n");
    for (var i in list_token) {
        list_token[i] = list_token[i].trim();
    }
    var model = new FacebookToken();
    var a = await model.query(`update facebook_token set group_name = '192.168.9.95' where token IN ('` + list_token.join(`','`) + `')`)
    if (a) { }
}

FacebookToken.model_log_instance = false;
FacebookToken.get_model_log_instance = function () {
    if (!FacebookToken.model_log_instance) {
        FacebookToken.model_log_instance = new FacebookTokenLog();
    }
    return FacebookToken.model_log_instance;
}

FacebookToken.list_obj = {};
FacebookToken.update_log_flag = false;

FacebookToken.update_log = async function () {
    FacebookToken.update_log_flag = true;
    var model = FacebookToken.get_model_log_instance();
    var list_query = [];
    for (var k in FacebookToken.list_obj) {
        if (FacebookToken.list_obj[k].count_valid || FacebookToken.list_obj[k].count_error) {
            list_query.push(`update facebook_token_log set `
                + `count_valid = count_valid ` + (FacebookToken.list_obj[k].count_valid ? (' + ' + FacebookToken.list_obj[k].count_valid) : '')
                + ',count_error = count_error ' + (FacebookToken.list_obj[k].count_error ? (' + ' + FacebookToken.list_obj[k].count_error) : '')
                + ',count_all = count_all + ' + FacebookToken.list_obj[k].count_all
                + ',modified_time = ' + parseInt(GlobalFunction.newDate().getTime() / 1000)
                + ` WHERE uni_key = '` + k + `'`);
        }
        FacebookToken.list_obj[k].count_valid = 0;
        FacebookToken.list_obj[k].count_error = 0;
        FacebookToken.list_obj[k].count_all = 0;
    }
    if (list_query.length) {
        GlobalFunction.runMultiRequest(list_query, async function (data, index) {
            return model.query(data[index]);
        }, 1);
    }
    return Promise.resolve(true);
}

FacebookToken.log_by_token = function (token, flag) {
    var date = GlobalFunction.getDateNow();
    var key = FacebookToken.list_token_id_obj[token] + '_' + date;
    if (!FacebookToken.list_obj[key]) {
        FacebookToken.list_obj[key] = {
            "uni_key": key,
            "facebook_token_id": FacebookToken.list_token_id_obj[token],
            "date_log": date,
            "count_valid": 0,
            "count_error": 0,
            "count_all": 0,
            "created_time": parseInt(GlobalFunction.newDate().getTime() / 1000)
        };
    }
    FacebookToken.list_obj[key].count_all++;
    if (flag) {
        FacebookToken.list_obj[key].count_valid++;
    } else {
        FacebookToken.list_obj[key].count_error++;
    }
}

FacebookToken.log_by_token_99999999 = function (flag) {
    var token = '99999999';
    var date = GlobalFunction.getDateNow();
    var key = FacebookToken.list_token_id_obj[token] + '_' + date;
    if (!FacebookToken.list_obj[key]) {
        FacebookToken.list_obj[key] = {
            "uni_key": key,
            "facebook_token_id": 99999999,
            "date_log": date,
            "count_valid": 0,
            "count_error": 0,
            "count_all": 0,
            "created_time": parseInt(GlobalFunction.newDate().getTime() / 1000)
        };
    }
    FacebookToken.list_obj[key].count_all++;
    if (flag) {
        FacebookToken.list_obj[key].count_valid++;
    } else {
        FacebookToken.list_obj[key].count_error++;
    }
}


FacebookToken.insert_facebook_token_die = async function () {
    var d = GlobalFunction.getDateNow();
    var timestamp = parseInt(new Date(d).getTime() / 1000);
    var list = await FacebookToken.get_model_die().query(`
    select 
        '` + d + `' date_log,
        count(IF(status = 0,1,null)) count_error,
        count(IF(status = 1,1,null)) count_valid,
        count(*) count_all
    from facebook_token 
    where modified_time >= ` + timestamp + ` or created_time >= ` + timestamp + `
    `);
    if (list && list.length) {
        var list_old_obj = GlobalFunction.index(await FacebookToken.get_model_die().query(`select date_format(date_log,'%Y-%m-%d') date_log,count_error,count_valid,count_all from facebook_token_die where date_log >= '` + d + `'`), 'date_log');
        var list_insert = [];
        var list_update = [];
        for (var item of list) {
            if (!list_old_obj[item.date_log]) {
                list_insert.push(item);
            } else {
                list_update.push(item);
            }
        }
        if (list_insert.length) {
            FacebookToken.get_model_die().insertMany(list_insert);
        }
        if (list_update.length) {
            GlobalFunction.runMultiRequest(list_update, async function (data, index) {
                return FacebookToken.get_model_die().query(`
                    update facebook_token_die set 
                        count_error = ` + data[index].count_error + `,
                        count_valid = ` + data[index].count_valid + `,
                        count_all = ` + data[index].count_all + `
                    where date_log = '` + data[index].date_log + `'
                `);
            }, 1)
        }
    }
}

FacebookToken.init_insert_facebook_token_die = async function () {
    setInterval(function () {
        FacebookToken.insert_facebook_token_die();
    }, 30 * 1000)
}

FacebookToken.refresh_token = async function () {
    var model = FacebookToken.get_model();
    var list = await model.query(`
        select * from facebook_bots a 
        where a.is_delete = 0 and 
        a.facebook_id in (select facebook_id from facebook_token where status = 0 and is_delete = 0 and group_name = '` + FacebookToken.get_ip_server() + `')
    `);
    return GlobalFunction.runMultiRequest(list, async function (data, index) {
        var item = data[index];
        var rs_token = await GlobalFacebook.refresh_token(item.mobile_phone ? item.mobile_phone : item.email, item.pass);
        if (rs_token && rs_token.access_token) {
            console.log('refresh thanh cong', item.facebook_id, item.name, rs_token);
            return model.query(`update facebook_token set token = '` + rs_token.access_token + `',status = 1, is_delete = 0, error_message = null 
                    where facebook_id = '` + rs_token.uid + `';
            `);
        } else {
            console.log('khong lay duoc token', item.facebook_id, item.name, rs_token);
            return Promise.resolve(false);
        }
    })
}

exports = module.exports = FacebookToken;