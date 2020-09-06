var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
Instance = GlobalFunction.cloneFunc(GlobalActiveRecord);
Instance.prototype.tableName = function() {
    return 'instance';
}
Instance.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
Instance.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "ip": "Ip",
    "status": "Status",
    "username": "Username",
    "pass": "Pass",
    "count_app_chrome": "Count App Chrome",
    "is_delete": "Is Delete"
};
Instance.prototype.RULE = {
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
    "ip": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 20
        },
        "size": 20
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "require": {
            "empty": true
        },
        "size": 1
    },
    "username": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "pass": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "count_app_chrome": {
        "type": "tinyint",
        "require": {
            "empty": true
        },
        "size": 4
    },
    "is_delete": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    }
};

exports = module.exports = Instance;