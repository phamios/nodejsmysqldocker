var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
FilterUser = GlobalFunction.cloneFunc(GlobalActiveRecord);
FilterUser.prototype.tableName = function() {
    return 'filter_user';
}
FilterUser.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
FilterUser.prototype.LABEL = {
    "filter_user_admin_table_column_mul": "filter_user_admin_table_column_mul",
    "id": "Id",
    "name": "Name",
    "user": "User",
    "default": "Default",
    "admin_table": "Admin Table",
    "filter_default": "Filter Default",
    "order_db": "Order Db",
    "limit_db": "Limit Db",
    "list_filter_user_field": "list_filter_user_field"
};
FilterUser.prototype.RULE = {
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
            "size": 255,
            "func": function() {
                return this.findAll({user:this.req.user.id, admin_table: this.admin_table}).then(rs => {
                    if(rs.length) {
                        for(var item of rs) {
                            if(item.name.trim() == this.name.trim() && item.id != this.id) {
                                return "Tên filter này đã tồn tại";
                            }
                        }
                    }
                    return "";
                })
            }
        },
        "size": 255
    },
    "user": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "user",
            "ref_id": "id"
        }
    },
    "fk_table_user": {
        "type": "any"
    },
    "filter_user_admin_table_column_mul": {
        "type": "array",
        "size": 11,
        "mul_id": "filter_user_id",
        "mul_id_fk": "admin_table_column_id",
        "fk": {
            "table": "admin_table_column",
            "ref_id": "id"
        }
    },
    "list_filter_user_field": {
        "type": "array",
        "model": "filter_user_field",
        "fk_id": "filter_user"
    },
    "default": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "admin_table": {
        "type": "int",
        "require": {
            "empty": true
        },
        "size": 11,
        "fk": {
            "table": "admin_table",
            "ref_id": "id"
        }
    },
    "fk_table_admin_table": {
        "type": "any"
    },
    "filter_default": {
        "type": "int",
        "size": 11,
        "fk": {
            "table": "filter_default",
            "ref_id": "id"
        }
    },
    "fk_table_filter_default": {
        "type": "any"
    },
    "order_db": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "limit_db": {
        "type": "int",
        "size": 11
    }
};

FilterUser.prototype.update_default = function() {
    this.default = 1;
    this.query("update `filter_user` set `default` = 0 where `admin_table` = " + this.admin_table + " and id != " + this.id + " and `user` = " + this.user + ";");
    return this.save(false);
}

FilterUser.prototype.delete = function(model_id = false) {
    var that = this;
    if(this.default) {
        return Promise.resolve({
            code        : 400,
            message     : 'Bạn không được phép xóa bản ghi này',
        });
    } else {
        if(this.id) {
            var query = "select id from filter_user where `admin_table` = " + this.admin_table + " and `user` = " + this.user + ";";
            return this.query(query).then(rs => {
                if(rs.length > 1) {
                    var query = "delete from filter_user_field where filter_user = " + that.id;
                    return this.query(query).then(rs => {
                        var query = "delete from filter_user_admin_table_column_mul where filter_user_id = " + that.id;
                        return this.query(query).then(rs => {
                            return GlobalActiveRecord.prototype.delete.apply(this, arguments);
                        })
                    })
                } else {
                    return {
                        code        : 400,
                        message     : 'Bạn không được phép xóa bản ghi này',
                    };
                }
            })
        } else {
            return GlobalActiveRecord.prototype.delete.apply(this, arguments);
        }

    }
}
exports = module.exports = FilterUser;