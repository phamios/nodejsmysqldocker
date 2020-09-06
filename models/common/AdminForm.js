var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
AdminForm = GlobalFunction.cloneFunc(GlobalActiveRecord);
AdminForm.prototype.tableName = function() {
    return 'admin_form';
}
AdminForm.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
AdminForm.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "description": "Description",
    "content": "Content",
    "table_name": "Table Name",
    "status": "Status",
    "odr": "Odr",
    "multi_add": "Multi Add",
    "create_name": "Create Name",
    "edit_name": "Edit Name",
    "template": "Template",
    "list_admin_form_tab": "list_admin_form_tab"
};
AdminForm.prototype.RULE = {
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
    "table_name": {
        "default": "0",
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "status": {
        "default": "1",
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
    },
    "list_admin_form_tab": {
        "type": "array",
        "model": "admin_form_tab",
        "fk_id": "admin_form"
    },
    "create_name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "edit_name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "template": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    }
};

exports = module.exports = AdminForm;