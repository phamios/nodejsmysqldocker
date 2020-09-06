var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
AdminPageCell = GlobalFunction.cloneFunc(GlobalActiveRecord);
AdminPageCell.prototype.tableName = function() {
    return 'admin_page_cell';
}
AdminPageCell.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
AdminPageCell.prototype.LABEL = {
    "id": "Id",
    "admin_page_line": "Admin Page Line",
    "admin_other": "Admin Template",
    "admin_table": "Admin Table",
    "admin_form": "Admin Form",
    "type": "Type",
    "status": "Status",
    "priority": "Priority"
};
AdminPageCell.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "admin_page_line": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "admin_page_line",
            "ref_id": "id"
        }
    },
    "admin_other": {
        "type": "int",
        "size": 11,
        "fk": {
            "table": "admin_other",
            "ref_id": "id"
        }
    },
    "admin_table": {
        "type": "int",
        "size": 11,
        "fk": {
            "table": "admin_table",
            "ref_id": "id"
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
    "type": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
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
    "fk_table_admin_other": {
        "type": "any",
        "update_id": "admin_other",
        "fk": {
            "table": "admin_other",
            "ref_id": "id"
        }
    },
    "fk_table_admin_table": {
        "type": "any",
        "update_id": "admin_table",
        "fk": {
            "table": "admin_table",
            "ref_id": "id"
        }
    },
    "fk_table_admin_form": {
        "type": "any",
        "update_id": "admin_form",
        "fk": {
            "table": "admin_form",
            "ref_id": "id"
        }
    },
    "fk_table_admin_page_line": {
        "type": "any"
    }
};

exports = module.exports = AdminPageCell;