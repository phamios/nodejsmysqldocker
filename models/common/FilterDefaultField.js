var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
FilterDefaultField = GlobalFunction.cloneFunc(GlobalActiveRecord);
FilterDefaultField.prototype.tableName = function() {
    return 'filter_default_field';
}
FilterDefaultField.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
FilterDefaultField.prototype.LABEL = {
    "id": "Id",
    "admin_table_column": "Admin Table Column",
    "filter_default": "Filter Default",
    "value": "Value"
};
FilterDefaultField.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
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
    "filter_default": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "filter_default",
            "ref_id": "id"
        }
    },
    "value": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "fk_table_admin_table_column": {
        "type": "any",
        "fk": {
            "table": "admin_table_column",
            "ref_id": "id"
        }
    },
    "fk_table_filter_default": {
        "type": "any"
    }
};

exports = module.exports = FilterDefaultField;