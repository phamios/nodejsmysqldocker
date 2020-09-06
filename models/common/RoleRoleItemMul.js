var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
RoleRoleItemMul = GlobalFunction.cloneFunc(GlobalActiveRecord);
RoleRoleItemMul.prototype.tableName = function() {
    return 'role_role_item_mul';
}
RoleRoleItemMul.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
RoleRoleItemMul.prototype.LABEL = {
    "role_id": "Role Id",
    "role_item_id": "Role Item Id"
};
RoleRoleItemMul.prototype.RULE = {
    "role_id": {
        "type": "int",
        "primary_key": true,
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "role",
            "ref_id": "id"
        }
    },
    "role_item_id": {
        "type": "int",
        "primary_key": true,
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "role_item",
            "ref_id": "id"
        }
    },
    "fk_table_role_item_id": {
        "type": "any"
    },
    "fk_table_role_id": {
        "type": "any"
    }
};

exports = module.exports = RoleRoleItemMul;