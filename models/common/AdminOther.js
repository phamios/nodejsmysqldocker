var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
AdminOther = GlobalFunction.cloneFunc(GlobalActiveRecord);
AdminOther.prototype.tableName = function() {
    return 'admin_other';
}
AdminOther.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
AdminOther.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "status": "Status"
};
AdminOther.prototype.RULE = {
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
            "size": 20
        },
        "size": 20
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    }
};

exports = module.exports = AdminOther;