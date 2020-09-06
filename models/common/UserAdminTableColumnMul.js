var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
UserAdminTableColumnMul = GlobalFunction.cloneFunc(GlobalActiveRecord);
UserAdminTableColumnMul.prototype.tableName = function() {
    return 'user_admin_table_column_mul';
}
UserAdminTableColumnMul.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
UserAdminTableColumnMul.prototype.LABEL = {
    "user_id": "User Id",
    "admin_table_column_id": "Admin Table Column Id"
};
UserAdminTableColumnMul.prototype.RULE = {
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
    "admin_table_column_id": {
        "type": "int",
        "primary_key": true,
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "admin_table_column",
            "ref_id": "id"
        }
    },
    "fk_table_user_id": {
        "type": "any"
    },
    "fk_table_admin_table_column_id": {
        "type": "any"
    }

};


UserAdminTableColumnMul.prototype.updateValue = function(condition){
    var userColumns = new UserAdminTableColumnMul();
    var userColumnsUpdate;
    var userId = condition['userId'];
    var columns = condition['columns'];
    var def = Q.defer();
    return userColumns.deleteAll({'user_id': userId}, true).then(rs=>{
        if(rs){
            for(var i in columns){
                userColumnsUpdate = new UserAdminTableColumnMul();
                userColumnsUpdate['user_id'] = userId;
                userColumnsUpdate['admin_table_column_id'] = columns[i];
                userColumnsUpdate.save().then(rs=>{
                    if(rs){
                        def.resolve(true);
                    }else{
                        def.resolve(false);
                    }
                });
            }
        }
        return def.promise;
    });
}

exports = module.exports = UserAdminTableColumnMul;