var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
AdminFormField = GlobalFunction.cloneFunc(GlobalActiveRecord);
AdminFormField.prototype.tableName = function() {
    return 'admin_form_field';
}
AdminFormField.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
AdminFormField.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "attribute": "Attribute",
    "field_type": "Field Type",
    "field_options": "Field Options",
    "status": "Status",
    "require": "Require",
    "admin_form_tab": "Admin Form Tab",
    "data": "Data",
    "priority": "Priority",
    "event_trigger": "Event Trigger"
};
AdminFormField.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "attribute": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "name": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
    "field_type": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "field_options": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "require": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "admin_form_tab": {
        "type": "int",
        "size": 11,
        "fk": {
            "table": "admin_form_tab",
            "ref_id": "id"
        }
    },
    "fk_table_admin_form_tab": {
        "type": "any"
    },
    "data": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "priority": {
        "type": "int",
        "size": 11
    },
    "event_trigger": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    }
};

exports = module.exports = AdminFormField;