var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
RoleGroup = GlobalFunction.cloneFunc(GlobalActiveRecord);
RoleGroup.prototype.tableName = function() {
    return 'role_group';
}
RoleGroup.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
RoleGroup.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "status": "Status",
    "role_item": "Role Item"
};
RoleGroup.prototype.RULE = {
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
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "role_item": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    }
};

exports = module.exports = RoleGroup;