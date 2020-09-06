var GlobalActiveRecord = require('../../core/global_activerecord');
const GlobalFunction = require('../../core/global_function');
const GlobalCache = require('../../core/global_cache');
var CONFIG = require('../../config/config');
var Q = require('q');
var Promise = require('promise');
var role_item_require = require('./RoleItem');
var role_role_item_mul_require = require('./RoleRoleItemMul');
var filter_default_require = require('./FilterDefault');
var filter_default_field_require = require('./FilterDefaultField');
var admin_table_column_require = require('./AdminTableColumn');
var filter_user_require = require('./FilterUser');

Role = GlobalFunction.cloneFunc(GlobalActiveRecord);
Role.prototype.tableName = function() {
    return 'role';
}
Role.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
Role.prototype.LABEL = {
    "role_role_item_mul": "role_role_item_mul",
    "user_role_mul": "user_role_mul",
    "id": "Id",
    "name": "Name",
    "status": "Status",
    "role_group": "Role Group",
    "role_group_item": "Role Group Item",
    "type": "Type",
    "description": "Description",
    "alias": "Alias",
    "role_item": "Role Item",
    "filter": "Filter",
    "priority": "Priority",
    "code": "Code",
    "RoleRoleItemMul": "RoleRoleItemMul"
};
Role.prototype.RULE = {
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
    "role_group": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "role_role_item_mul": {
        "type": "array",
        "size": 11,
        "require": {
            // "empty": true
        },
        "mul_id": "role_id",
        "mul_id_fk": "role_item_id",
        "fk": {
            "table": "role_item",
            "ref_id": "id"
        }
    },
    "role_group_item": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "type": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    },
    "description": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "alias": {
        "type": "varchar",
        "require": {
            "size": 255
        },
        "size": 255
    },
    "role_item": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "filter": {
        "type": "longtext",
        "require": {
            "size": 4294967295
        }
    },
    "priority": {
        "default": "0",
        "type": "int",
        "size": 11
    },
    "code": {
        "type": "varchar",
        "require": {
            "size": 20
        },
        "size": 20
    },
    "user_role_mul": {
        "type": "array",
        "size": 11,
        "mul_id": "role_id",
        "mul_id_fk": "user_id",
        "fk": {
            "table": "user",
            "ref_id": "id"
        }
    }
};

Role.prototype.get_header_role = function() {
    var that = this;
    var header = [{
        attribute: 'name',
        label: 'Phân quyền',
        filter: {type: 'text'},
    }];

    var a = ['status = 1'];
    if(!this.req.user.user_role_mul.toString().match(/(^1$)|(^1,)|(,1$)/gi)) {
        a.push('id != 1');
    }
    this.db.where(a.join(' AND '));
    this.db.order_by(' priority asc');
    return this.db.get(this.tableName()).then( r => {
        for(var j in r) {
            var d = {
                attribute   :'' + r[j]['id'],
                label       :     r[j]['name'],
                view        : 'checkbox',
            };

            if( that.req.role['role_role_item_mul_edit']) {
                d['update'] = {type: 'checkbox'};
            }
            header.push(d);
        }
        return header;
    });
}

Role.prototype.get_list_role = function(condition = {}) {
    var that = this;
    var role_item = new role_item_require();
    var role_role_item_mul = new role_role_item_mul_require();
    var list_role = [], list_role_item = [], list_role_role_item_mul = {};
    var def = Q.defer();
    var LIMIT = 3, COUNT_LIMIT = 0;
    if(!condition['status']) {
        condition['status'] = 1;
    }
    var a = role_item.buildCondition(condition);
    role_item.db.where(a.join(' AND '));
    role_item.db.order_by('priority asc,`table` asc,name asc');
    role_item.db.get(role_item.tableName()).then(r => {
        list_role_item = r;
        COUNT_LIMIT++;if(COUNT_LIMIT == LIMIT) { def.resolve(true); }
    });

    var a = ['status = 1'];
    if(!this.req.user.user_role_mul.toString().match(/(^1$)|(^1,)|(,1$)/gi)) {
        a.push('id != 1');
    }
    this.db.where(a.join(' AND '));
    this.db.order_by('name asc');
    this.db.get(this.tableName()).then(r => {
        list_role = r;
        COUNT_LIMIT++;if(COUNT_LIMIT == LIMIT) { def.resolve(true); }
    });
    role_role_item_mul.findAll().then(r => {
        for(var i in r) {
            list_role_role_item_mul[r[i]['role_id']  + '_' + r[i]['role_item_id']] = true;
        }
        COUNT_LIMIT++;if(COUNT_LIMIT == LIMIT) { def.resolve(true); }
    })
    return def.promise.then(r => {
        var rs = [];
        for(var i in list_role_item) {
            var role_item_id = list_role_item[i]['id'];
            var obj = {
                'id'        : list_role_item[i]['id'],
                'name'      : list_role_item[i]['name'],
            };
            for(var j in list_role) {
                var role_id = list_role[j]['id'];
                obj['' + list_role[j]['id']] = list_role_role_item_mul[role_id + '_' + role_item_id] ? true : false;
            }
            rs.push(obj);
        }
        
        return rs
    })
}

Role.prototype.get_role = async function(multi_id) {
    var that = this;
    var key_cache = 'user_role_role_item_mul';
    var rs = GlobalCache.get_cache_mul_by_model(this.req.user, key_cache);
    if(!rs) {
        var rows = await this.query("select role_item.`id`,role_item.`name`,role_item.`table`,role_item.`action` from role_item "
        + " INNER JOIN role_role_item_mul ON role_item.id = role_role_item_mul.role_item_id "
        + " where role_role_item_mul.role_id IN (" + multi_id.join(',') + ") group by role_item.id");
        rs = {};
        if(rows && rows !== undefined && rows.length) {
            for(var i in rows) {
                rs[rows[i]['table'] + '_' + rows[i]['action']] = true;
            }
        }
        GlobalCache.set_cache_mul_by_model(this.req.user,key_cache, rs);
    }
    return Promise.resolve(rs);
}

Role.prototype.afterInsert = function() {
    GlobalActiveRecord.prototype.afterInsert(this, arguments);
    GlobalCache.remove_cache_mul_by_table_name('user');
}

Role.prototype.afterUpdate = function(attributes_change, attributes_old, attributes_new) {
    GlobalActiveRecord.prototype.afterUpdate(this, arguments);
    GlobalCache.remove_cache_mul_by_table_name('user');
    return Promise.resolve(true);
}

Role.prototype.afterDelete = function() {
    GlobalActiveRecord.prototype.afterDelete(this, arguments);
    GlobalCache.remove_cache_mul_by_table_name('user');

}

exports = module.exports = Role;