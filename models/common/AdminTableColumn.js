var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
AdminTableColumn = GlobalFunction.cloneFunc(GlobalActiveRecord);
AdminTableColumn.prototype.tableName = function() {
    return 'admin_table_column';
}
AdminTableColumn.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
AdminTableColumn.prototype.LABEL = {
    "filter_user_admin_table_column_mul": "filter_user_admin_table_column_mul",
    "user_admin_table_column_mul": "user_admin_table_column_mul",
    "id": "Id",
    "name": "Name",
    "attribute": "Attribute",
    "headeroptions": "Headeroptions",
    "contentoptions": "Contentoptions",
    "sortlinkoptions": "Sortlinkoptions",
    "view": "View",
    "filter": "Filter",
    "column_update": "Update",
    "sort": "Sort",
    "default_sort": "Default Sort",
    "admin_table": "Admin Table",
    "link": "Link",
    "status": "Status",
    "odr": "Odr",
    "disable_display_column": "Disable Display Column",
    "priority_display": "Priority Display",
    "checked": "Checked"
};
AdminTableColumn.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 8
    },
    "name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "attribute": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "headeroptions": {
        "type": "varchar",
        "require": {
            "size": 500
        },
        "size": 500
    },
    "contentoptions": {
        "type": "varchar",
        "require": {
            "size": 500
        },
        "size": 500
    },
    "sortlinkoptions": {
        "type": "varchar",
        "require": {
            "size": 500
        },
        "size": 500
    },
    "view": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "filter": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "column_update": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "sort": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "default_sort": {
        "type": "varchar",
        "size": 255,
        "require": {
            "size": 255
        }
    },
    "admin_table": {
        "default": "0",
        "type": "int",
        "size": 11,
        "fk": {
            "table": "admin_table",
            "ref_id": "id"
        }
    },
    "link": {
        "default": "",
        "type": "varchar",
        "require": {
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
        "type": "int",
        "size": 8
    },
    "fk_table_admin_table": {
        "type": "any"
    },
    "filter_user_admin_table_column_mul": {
        "type": "array",
        "size": 11,
        "mul_id": "admin_table_column_id",
        "mul_id_fk": "filter_user_id",
        "fk": {
            "table": "filter_user",
            "ref_id": "id"
        }
    },
    "user_admin_table_column_mul": {
        "type": "array",
        "size": 11,
        "mul_id": "admin_table_column_id",
        "mul_id_fk": "user_id",
        "fk": {
            "table": "user",
            "ref_id": "id"
        }
    },
    "disable_display_column": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "priority_display": {
        "default": "0",
        "type": "int",
        "size": 11
    },
    "checked": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "show_mobile": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    }
};

exports = module.exports = AdminTableColumn;