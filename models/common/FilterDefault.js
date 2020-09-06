var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
FilterDefault = GlobalFunction.cloneFunc(GlobalActiveRecord);
FilterDefault.prototype.tableName = function() {
    return 'filter_default';
}
FilterDefault.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
FilterDefault.prototype.LABEL = {
    "id": "Id",
    "admin_table": "Admin Table",
    "name": "Name",
    "role": "Role",
    "order_db": "Order Db",
    "limit_db": "Limit Db",
    "priority": "Priority",
    "default": "Default",
    "value": "Value",
    "list_filter_default_field": "list_filter_default_field"
};
FilterDefault.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "admin_table": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "admin_table",
            "ref_id": "id"
        }
    },
    "name": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "value": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "role": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "role",
            "ref_id": "id"
        }
    },
    "fk_table_admin_table": {
        "type": "any",
        "fk": {
            "table": "admin_table",
            "ref_id": "id"
        }
    },
    "fk_table_role": {
        "type": "any"
    },
    "list_filter_default_field": {
        "type": "array",
        "model": "filter_default_field",
        "fk_id": "filter_default"
    },
    "order_db": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "limit_db": {
        "type": "int",
        "size": 11
    },
    "priority": {
        "default": "0",
        "type": "int",
        "size": 11
    },
    "default": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    }
};

FilterDefault.prototype.create_new_item_all = function(admin_table)  {
    var def = Q.defer();
    var list = [], count = 0;
    var that = this;
    for(var i in this.req.user.user_role_mul) {
        var item = this.req.user.user_role_mul[i];
        list[i] = new FilterDefault();
        var model_table = this.get_class_by_table_name(admin_table.table_name);
        list[i].setAttributes({
            name            : 'Tất cả',
            admin_table     : admin_table.id,
            order_db        : CONFIG.MYSQL[model_table.db_key] ? 'created_time DESC' : (model_table.getPrimaryKey() + ' DESC'),
            limit_db        : 20,
            role            : item,
            default         : 1,
        });
        list[i].save(false).then(rs => {
            count++;
            if(count == that.req.user.user_role_mul.length) {
                def.resolve(true);
            }
        })
    }
    return def.promise;
}

exports = module.exports = FilterDefault;