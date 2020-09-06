var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
AdminFormTab = GlobalFunction.cloneFunc(GlobalActiveRecord);
AdminFormTab.prototype.tableName = function() {
    return 'admin_form_tab';
}
AdminFormTab.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
AdminFormTab.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "description": "Description",
    "content": "Content",
    "admin_form": "Admin Form",
    "status": "Status",
    "hidden": "Hidden",
    "line": "Line",
    "priority": "priority",
    "parent_id": "Parent Id",
    "list_admin_form_field": "list_admin_form_field"
};
AdminFormTab.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 8
    },
    "name": {
        "default": "",
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "description": {
        "type": "varchar",
        "require": {
            "size": 1000
        },
        "size": 1000
    },
    "content": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "admin_form": {
        "type": "int",
        "size": 11,
        "fk": {
            "table": "admin_form",
            "ref_id": "id"
        }
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
    "priority": {
        "default": "0",
        "type": "tinyint",
        "size": 3
    },
    "fk_table_admin_form": {
        "type": "any"
    },
    "list_admin_form_field": {
        "type": "array",
        "model": "admin_form_field",
        "fk_id": "admin_form_tab"
    },
    "parent_id": {
        "type": "int",
        "size": 11
    }
};

exports = module.exports = AdminFormTab;