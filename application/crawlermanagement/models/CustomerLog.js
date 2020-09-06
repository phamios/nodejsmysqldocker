var GlobalActiveRecord = require('../../../core/global_activerecord');
const GlobalFunction = require('../../../core/global_function');
var CONFIG = require('../../../config/config');
var Q = require('q');
var Promise = require('promise');
CustomerLog = GlobalFunction.cloneFunc(GlobalActiveRecord);
CustomerLog.prototype.tableName = function() {
    return 'customer_log';
}
CustomerLog.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
CustomerLog.prototype.LABEL = {
    "id": "Id",
    "customer_id": "Customer Id",
    "date_log": "Date Log",
    "count_valid": "Count Valid",
    "count_error": "Count Error",
    "count_all": "Count All",
    "uni_key": "Uni Key"
};
CustomerLog.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "customer_id": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "customer",
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
    "fk_table_customer_id": {
        "type": "any"
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

exports = module.exports = CustomerLog;