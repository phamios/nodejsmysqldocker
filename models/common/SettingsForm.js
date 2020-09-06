var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
SettingsForm = GlobalFunction.cloneFunc(GlobalActiveRecord);
SettingsForm.prototype.tableName = function() {
    return 'settings_form';
}
SettingsForm.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
SettingsForm.prototype.LABEL = {
    "form_id": "Form Id",
    "form_name": "Form Name",
    "form_description": "Form Description",
    "fields": "Fields",
    "table_id": "Table Id",
    "status": "Status",
    "hidden": "Hidden",
    "line": "Line",
    "odr": "Odr",
    "multi_add": "Multi Add"
};
SettingsForm.prototype.RULE = {
    "form_id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 8
    },
    "form_name": {
        "default": "",
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "form_description": {
        "default": "",
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 1000
        },
        "size": 1000
    },
    "fields": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
    "table_id": {
        "default": "0",
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 8
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "hidden": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "line": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "odr": {
        "default": "0",
        "type": "tinyint",
        "size": 3
    },
    "multi_add": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    }
};

exports = module.exports = SettingsForm;