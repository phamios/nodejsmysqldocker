var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var md5 = require('md5');
var Q = require('q');
var Promise = require('promise');
User = GlobalFunction.cloneFunc(GlobalActiveRecord);
var mail_settings_require = require('./MailSettings');
var SystemSettingRequire = require('./SystemSetting');
var filter_default_require = require('./FilterDefault');
var filter_default_field_require = require('./FilterDefaultField');
var filter_user_require = require('./FilterUser');
var filter_user_field_require = require('./FilterUserField');
var admin_table_column_require = require('./AdminTableColumn');


var SystemSetting = new SystemSettingRequire();
User.prototype.tableName = function() {
    return 'user';
}
User.prototype.display_attr = 'display_name';
User.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
User.prototype.LABEL = {
    "user_admin_table_column_mul": "user_admin_table_column_mul",
    "user_role_mul": "Role",
    "id": "Id",
    "email": "Email",
    "password": "Password",
    "gender": "Gender",
    "status": "Status",
    "avartar": "Avartar",
    "access_token": "Access Token",
    "auth_key": "Auth Key",
    "app_type": "App Type",
    "birthday": "Birthday",
    "display_name": "Display Name",
    "phone": "Phone",
    "address": "Address",
    "role": "Role",
    "is_delete": "Is Delete",
    "description": "description",
    // "list_filter_user": "list_filter_user"
};

User.prototype.getAttributes = function () {
    let rs = GlobalActiveRecord.prototype.getAttributes.apply(this, arguments);
    rs['fk_table_user_role_mul'] = this.fk_table_user_role_mul;
    var rs_mul = [];
    return rs;
}

User.prototype.RULE = {
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
            "email": true,
            "unique": {
                "where": "`is_delete`=0"
            }
        },
        "size": 255
    },
    "password": {
        "type": "varchar",
        "require": {
            "size": 255,
            "password": true,
        },
        "size": 255
    },
    "gender": {
        "default": "0",
        "type": "int",
        "size": 1
    },
    "status": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "avartar": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "description": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "access_token": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "auth_key": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "app_type": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "birthday": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    },
    "display_name": {
        "type": "varchar",
        "require": {
            "size": 500,
            "empty": true
        },
        "size": 500
    },
    "phone": {
        "type": "varchar",
        "require": {
            "empty": {
                "on": "update"
            },
            "size": 20,
            "phone": true
        },
        "size": 20
    },
    "address": {
        "default": "",
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "role": {
        "type": "varchar",
        "size": 255,
        "require": {
            "size": 255
        }
    },
    "user_role_mul": {
        "type": "array",
        "size": 11,
        "require": {
            "empty": true
        },
        "update_attr": "role",
        "mul_id": "user_id",
        "mul_id_fk": "role_id",
        "fk": {
            "table": "role",
            "ref_id": "id",
            "order_by": "priority asc",
            "findall": function () {
                if(this.req && this.req.user && !GlobalFunction.contains(1, this.req.user.user_role_mul)) {
                    return "id != 1";
                }
            }
        }
    },
    "fk_table_user_role_mul": {
        "type": "any"
    },
    "is_delete": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "fk_table_role": {
        "type": "any"
    },
    "user_admin_table_column_mul": {
        "type": "array",
        "size": 11,
        "mul_id": "user_id",
        "mul_id_fk": "admin_table_column_id",
        "fk": {
            "table": "admin_table_column",
            "ref_id": "id"
        }
    },
    "created_by": {
        "type": "int",
        "size": 11,
        "fk": {
            "table": "user",
            "ref_id": "id"
        }
    },
    "modified_by": {
        "type": "int",
        "size": 11,
        "fk": {
            "table": "user",
            "ref_id": "id"
        }
    },
};

User.prototype.validate_login = function(email, password) {
    if(!email) {
        return {email:'Email không được để trống'};
    }
    if(!password) {
        return {password:'Password không được để trống'};
    }
    if(!GlobalFunction.validateEmail(email)) {
        return {email:'Email không đúng định dạng'};
    }
    // if(!GlobalFunction.validatePassword(password)) {
    //     return {password:'Password phải lớn hơn hoặc bằng 6 kí tự'};
    // }
    return true;
}

User.prototype.getPasswordEncrypt = function(password, salt = '') {
    return md5(md5(salt + password));
}

User.prototype.afterCondition = async function (condition, array_where) {
    var def = Q.defer();
    var flag_def = true;
    if (condition && condition.params) {
        if(!this.req.user.user_role_mul.toString().match(/(^1$)|(^1,)|(,1$)/gi)) {
            if(!array_where['role_id']) {
                array_where['role_id'] = "`user_role_mul`.`role_id` != 1";
            } else {
                array_where['role_id'] += " AND `user_role_mul`.`role_id` != 1";
            }

            condition.params.push({
                key     : 'user_role_mul',
                value   : 1,
                operator: '!='
            });
        }
    }
    if (flag_def) {
        def.resolve(array_where);
    }
    return def.promise;
}

User.prototype.findAll = async function (condition, params) {
    var defer = Q.defer();
    var id = this.getPrimaryKey();
    if (typeof (condition) == 'object') {
        if (condition.select_db) {
            this.db.select(condition.select_db);
            delete condition.select_db;
        }
        if (condition.limit_db) {
            this.db.limit(condition.limit_db);
            delete condition.limit_db;
        }
        if (condition.sort_db) {
            this.db.order_by(condition.sort_db);
            delete condition.sort_db;
        }
        if (condition.order_by) {
            this.db.order_by(condition.order_by);
            delete condition.order_by;
        }
        this.db.where(condition);
    } else if (condition) {
        this.db.where(condition, params);
    }
    return this.db.get(this.tableName());
}

User.prototype.save = function (validate) {
    if (this.isNewRecord()) {
        this.password = GlobalFunction.randomPassword();
    }
    return GlobalActiveRecord.prototype.save.apply(this, arguments);
}

User.prototype.sendemail_newstaff = function () {
    var mail_settings = new mail_settings_require();
    var new_password = this.password;
    this.findOne(this.id).then(rs => {
        var attributes = this.showAttributes();
        attributes['password'] = new_password;
        // send email to new staff
        mail_settings.sendmail_by_template(this.email, 'cybersales', attributes, 'generate_password_success_template');
    });
}

User.prototype.set_filter_user = function() {
    var that = this;
    function load(item, stt) {
        var model_filter_user = new filter_user_require();
        model_filter_user.name = item.name;
        model_filter_user.user = that.id;
        model_filter_user.admin_table = item.admin_table;
        model_filter_user.order_db = item.order_db;
        model_filter_user.limit_db = item.limit_db;
        model_filter_user.default = !stt ? 1 : 0;
        if(item.fk_table_admin_table && item.fk_table_admin_table.list_admin_table_column && item.fk_table_admin_table.list_admin_table_column.length) {
            model_filter_user.filter_user_admin_table_column_mul = GlobalFunction.indexArray(item.fk_table_admin_table.list_admin_table_column,'id');
        }
        return model_filter_user.save().then(rs_filter => {
            var def = Q.defer();
            if(item.list_filter_default_field && item.list_filter_default_field.length) {
                var list_filter_user_field = [], i = 0;
                var count = 0, length = item.list_filter_default_field.length
                for(var item_filter_default_field of item.list_filter_default_field) {
                    list_filter_user_field[i] = new filter_user_field_require();
                    list_filter_user_field[i].filter_user = model_filter_user.id;
                    list_filter_user_field[i].admin_table_column = item_filter_default_field.admin_table_column;
                    list_filter_user_field[i].value = item_filter_default_field.value;
                    list_filter_user_field[i].save(false).then(rs_field_field => {
                        count++;
                        if(count == length){ def.resolve(true); }
                    })
                    i++;
                }

            } else {
                def.resolve(true);
            }
            return def.promise;
        })
    }
    var filter_user_default = new filter_default_require();
    return filter_user_default.findAllData({role: this.user_role_mul}).then(rs => {
        var def_rs = Q.defer();
        var c = 0, l = rs.length;
        if(rs && rs.length) {
            for(var i in rs) {
                load(rs[i],i).then(r => {
                    c++;
                    if(c == l){ def_rs.resolve(true); }
                })
            }
        } else {
            def_rs.resolve(true);
        }
        return def_rs.promise;
    })
}

exports = module.exports = User;
