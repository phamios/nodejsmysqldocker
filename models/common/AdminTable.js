var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
var CONFIG = require('../../config/config');
var filter_default_require = require('./FilterDefault');
var filter_default_field_require = require('./FilterDefaultField');
var filter_user_require = require('./FilterUser');
var role_require = require('./Role');
var filter_user_field_require = require('./FilterUserField');
var admin_table_column_require = require('./AdminTableColumn');
var Q = require('q');
var Promise = require('promise');
AdminTable = GlobalFunction.cloneFunc(GlobalActiveRecord);
AdminTable.prototype.tableName = function() {
    return 'admin_table';
}
AdminTable.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
AdminTable.prototype.LABEL = {
    "id": "Id",
    "name": "Name",
    "table_name": "Table Name",
    "status": "Status",
    "condition": "Condition",
    "default_search": "Default Search",
    "default_arrange": "Default Arrange",
    "default_update_status": "Default Update Status",
    "join": "Join",
    "status_excel": "Status Excel",
    "status_import": "Status Import",
    "columnstt": "Columnstt",
    "groupby": "Groupby",
    "action": "Action",
    "admin_form": "Admin Form",
    "show_form_is_popup": "Show Form Is Popup",
    "item_update": "Item Update",
    "item_delete": "Item Delete",
    "item_copy": "Item Copy",
    "item_add": "Item Add",
    "columncheck": "Columncheck",
    "list_admin_table_column": "list_admin_table_column"
};
AdminTable.prototype.RULE = {
    "id": {
        "type": "int",
        "auto_increment": true,
        "primary_key": true,
        "size": 11
    },
    "name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "table_name": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "status": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "condition": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "default_search": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
    "default_arrange": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
    "default_update_status": {
        "type": "text",
        "require": {
            "size": 65535
        }
    },
    "join": {
        "type": "varchar",
        "require": {
            "size": 400
        },
        "size": 400
    },
    "status_excel": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "status_import": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "columnstt": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "groupby": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "action": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "admin_form": {
        "type": "int",
        "size": 11,
        "fk": {
            "table": "admin_form",
            "ref_id": "id"
        }
    },
    "fk_table_admin_form": {
        "type": "any",
        "update_id": "admin_form",
        "fk": {
            "table": "admin_form",
            "ref_id": "id"
        }
    },
    "list_admin_table_column": {
        "type": "array",
        "model": "admin_table_column",
        "fk_id": "admin_table"
    },
    "show_form_is_popup": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "item_update": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "item_delete": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "item_copy": {
        "default": "0",
        "type": "tinyint",
        "size": 1
    },
    "item_add": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    },
    "columncheck": {
        "default": "1",
        "type": "tinyint",
        "size": 1
    }
};

AdminTable.prototype.findOneData = function(condition) {
    var that = this;
    return GlobalActiveRecord.prototype.findOneData.apply(this, [condition]).then(rs_all => {
        function load(item, stt) {
            var model_filter_user = new filter_user_require();
            model_filter_user.req = that.req;
            model_filter_user.name = item.name;
            model_filter_user.order_db = item.order_db;
            model_filter_user.limit_db = item.limit_db;
            model_filter_user.filter_default = item.id;
            model_filter_user.user = that.req.user.id;
            model_filter_user.admin_table = rs_all.id;
            model_filter_user.default = stt;
            if(that.list_admin_table_column && that.list_admin_table_column.length) {
                var filter_user_admin_table_column_mul = [];
                for(var item_1 of that.list_admin_table_column) {
                    if(item_1.checked) {
                        filter_user_admin_table_column_mul.push(item_1.id);
                    }
                }
                model_filter_user.filter_user_admin_table_column_mul = filter_user_admin_table_column_mul;
            }
            if(item.list_filter_default_field && item.list_filter_default_field !== undefined && item.list_filter_default_field.length) {
                var list_filter_user_field = [], i = 0;
                var count = 0, length = item.list_filter_default_field.length;
                for(var item_filter_default_field of item.list_filter_default_field) {
                    if(item_filter_default_field.fk_table_admin_table_column && item_filter_default_field.fk_table_admin_table_column !== undefined) {
                        var filter = item_filter_default_field.fk_table_admin_table_column.filter ? JSON.parse(item_filter_default_field.fk_table_admin_table_column.filter) : {};
                        var value = item_filter_default_field.value;
                        if(item_filter_default_field.value && typeof(item_filter_default_field.value) == 'string') {
                            value = item_filter_default_field.value.replace('{id}', that.req.user.id);
                        }
                        list_filter_user_field[i] = {
                            admin_table_column      : item_filter_default_field.admin_table_column,
                            value                   : value,
                            type                    : item_filter_default_field.value.match(/\|in/gi) ? 'multiselect' : (filter.type ? filter.type : null),
                            filter_default_field    : item_filter_default_field.id,
                        };
                    }
                    i++;
                }
                model_filter_user.list_filter_user_field = {
                    create      : list_filter_user_field
                };
            }
            return model_filter_user.save();
        }

        var model_filter_user_out = new filter_user_require();
        var filter_user_default = new filter_default_require();
        filter_user_default.req = that.req;
        model_filter_user_out.req = that.req;
        return model_filter_user_out.findAllData({admin_table: rs_all.id,user: that.req.user.id}, ['fk_table_admin_table']).then(rr => {
            if(rr.length) {
                rs_all['list_filter_user'] = rr;
                return rs_all;
            } else {
                var condition = {admin_table: rs_all.id, role: that.req.user.user_role_mul,select_db: 'filter_default.*', order_by: 'role.priority asc,filter_default.priority asc,filter_default.id asc',join:['role','filter_default.role = role.id','LEFT']};
                var def_2 = Q.defer();
                filter_user_default.countAll(condition).then(count => {
                    if(!count) {
                        filter_user_default.create_new_item_all(that).then(rs_1 => {
                            def_2.resolve(true);    
                        })
                    } else {
                        def_2.resolve(true);
                    }
                })
                return def_2.promise.then(rs_2 => {
                    return filter_user_default.findAllData(condition, ['fk_table_admin_table']).then(rs => {
                        var def_rs = Q.defer();
                        if(rs && rs.length) {
                            var c = 0, l = 0, fll = true, list_name = {};
                            for(var i in rs) {
                                if(!list_name[rs[i].name.trim()]) {
                                    list_name[rs[i].name.trim()] = true;
                                    var d = fll && rs[i].default ? 1 : 0;
                                    if(d) {fll = false;}
                                    l++;
                                    load(rs[i],d).then(r => {
                                        c++;
                                        if(c == l){ def_rs.resolve(rs_all); }
                                    })
                                }
                            }
                        } else {
                            def_rs.resolve(rs_all);
                        }
                        return def_rs.promise.then(rs_in => {
                            if(rs && rs.length) {
                                var model_filter_user = new filter_user_require();
                                return model_filter_user.findAllData({admin_table: rs_all.id,user: that.req.user.id}, ['fk_table_admin_table']).then(rr => {
                                    rs_all['list_filter_user'] = rr;
                                    return rs_all;
                                })
                            } else {
                                return Promise.resolve(rs_in);
                            }
                        });
                    })
                })
            }
        })

        
    })
}

exports = module.exports = AdminTable;