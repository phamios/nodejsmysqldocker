var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
ApiLog = GlobalFunction.cloneFunc(GlobalActiveRecord);
ApiLog.prototype.tableName = function() {
    return 'api_log';
}
ApiLog.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
ApiLog.prototype.LABEL = {
    "id": "Id",
    "api_id": "Api Id",
    "date_log": "Date Log",
    "count_valid": "Count Valid",
    "count_error": "Count Error",
    "count_all": "Count All",
    "uni_key": "Uni Key"
};
ApiLog.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "api_id": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11
    },
    "date_log": {
        "type": "date",
        "require": {
            "empty": true
        }
    },
    "count_valid": {
        "default": "0",
        "type": "int",
        "size": 11
    },
    "count_error": {
        "default": "0",
        "type": "int",
        "size": 11
    },
    "count_all": {
        "default": "0",
        "type": "int",
        "size": 11
    },
    "uni_key": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 25,
            "unique": true
        },
        "size": 25
    }
};

exports = module.exports = ApiLog;