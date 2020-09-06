var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
SettingsMapping = GlobalFunction.cloneFunc(GlobalActiveRecord);
SettingsMapping.prototype.tableName = function() {
    return 'settings_mapping';
}
SettingsMapping.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
SettingsMapping.prototype.LABEL = {
    "mapping_id": "Mapping Id",
    "mapping_name": "Mapping Name",
    "select_id": "Select Id",
    "select_name": "Select Name",
    "table_name": "Table Name",
    "where": "Where",
    "status": "Status",
    "odr": "Odr",
    "cal_func": "Cal Func",
    "group_by": "Group By",
    "class": "Class"
};
SettingsMapping.prototype.RULE = {
    "mapping_id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 8
    },
    "mapping_name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "select_id": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "select_name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "table_name": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
    "where": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 4
    },
    "odr": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "cal_func": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "group_by": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "class": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    }
};

exports = module.exports = SettingsMapping;