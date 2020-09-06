var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
AdminPage = GlobalFunction.cloneFunc(GlobalActiveRecord);
AdminPage.prototype.tableName = function() {
    return 'admin_page';
}
AdminPage.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
AdminPage.prototype.LABEL = {
    "id": "Id",
    "pid": "Pid",
    "name": "Name",
    "link": "Link",
    "icon": "Icon",
    "odr": "Odr",
    "status": "Status",
    "controller": "Controller"
};
AdminPage.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 5
    },
    "pid": {
        "default": "0",
        "type": "int",
        "size": 11,
        "fk": {
            "table": "admin_page",
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
    "controller": {
        "type": "varchar",
        "require": {
            "size": 50
        },
        "size": 50
    },
    "list_admin_page_line": {
        "type": "array",
        "model": "admin_page_line",
        "fk_id": "admin_page"
    },
    "fk_table_pid": {
        "type": "any"
    }
};

exports = module.exports = AdminPage;