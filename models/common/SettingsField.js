var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
SettingsField = GlobalFunction.cloneFunc(GlobalActiveRecord);
SettingsField.prototype.tableName = function() {
    return 'settings_field';
}
SettingsField.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
SettingsField.prototype.LABEL = {
    "field_id": "Field Id",
    "form_id": "Form Id",
    "field_name": "Field Name",
    "mapping_id": "Mapping Id",
    "label": "Label",
    "field_type": "Field Type",
    "required": "Required",
    "field_options": "Field Options",
    "cid": "Cid",
    "table_id": "Table Id",
    "status": "Status",
    "js": "Js",
    "multi_add": "Multi Add"
};
SettingsField.prototype.RULE = {
    "field_id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "form_id": {
        "default": "0",
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 7
    },
    "field_name": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 50
        },
        "size": 50
    },
    "mapping_id": {
        "default": "0",
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 8
    },
    "label": {
        "type": "text",
        "require": {
            "empty": true,
            "size": 65535
        }
    },
    "field_type": {
        "default": "",
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 20
        },
        "size": 20
    },
    "required": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "field_options": {
        "type": "text",
        "require": {
            "empty": true,
            "size": 65535
        }
    },
    "cid": {
        "default": "",
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 20
        },
        "size": 20
    },
    "table_id": {
        "default": "0",
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 7
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "js": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "multi_add": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    }
};

exports = module.exports = SettingsField;