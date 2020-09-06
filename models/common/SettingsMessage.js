var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
SettingsMessage = GlobalFunction.cloneFunc(GlobalActiveRecord);
SettingsMessage.prototype.tableName = function() {
    return 'settings_message';
}
SettingsMessage.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
SettingsMessage.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "message_key": "Message Key",
    "message_value": "Message Value",
    "lang": "Lang"
};
SettingsMessage.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "name": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "message_key": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "message_value": {
        "type": "text",
        "require": {
            "empty": true,
            "size": 65535
        }
    },
    "lang": {
        "type": "varchar",
        "require": {
            "size": 5
        },
        "size": 5
    }
};

exports = module.exports = SettingsMessage;