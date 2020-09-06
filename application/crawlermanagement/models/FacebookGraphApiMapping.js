var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var GlobalRequest = require('../../../core/global_request');
var GlobalFile = require('../../../core/global_file');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
FacebookGraphApiMapping = GlobalFunction.cloneFunc(GlobalActiveRecord);
var ApiLog = require('./ApiLog');
FacebookGraphApiMapping.prototype.tableName = function() {
    return 'facebook_graph_api_mapping';
}
FacebookGraphApiMapping.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
FacebookGraphApiMapping.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "source": "Source",
    "description": "Description",
    "type": "Type",
    "link": "Link",
    "is_delete": "Is Delete",
    "end_point": "End Point",
    "input_param": "Input Param",
    "input_default": "Input Default",
    "header": "Header",
    "group": "Group",
    "status": "Status"
};
FacebookGraphApiMapping.prototype.RULE = {
    "id": {
        "type": "bigint",
        "auto_increment": true,
        "primary_key": true,
        "size": 20
    },
    "name": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 100
        },
        "size": 100
    },
    "source": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 1000
        },
        "size": 1000
    },
    "description": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 1000
        },
        "size": 1000
    },
    "type": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 50
        },
        "size": 50
    },
    "link": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 1000
        },
        "size": 1000
    },
    "is_delete": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "end_point": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "input_param": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
    "input_default": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
    "header": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
    "group": {
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
    }
};

FacebookGraphApiMapping.get_model_instance = false;
FacebookGraphApiMapping.get_model = function () {
    if (!FacebookGraphApiMapping.get_model_instance) {
        FacebookGraphApiMapping.get_model_instance = new FacebookGraphApiMapping();
    }
    return FacebookGraphApiMapping.get_model_instance;
}

FacebookGraphApiMapping.get_list_graph_api_obj = false;
FacebookGraphApiMapping.get_list_graph_api = async function () {
    var list = await FacebookGraphApiMapping.get_model().findAll({ status:1 });



    var list_id_app = [];
    var list_id_app_obj = {};
    var date_1 = GlobalFunction.newDate();
    date_1.setDate(date_1.getDate() + 1);
    var date_now = GlobalFunction.getDateNow();
    var date_now_1 = GlobalFunction.getDateNow(date_1);
    for (var item of list) {
        list_id_app.push(item.id + '_' + date_now);
        list_id_app.push(item.id + '_' + date_now_1);
        list_id_app_obj[item.id + '_' + date_now] = {api_id:item.id,date_log: date_now};
        list_id_app_obj[item.id + '_' + date_now_1] = {api_id:item.id,date_log: date_now_1};
    }
    var md_log = FacebookGraphApiMapping.get_model_log_instance();
    md_log.findAll({uni_key: list_id_app}).then(r => {
        for(var item of r) {
            delete list_id_app_obj[item.uni_key];
        }
        var list_data_insert = [];
        for(var uni_key in list_id_app_obj) {
            list_data_insert.push({
                "uni_key" : uni_key,
                "api_id" : list_id_app_obj[uni_key].api_id,
                "date_log"  : list_id_app_obj[uni_key].date_log,
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




    return list;
}

FacebookGraphApiMapping.model_log_instance = false;
FacebookGraphApiMapping.get_model_log_instance = function () {
    if (!FacebookGraphApiMapping.model_log_instance) {
        FacebookGraphApiMapping.model_log_instance = new ApiLog();
    }
    return FacebookGraphApiMapping.model_log_instance;
}

FacebookGraphApiMapping.list_obj = {};
FacebookGraphApiMapping.update_log_flag = false;

FacebookGraphApiMapping.update_log = async function() {
    FacebookGraphApiMapping.update_log_flag = true;
    var model = FacebookGraphApiMapping.get_model_log_instance();
    var list_query = [];
    for(var k in FacebookGraphApiMapping.list_obj) {
        list_query.push(`update api_log set `
        +  `count_valid = count_valid ` + (FacebookGraphApiMapping.list_obj[k].count_valid ? (' + ' + FacebookGraphApiMapping.list_obj[k].count_valid ) : '')
        + ',count_error = count_error ' + (FacebookGraphApiMapping.list_obj[k].count_error ? (' + ' + FacebookGraphApiMapping.list_obj[k].count_error ) : '')
        + ',count_all = count_all + ' + FacebookGraphApiMapping.list_obj[k].count_all
        + ',modified_time = ' + parseInt(GlobalFunction.newDate().getTime()/1000)
        + ` WHERE uni_key = '` + k + `'`);
        FacebookGraphApiMapping.list_obj[k].count_valid = 0;
        FacebookGraphApiMapping.list_obj[k].count_error = 0;
        FacebookGraphApiMapping.list_obj[k].count_all = 0;
    }
    if(list_query.length) {
        GlobalFunction.runMultiRequest(list_query,async function(data,index){
            return model.query(data[index]);
        },1);
    }
    return Promise.resolve(true);
}

FacebookGraphApiMapping.log_by_end_point = function(id,flag) {
    var date = GlobalFunction.getDateNow();
    var key = id + '_' + date;
    if(!FacebookGraphApiMapping.list_obj[key]) {
        FacebookGraphApiMapping.list_obj[key] = {
            "uni_key" : key,
            "api_id" : id,
            "date_log"  : date,
            "count_valid" : 0,
            "count_error" : 0,
            "count_all" : 0,
            "created_time" : parseInt(GlobalFunction.newDate().getTime()/1000)
        };
    }
    FacebookGraphApiMapping.list_obj[key].count_all++;
    if(flag) {
        FacebookGraphApiMapping.list_obj[key].count_valid++;
    } else {
        FacebookGraphApiMapping.list_obj[key].count_error++;
    }
}


FacebookGraphApiMapping.init_server = async function () {
    setInterval(function () {
        FacebookGraphApiMapping.update_log();
    },30 * 1000);
}

FacebookGraphApiMapping.export_me = async function() {
    var model = new FacebookGraphApiMapping();
    var list = await model.query(`select * from facebook_graph_api_mapping where is_delete = 0 and status = 1 and id in (2);`);
    var token = 'EAAAAUaZA8jlABAClL3kPmT2OUuetpszrvvaQ8XwyDR8GPjVZA51GTzkPZBizZCQvSQAayp7fQKW4KD1sXX5OgXnDtOZANrqI5JnejuY7S22MZBtZC2UN4xB6WbsfOAE0rxeOiWffeunfNBNSiXl6RcwsJEWhLikPdrlBjP4QShGY1ZBMxasIZAnwnkfJFv5ZBpYegZD';
    for(var item of list) {

        var link = item.link.replace(/\{(group_id|user_id|object_id)\}/gi,'me');
        var link_file = 'C:/project/db/du_lieu_mau/';
        var data = await GlobalRequest.get(link.replace('{access_token}',token));
        GlobalFile.writeFile(link_file + item.name + '.txt', JSON.stringify(data));
    }
    console.log('thanh cong');
}

exports = module.exports = FacebookGraphApiMapping;