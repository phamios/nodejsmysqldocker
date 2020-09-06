var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
Sendemail = GlobalFunction.cloneFunc(GlobalActiveRecord);
Sendemail.prototype.tableName = function() {
    return 'sendemail';
}
Sendemail.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
Sendemail.prototype.LABEL = {
    "id": "Id",
    "email": "Email",
    "title": "Title",
    "content": "Content",
    "link": "Link"
};
Sendemail.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "email": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255,
            "email": true
        },
        "size": 255
    },
    "title": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "content": {
        "type": "longtext",
        "require": {
            "empty": true,
            "size": 4294967295
        }
    },
    "link": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    }
};

exports = module.exports = Sendemail;