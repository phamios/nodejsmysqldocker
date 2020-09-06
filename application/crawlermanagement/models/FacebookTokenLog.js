var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
FacebookTokenLog = GlobalFunction.cloneFunc(GlobalActiveRecord);
FacebookTokenLog.prototype.tableName = function() {
    return 'facebook_token_log';
}
FacebookTokenLog.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
FacebookTokenLog.prototype.LABEL = {
    "id": "Id",
    "facebook_token_id": "Facebook Token Id",
    "date_log": "Date Log",
    "count_valid": "Count Valid",
    "count_error": "Count Error",
    "count_all": "Count All",
    "uni_key": "Uni key"
};
FacebookTokenLog.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "facebook_token_id": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "facebook_token",
            "ref_id": "id"
        }
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
    "fk_table_facebook_token_id": {
        "type": "any"
    },
    "uni_key": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 25
        },
        "size": 25
    }
};

exports = module.exports = FacebookTokenLog;