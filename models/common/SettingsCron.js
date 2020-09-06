var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
SettingsCron = GlobalFunction.cloneFunc(GlobalActiveRecord);
SettingsCron.prototype.tableName = function() {
    return 'settings_cron';
}
SettingsCron.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
SettingsCron.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "table_name": "Table Name",
    "attr_in": "Attr In",
    "attr_out": "Attr Out",
    "link_cron_out": "Link Cron Out",
    "status": "Status",
    "tag_out": "Tag Out",
    "attr_id": "Attr Id",
    "tag_parent_out": "Tag Parent Out",
    "page_format": "Page Format",
    "class_name": "Class Name",
    "content_log": "Content Log",
    "condition_save": "Condition Save",
    "cron": "Cron"
};
SettingsCron.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 10
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
    "table_name": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 50
        },
        "size": 50
    },
    "attr_in": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "attr_out": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "link_cron_out": {
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
    "tag_out": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "attr_id": {
        "default": "0",
        "type": "int",
        "size": 10
    },
    "tag_parent_out": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "page_format": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "class_name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "content_log": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "condition_save": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "cron": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    }
};

exports = module.exports = SettingsCron;