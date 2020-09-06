var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var md5 = require('md5');
var Q = require('q');
var Promise = require('promise');
Changepassword = GlobalFunction.cloneFunc(GlobalActiveRecord);
Changepassword.prototype.tableName = function() {
    return 'user';
}
Changepassword.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
Changepassword.prototype.LABEL = {
    password: "Mật khẩu hiện tại",
    oldPassword: 'Mật khẩu cũ',
    newPassword: 'Mật khẩu mới',
    confirmPassword: 'Mật khẩu xác nhận',
};
Changepassword.prototype.RULE = {
    'id': {
        type: 'int',
        primary_key: true,
    },
    "password": {
        "type": "varchar",
        "require": {
            "empty": true,
            "size": 255
        },
        "size": 255
    },
    "oldPassword": {
        "type": "varchar",
        "require": {
            "empty": true,
            "password": true,
            "size": 255,
            "same": {
                "attribute" : "password",
                "message"   : "Mật khẩu hiện tại không đúng"
            }
        },
        "size": 255
    },
    "newPassword": {
        "type": "varchar",
        "require": {
            "empty": true,
            "password": true,
            "func": function() {
                if(this.newPassword && this.oldPassword) {
                    var new_1 = this.newPassword.length < 32 ? this.set_password(this.newPassword) : this.newPassword;
                    var old_1 = this.oldPassword.length < 32 ? this.set_password(this.oldPassword) : this.oldPassword;
                    if(new_1 == old_1) {
                        return "Mật khẩu mới không được trùng với mật khẩu hiện tại";
                    }
                }
                return "";
            },
            "notsame": {
                "attribute": "oldPassword",
                "message": "Mật khẩu mới không được trùng với mật khẩu hiện tại"
            },
            "size": 100
        },
        "size": 100
    },
    "confirmPassword": {
        "type": "varchar",
        "require": {
            "empty": {
                "on": "create"
            },
            "password": true,
            "size": 100,
            "same": {
                "attribute": "newPassword"
            }
        },
        "size": 100
    }
};

Changepassword.prototype.update_password = function() {
    var def = Q.defer();
    this.db.where({id:this.id}).update(this.tableName(), {password: this.set_password(this.newPassword)}, function(err, rows) {
        def.resolve(rows);
    });
    return def.promise;
}

exports = module.exports = Changepassword;