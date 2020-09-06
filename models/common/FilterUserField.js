var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
FilterUserField = GlobalFunction.cloneFunc(GlobalActiveRecord);
FilterUserField.prototype.tableName = function() {
    return 'filter_user_field';
}
FilterUserField.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
FilterUserField.prototype.LABEL = {
    "id": "Id",
    "filter_user": "Filter User",
    "admin_table_column": "Admin Table Column",
    "value": "Value",
    "type": "Type",
    "filter_default_field": "Filter Default Field"
};
FilterUserField.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "filter_user": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "filter_user",
            "ref_id": "id"
        }
    },
    "admin_table_column": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "admin_table_column",
            "ref_id": "id"
        }
    },
    "value": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "fk_table_filter_user": {
        "type": "any"
    },
    "fk_table_admin_table_column": {
        "type": "any"
    },
    "type": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "filter_default_field": {
        "type": "int",
        "size": 11,
        // "fk": {
        //     "table": "filter_default_field",
        //     "ref_id": "id"
        // }
    },
    "fk_table_filter_default_field": {
        "type": "any"
    }
};

exports = module.exports = FilterUserField;