var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
var CustomerLog = require('./CustomerLog');
Customer = GlobalFunction.cloneFunc(GlobalActiveRecord);
Customer.prototype.tableName = function() {
    return 'customer';
}
Customer.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
Customer.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "token": "Token",
    "max_request_day": "Max Request Day",
    "is_delete": "Is Delete",
    "status": "Status"
};
Customer.prototype.RULE = {
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
            "size": 255
        },
        "size": 255
    },
    "token": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "max_request_day": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11
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

Customer.get_model_instance = false;
Customer.get_model = function () {
    if (!Customer.get_model_instance) {
        Customer.get_model_instance = new Customer();
    }
    return Customer.get_model_instance;
}
Customer.list_token_obj = {};
Customer.list_token_id_obj = {};
Customer.get_list_token = async function () {
    var list = await Customer.get_model().findAll({ status: 1 });
    if (list && list.length) {
        var list_id_token = [];
        var list_id_token_obj = [];
        var date_1 = GlobalFunction.newDate();
        date_1.setDate(date_1.getDate() + 1);
        var date_now = GlobalFunction.getDateNow();
        var date_now_1 = GlobalFunction.getDateNow(date_1);
        for(var item of list) {
            Customer.list_token_obj[item.token] = item;
            Customer.list_token_id_obj[item.token] = item.id;
            list_id_token.push(item.id + '_' + date_now);
            list_id_token.push(item.id + '_' + date_now_1);
            list_id_token_obj[item.id + '_' + date_now] = {customer_id:item.id,date_log: date_now};
            list_id_token_obj[item.id + '_' + date_now_1] = {customer_id:item.id,date_log: date_now_1};
        }

        var md_log = Customer.get_model_log_instance();
        md_log.findAll({uni_key: list_id_token}).then(r => {
            for(var item of r) {
                delete list_id_token_obj[item.uni_key];
            }
            var list_data_insert = [];
            for(var uni_key in list_id_token_obj) {
                list_data_insert.push({
                    "uni_key" : uni_key,
                    "customer_id" : list_id_token_obj[uni_key].customer_id,
                    "date_log"  : list_id_token_obj[uni_key].date_log,
                    "count_valid" : 0,
                    "count_error" : 0,
                    "count_all" : 0,
                    "created_time" : parseInt(GlobalFunction.newDate().getTime()/1000)
                });
            }
            if(list_data_insert.length) {
                return md_log.insertMany(list_data_insert);
            }
            return Promise.resolve(true);
        })
    }
    return list;
}

Customer.init_customer = async function () {
    Customer.get_list_token();
    setInterval(function () {
        Customer.get_list_token();
    }, 5 * 60 * 1000);
    setInterval(function () {
        Customer.update_log();
    },30 * 1000);
}

Customer.check_token = function(token) {
    if(Customer.list_token_obj[token] && !Customer.list_obj_max_request_time_day[token]) {
        return true;
    }
    return false;
}

Customer.model_log_instance = false;
Customer.get_model_log_instance = function () {
    if (!Customer.model_log_instance) {
        Customer.model_log_instance = new CustomerLog();
    }
    return Customer.model_log_instance;
}


Customer.list_obj_max_request_time_day = {};
Customer.check_max_request_time_day = async function() {
    var list = await Customer.get_model_log_instance().query(`
        select a.id,a.token,a.max_request_day,count(*) total from customer a
        left join customer_log b ON a.id = b.customer_id and date_log = '` + GlobalFunction.getDateNow() + `'
        where a.is_delete = 0 and a.status = 1
        group by a.id
    `);
    Customer.list_obj_max_request_time_day = {};
    if(list && list.length) {
        for(var item of list) {
            Customer.list_obj_max_request_time_day[item.token] = item.max_request_day > item.total ? false : true;
        }
    }
    return Customer.list_obj_max_request_time_day;
}

Customer.list_obj = {};
Customer.update_log_flag = false;

Customer.update_log = async function() {
    Customer.update_log_flag = true;
    var model = Customer.get_model_log_instance();
    var list_query = [];
    for(var k in Customer.list_obj) {
        if(Customer.list_obj[k].count_valid || Customer.list_obj[k].count_error) {
            list_query.push(`update customer_log set `
            +  `count_valid = count_valid ` + (Customer.list_obj[k].count_valid ? (' + ' + Customer.list_obj[k].count_valid ) : '')
            + ',count_error = count_error ' + (Customer.list_obj[k].count_error ? (' + ' + Customer.list_obj[k].count_error ) : '')
            + ',count_all = count_all + ' + Customer.list_obj[k].count_all
            + ',modified_time = ' + parseInt(GlobalFunction.newDate().getTime()/1000)
            + ` WHERE uni_key = '` + k + `'`);
        }
        Customer.list_obj[k].count_valid = 0;
        Customer.list_obj[k].count_error = 0;
        Customer.list_obj[k].count_all = 0;
    }
    if(list_query.length) {
        GlobalFunction.runMultiRequest(list_query,async function(data,index){
            return model.query(data[index]);
        },1);
    }
    return Promise.resolve(true);
}

Customer.log_by_token = function(token,flag) {
    var date = GlobalFunction.getDateNow();
    var key = Customer.list_token_id_obj[token] + '_' + date;
    if(!Customer.list_obj[key]) {
        Customer.list_obj[key] = {
            "uni_key" : key,
            "customer_id" : Customer.list_token_id_obj[token],
            "date_log"  : date,
            "count_valid" : 0,
            "count_error" : 0,
            "count_all" : 0,
            "created_time" : parseInt(GlobalFunction.newDate().getTime()/1000)
        };
    }
    Customer.list_obj[key].count_all++;
    if(flag) {
        Customer.list_obj[key].count_valid++;
    } else {
        Customer.list_obj[key].count_error++;
    }
}

exports = module.exports = Customer;