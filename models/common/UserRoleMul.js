var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
UserRoleMul = GlobalFunction.cloneFunc(GlobalActiveRecord);
UserRoleMul.prototype.tableName = function() {
    return 'user_role_mul';
}
UserRoleMul.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
UserRoleMul.prototype.LABEL = {
    "user_id": "User Id",
    "role_id": "Role Id"
};
UserRoleMul.prototype.RULE = {
    "user_id": {
        "type": "int",
        "primary_key": true,
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "user",
            "ref_id": "id"
        }
    },
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
    "fk_table_role_id": {
        "type": "any"
    },
    "fk_table_user_id": {
        "type": "any"
    }
};

exports = module.exports = UserRoleMul;