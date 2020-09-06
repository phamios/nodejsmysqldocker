var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
FacebookTokenDie = GlobalFunction.cloneFunc(GlobalActiveRecord);
FacebookTokenDie.prototype.tableName = function() {
    return 'facebook_token_die';
}
FacebookTokenDie.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
FacebookTokenDie.prototype.LABEL = {
    "date_log": "Date Log",
    "count_valid": "Count Valid",
    "count_error": "Count Error",
    "count_all": "Count All"
};
FacebookTokenDie.prototype.RULE = {
    "date_log": {
        "type": "date",
        "primary_key": true,
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
    }
};

exports = module.exports = FacebookTokenDie;