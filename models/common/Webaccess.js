var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
Webaccess = GlobalFunction.cloneFunc(GlobalActiveRecord);
Webaccess.prototype.tableName = function() {
    return 'webaccess';
}
Webaccess.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
Webaccess.prototype.LABEL = {
    "id": "Id",
    "table": "Table",
    "table_id": "Table Id",
    "pagelink": "Pagelink",
    "pagelinkpre": "Pagelinkpre",
    "search_name": "Search Name",
    "search_engine": "Search Engine",
    "ip": "Ip",
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
Webaccess.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 12
    },
    "table": {
        "default": "0",
        "type": "int",
        "size": 4
    },
    "table_id": {
        "default": "0",
        "type": "int",
        "size": 12
    },
    "pagelink": {
        "default": "",
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "pagelinkpre": {
        "default": "",
        "type": "varchar",
        "require": {
            "size": 1000
        },
        "size": 1000
    },
    "search_name": {
        "default": "",
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "search_engine": {
        "default": "0",
        "type": "tinyint",
        "size": 2
    },
    "ip": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
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
        "size": 3
    },
    "year": {
        "default": "0",
        "type": "int",
        "size": 6
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
            "size": 40
        },
        "size": 40
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

exports = module.exports = Webaccess;