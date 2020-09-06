var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var md5 = require('md5');
var Promise = require('promise');
SettingsToken = GlobalFunction.cloneFunc(GlobalActiveRecord);
SettingsToken.prototype.tableName = function() {
    return 'settings_token';
}
SettingsToken.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
SettingsToken.prototype.LABEL = {
    "id": "Id",
    "token": "Token",
    "obj_id": "Obj Id",
    "obj_table": "Obj Table",
    "expired": "Expired",
    "type": "Type",
    "content": "Content",
    "obj_type": "Obj Type"
};
SettingsToken.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "token": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "obj_id": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11
    },
    "expired": {
        "type": "date"
    },
    "obj_table": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "type": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 20
        },
        "size": 20
    }
};

SettingsToken.prototype.create_token = function(type, obj_id, obj_table, expired = null) {
    this.type = type;
    this.obj_id = obj_id;
    this.obj_table = obj_table;
    this.expired = null;
    
    this.token = md5(GlobalFunction.newDate().getTime() + GlobalFunction.rand(1000000, 100000000000));
    return this.deleteAll({
        obj_id: this.obj_id,
        obj_table: this.obj_table,
        type: this.type,
    }).then(r => {
        return this.save(false);
    })
    
}

exports = module.exports = SettingsToken;