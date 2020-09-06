var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
SettingsStatistical = GlobalFunction.cloneFunc(GlobalActiveRecord);
SettingsStatistical.prototype.tableName = function() {
    return 'settings_statistical';
}
SettingsStatistical.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
SettingsStatistical.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "sql": "Sql",
    "icon": "Icon",
    "link": "Link",
    "odr": "Odr",
    "status": "Status"
};
SettingsStatistical.prototype.RULE = {
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
    "sql": {
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
    "link": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "odr": {
        "default": "99",
        "type": "int",
        "size": 7
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    }
};

exports = module.exports = SettingsStatistical;