var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
FilterUserAdminTableColumnMul = GlobalFunction.cloneFunc(GlobalActiveRecord);
FilterUserAdminTableColumnMul.prototype.tableName = function() {
    return 'filter_user_admin_table_column_mul';
}
FilterUserAdminTableColumnMul.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
FilterUserAdminTableColumnMul.prototype.LABEL = {
    "filter_user_id": "Filter User Id",
    "admin_table_column_id": "Admin Table Column Id"
};
FilterUserAdminTableColumnMul.prototype.attr_sort = 'id';
FilterUserAdminTableColumnMul.prototype.RULE = {
    "filter_user_id": {
        "type": "int",
        "primary_key": true,
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "filter_user",
            "ref_id": "id"
        }
    },
    "admin_table_column_id": {
        "type": "int",
        "primary_key": true,
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "admin_table_column",
            "ref_id": "id"
        }
    },
    "fk_table_filter_user_id": {
        "type": "any"
    },
    "fk_table_admin_table_column_id": {
        "type": "any"
    }
};

exports = module.exports = FilterUserAdminTableColumnMul;