var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
AdminPageLine = GlobalFunction.cloneFunc(GlobalActiveRecord);
AdminPageLine.prototype.tableName = function() {
    return 'admin_page_line';
}
AdminPageLine.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
AdminPageLine.prototype.LABEL = {
    "id": "Id",
    "admin_page": "Admin Page",
    "status": "Status",
    "priority": "Priority",
    "quantity": "Quantity"
};
AdminPageLine.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "admin_page": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "admin_page",
            "ref_id": "id"
        }
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "priority": {
        "default": "0",
        "type": "int",
        "size": 11
    },
    "fk_table_admin_page": {
        "type": "any"
    },
    "quantity": {
        "default": "1",
        "type": "int",
        "size": 11
    },
    "list_admin_page_cell": {
        "type": "array",
        "model": "admin_page_cell",
        "fk_id": "admin_page_line"
    }
};
AdminPageLine.prototype.display_attr = 'id';

exports = module.exports = AdminPageLine;