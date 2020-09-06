var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
SettingsWebcron = GlobalFunction.cloneFunc(GlobalActiveRecord);
SettingsWebcron.prototype.tableName = function() {
    return 'settings_webcron';
}
SettingsWebcron.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
SettingsWebcron.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "directory": "Directory",
    "link": "Link",
    "domain": "Domain",
    "show_log": "Show Log",
    "content_file": "Content File",
    "type": "Type",
    "layout": "Layout",
    "rewrite": "Rewrite",
    "head": "Head"
};
SettingsWebcron.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "directory": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "link": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "domain": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "show_log": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "content_file": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "type": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "layout": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "rewrite": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "head": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    }
};

exports = module.exports = SettingsWebcron;