var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
SettingsMenuAdmin = GlobalFunction.cloneFunc(GlobalActiveRecord);
SettingsMenuAdmin.prototype.tableName = function() {
    return 'settings_menu_admin';
}
SettingsMenuAdmin.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
SettingsMenuAdmin.prototype.LABEL = {
    "id": "Id",
    "pid": "Pid",
    "name": "Name",
    "link": "Link",
    "icon": "Icon",
    "odr": "Odr",
    "status": "Status",
    "module": "Module",
    "controller": "Controller",
    "action": "Action",
    "table_id": "Table Id",
    "onclick": "Onclick",
    "add": "Add",
    "delete": "Delete",
    "copy": "Copy",
    "view": "View",
    "onclickedit": "Onclickedit",
    "edit": "Edit",
    "onclickadd": "Onclickadd",
    "multi_add": "Multi Add"
};
SettingsMenuAdmin.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 5
    },
    "pid": {
        "default": "0",
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 8
    },
    "name": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "link": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "icon": {
        "type": "varchar",
        "require": {
            "size": 50
        },
        "size": 50
    },
    "odr": {
        "type": "int",
        "size": 5
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "module": {
        "type": "varchar",
        "require": {
            "size": 50
        },
        "size": 50
    },
    "controller": {
        "type": "varchar",
        "require": {
            "size": 50
        },
        "size": 50
    },
    "action": {
        "type": "varchar",
        "require": {
            "size": 50
        },
        "size": 50
    },
    "table_id": {
        "default": "0",
        "type": "int",
        "size": 10
    },
    "onclick": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "add": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "delete": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "copy": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "view": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "onclickedit": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "edit": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "onclickadd": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "multi_add": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    }
};

exports = module.exports = SettingsMenuAdmin;