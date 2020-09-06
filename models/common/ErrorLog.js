var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
ErrorLog = GlobalFunction.cloneFunc(GlobalActiveRecord);
ErrorLog.prototype.tableName = function() {
    return 'error_log';
}
ErrorLog.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
ErrorLog.prototype.LABEL = {
    "error_id": "Error Id",
    "link": "Link",
    "content": "Content",
    "code": "Code",
    "link_prev": "Link Prev",
    "message": "Message",
    "error_line": "Error Line",
    "error_ip": "Error Ip",
    "device": "Device"
};
ErrorLog.prototype.RULE = {
    "error_id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 10
    },
    "link": {
        "type": "varchar",
        "require": {
            "size": 500
        },
        "size": 500
    },
    "content": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "code": {
        "type": "int",
        "size": 5
    },
    "link_prev": {
        "type": "varchar",
        "require": {
            "size": 500
        },
        "size": 500
    },
    "message": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "error_line": {
        "type": "varchar",
        "require": {
            "size": 500
        },
        "size": 500
    },
    "error_ip": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    },
    "device": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    }
};

exports = module.exports = ErrorLog;