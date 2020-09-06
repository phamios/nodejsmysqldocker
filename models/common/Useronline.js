var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
Useronline = GlobalFunction.cloneFunc(GlobalActiveRecord);
Useronline.prototype.tableName = function() {
    return 'useronline';
}
Useronline.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
Useronline.prototype.LABEL = {
    "id": "Id",
    "ip": "Ip",
    "type": "Type",
    "timeindate": "Timeindate",
    "weekday": "Weekday",
    "month": "Month",
    "year": "Year",
    "city": "City",
    "country": "Country",
    "loc": "Loc",
    "org": "Org",
    "region": "Region",
    "ismobile": "Ismobile"
};
Useronline.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 12
    },
    "ip": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    },
    "type": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "timeindate": {
        "default": "0",
        "type": "int",
        "size": 12
    },
    "weekday": {
        "default": "0",
        "type": "tinyint",
        "size": 2
    },
    "month": {
        "default": "1",
        "type": "tinyint",
        "size": 2
    },
    "year": {
        "default": "0",
        "type": "int",
        "size": 5
    },
    "city": {
        "type": "varchar",
        "require": {
            "size": 100
        },
        "size": 100
    },
    "country": {
        "type": "varchar",
        "require": {
            "size": 100
        },
        "size": 100
    },
    "loc": {
        "type": "varchar",
        "require": {
            "size": 30
        },
        "size": 30
    },
    "org": {
        "type": "varchar",
        "require": {
            "size": 100
        },
        "size": 100
    },
    "region": {
        "type": "varchar",
        "require": {
            "size": 100
        },
        "size": 100
    },
    "ismobile": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 20
        },
        "size": 20
    }
};

exports = module.exports = Useronline;