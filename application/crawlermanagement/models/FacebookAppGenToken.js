var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
FacebookAppGenToken = GlobalFunction.cloneFunc(GlobalActiveRecord);
FacebookAppGenToken.prototype.tableName = function() {
    return 'facebook_app_gen_token';
}
FacebookAppGenToken.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
FacebookAppGenToken.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "app_secret": "App Secret",
    "app_key": "App Key",
    "status": "Status",
    "is_delete": "Is Delete",
    "app_id": "App Id"
};
FacebookAppGenToken.prototype.RULE = {
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
    "app_secret": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 50
        },
        "size": 50
    },
    "app_key": {
        "type": "varchar",
        "require": {
            "size": 50
        },
        "size": 50
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "is_delete": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "app_id": {
        "default": "NULL",
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    }
};

exports = module.exports = FacebookAppGenToken;