var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
const GlobalCache = require('../../core/global_cache');
var Q = require('q');
var Promise = require('promise');
RoleItem = GlobalFunction.cloneFunc(GlobalActiveRecord);
RoleItem.prototype.tableName = function() {
    return 'role_item';
}
RoleItem.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
RoleItem.prototype.LABEL = {
    "role_role_item_mul": "role_role_item_mul",
    "id": "Id",
    "name": "Name",
    "action": "Action",
    "status": "Status",
    "table": "Table",
    "priority": "Priority"
};
RoleItem.prototype.RULE = {
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
    "action": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "table": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "priority": {
        "default": "1000",
        "type": "int",
        "size": 11
    },
    "role_role_item_mul": {
        "type": "array",
        "size": 11,
        "mul_id": "role_item_id",
        "mul_id_fk": "role_id",
        "fk": {
            "table": "role",
            "ref_id": "id"
        }
    }
};

RoleItem.prototype.afterInsert = function() {
    GlobalActiveRecord.prototype.afterInsert(this, arguments);
    GlobalCache.remove_cache_mul_by_table_name('user');
}

RoleItem.prototype.afterUpdate = function(attributes_change, attributes_old, attributes_new) {
    GlobalActiveRecord.prototype.afterUpdate(this, arguments);
    GlobalCache.remove_cache_mul_by_table_name('user');
    return Promise.resolve(true);
    
}

RoleItem.prototype.afterDelete = function() {
    GlobalActiveRecord.prototype.afterDelete(this, arguments);
    GlobalCache.remove_cache_mul_by_table_name('user');

}

RoleItem.autoCreateItemByTable = async function(table_name) {
    var list = ['read','create','update','delete'];
    var data_insert = [];
    for(var item of list) {
        data_insert.push({
            name    : table_name + ' - ' + item,
            action  : item,
            table   : table_name,
            status  : 1,
            priority: 1,
        });
    }
    var model = new RoleItem();
    var a = await model.insertMany(data_insert);
    if(a){}
    console.log('tao role cho ' + table_name + ' thanh cong');
    return a;
}

exports = module.exports = RoleItem;