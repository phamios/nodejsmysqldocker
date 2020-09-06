var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
SettingsIcon = GlobalFunction.cloneFunc(GlobalActiveRecord);
SettingsIcon.prototype.tableName = function() {
    return 'settings_icon';
}
SettingsIcon.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
SettingsIcon.prototype.LABEL = {
    "id": "Id",
    "name": "Name"
};
SettingsIcon.prototype.RULE = {
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
            "size": 50
        },
        "size": 50
    }
};

exports = module.exports = SettingsIcon;