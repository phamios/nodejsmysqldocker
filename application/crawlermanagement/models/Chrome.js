var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
Chrome = GlobalFunction.cloneFunc(GlobalActiveRecord);
Chrome.prototype.tableName = function() {
    return 'chrome';
}
Chrome.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
Chrome.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "instance_id": "Instance Id",
    "is_delete": "Is Delete"
};
Chrome.prototype.RULE = {
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
            "size": 50
        },
        "size": 50
    },
    "instance_id": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11
    },
    "is_delete": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    }
};

exports = module.exports = Chrome;