exports = module.exports = GlobalActiveRecord;
var GLOBAL_DB = require('./global_db');
var GlobalFunction = require('./global_function');
var GLOBAL_VALIDATE = require('./global_validate');
var GlobalCache = require('./global_cache');
var GLOBAL_FILE = require('./global_file');
var CONFIG = require('../config/config');
var GLOBAL_RENDER = require('./global_render');
const Q = require('q');
var md5 = require('md5');
var list_table_fields = {};

const DB = require('mysql-activerecord');
var db = new DB.Adapter(CONFIG.MYSQL[CONFIG.SERVER['crawlermanagement']]);

var list_db_cache = {};
var list_db_cache_index = 0;
function GlobalActiveRecord() {
    this.start();
    this.init();
}

GlobalActiveRecord.prototype.get_table_fields = async function () {
    var def = Q.defer();
    if (CONFIG.MYSQL[this.db_key]) {
        if (list_table_fields[this.tableName()]) {
            def.resolve(true);
        } else {
            var db_name = CONFIG.MYSQL[this.db_key]['database'];
            var table_name = this.tableName();
            this.db.query("SELECT COLUMN_NAME  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '" + db_name + "' AND TABLE_NAME = '" + table_name + "';").then(rows => {
                if (rows) {
                    list_table_fields[table_name] = {};
                    for (var i in rows) {
                        list_table_fields[table_name][rows[i]['COLUMN_NAME']] = true;
                    }
                }
                def.resolve(true);
            })
        }
    } else if(CONFIG.DB2[this.db_key]) {
        if (list_table_fields[this.tableName()]) {
            def.resolve(true);
        } else {
            var db_name = CONFIG.DB2[this.db_key]['database'];
            var table_name = this.tableName();
            this.db.query("SELECT NAME FROM SYSIBM.SYSCOLUMNS WHERE TBCREATOR = '" + db_name.toUpperCase() + "' AND TBNAME = '" + table_name.toUpperCase() + "';").then(rows => {
                if (rows) {
                    list_table_fields[table_name] = {};
                    for (var i in rows) {
                        list_table_fields[table_name][rows[i]['NAME']] = true;
                    }
                }
                def.resolve(true);
            })
        }
    } else {
        def.resolve(true);
    }
    return def.promise;
}

GlobalActiveRecord.prototype.attr_sort = false;

GlobalActiveRecord.prototype.start = function () {
    this.labelAttributes = Object.assign({}, this.LABEL_COMMON, this.LABEL);
    this.rule = Object.assign({}, this.RULE_COMMON, this.RULE);
    if (!list_db_cache[this.tableName()]) {
        list_db_cache[this.tableName()] = list_db_cache_index;
        list_db_cache_index++;
    }
    this.db = GLOBAL_DB.getDB(this.db_key, list_db_cache[this.tableName()]);
    this._validate = new GLOBAL_VALIDATE(this, '');
    for (var i in this.labelAttributes) {
        this[i] = undefined;
    }
}

GlobalActiveRecord.prototype.attr_validate = {};
GlobalActiveRecord.prototype.display_attr = 'name';
GlobalActiveRecord.user_id = 1;
GlobalActiveRecord.prototype.setDb = function (key) {
    this.db_key = key;
    this.db = GLOBAL_DB.getDB(this.db_key);
}
GlobalActiveRecord.prototype.db_key = CONFIG.SERVER['crawlermanagement'];
GlobalActiveRecord.prototype.project_key = 'crawlermanagement';
GlobalActiveRecord.prototype.LABEL_COMMON = {
    'id': 'Id',
    'created_time': 'Created time',
    'created_by': 'Created by',
    'modified_time': 'Modified time',
    'modified_by': 'Modified by',
}
GlobalActiveRecord.prototype.RULE_COMMON = {
    id: {
        type: 'int',
    },
    created_at: {
        type: 'int',
    },
    updated_at: {
        type: 'int',
    },
    updater_id: {
        type: 'int',
    },
    creator_id: {
        type: 'int',
    },
    created_time: {
        type: 'int',
    },
    modified_time: {
        type: 'int',
    },
    created_by: {
        type: 'int',
    },
    modified_by: {
        type: 'int',
    }
}
GlobalActiveRecord.prototype.init = function () {
}
GlobalActiveRecord.prototype._table_name = '';
GlobalActiveRecord.prototype.tableName = function () {
    return this._table_name;
}
GlobalActiveRecord.prototype._old_attributes = false;
GlobalActiveRecord.prototype.scenario = '';
GlobalActiveRecord.prototype.setScenario = function (value) { this.scenario = value; }
GlobalActiveRecord.prototype.getScenario = function (value) { return value; }

GlobalActiveRecord.prototype.validate = async function () {
    return this._validate.validate();
}

GlobalActiveRecord.prototype.validate_attributes = function (attributes) {
    return this._validate.validate(attributes);
}

GlobalActiveRecord.prototype.hasAttribute = function (attr) {
    return this.labelAttributes[attr] ? true : false;
}
GlobalActiveRecord.prototype.getAttributes = function () {
    let attr = this.labelAttributes;
    let rs = {};
    for (let i in attr) {
        if (this.hasAttribute(i)) {
            rs[i] = this[i];
        }
    }
    return rs;
}

GlobalActiveRecord.prototype.showAttributes = function () {
    let attr = this.labelAttributes;
    let rs = {};
    var attributes = this.getAttributes();
    for (let i in attr) {
        if (this[i] !== undefined) {
            rs[i] = this.showAttribute(i, this[i], attributes);
        }
    }
    return rs;
}

GlobalActiveRecord.prototype.get_link_file = function (file_name) {
    return CONFIG.LINK_IMAGE + this.tableName() + '/main/' + file_name;
}

GlobalActiveRecord.prototype.get_link_file_url = function (file_name) {
    return CONFIG.LINK_IMAGE_URL + this.tableName() + '/main/' + file_name;
}


GlobalActiveRecord.prototype.showAttribute = function (attr, value, rs = false) {
    if (this['show_' + attr]) {
        return this['show_' + attr](attr, value, rs);
    }
    var rule = this.rule[attr];
    var type = rule ? rule['type'] : '';

    if (rule && rule['fk']) {
        if (attr.match(/_(mul|MUL)$/gi) && value && value !== undefined) {
            if (typeof (value) == 'string') {
                value = value.split(',');
            }
            var a = [];
            for (var i in value) {
                if (this['fk_table_' + attr + '_obj'] && this['fk_table_' + attr + '_obj'][value[i]]) {
                    a.push(this['fk_table_' + attr + '_obj'][value[i]]);
                }
            }
            return a.join(', ');
        }
        return this['fk_table_' + attr + '_obj'] && this['fk_table_' + attr + '_obj'][value] ? this['fk_table_' + attr + '_obj'][value] : '';
    }
    if (attr.match(/image|file|avartar/gi)) {
        if (value !== undefined && value) {
            if (value.match(/^\[(\{|\])/gi)) {
                value = JSON.parse(value);
                for (var i in value) {
                    value[i]['link'] = this.get_link_file(value[i]['name']);
                }
            } else {
                value = this.get_link_file(value);
            }
        }
    } else {
        if (GlobalFunction.contains(type, ['int', 'bigint'])) {
            if (GlobalFunction.contains(attr, ['modified_time', 'created_time'])) {
                return GlobalFunction.formatDateTime(value);
            } else {
                return value !== undefined && value !== null ? parseInt(value) : '';
            }
        } else if (GlobalFunction.contains(type, ['float', 'double'])) {
            return value !== undefined ? parseFloat(value) : '';
        } else if (GlobalFunction.contains(type, ['string', 'varchar', 'longtext', 'text'])) {
            return value;
        } else if (GlobalFunction.contains(type, ['date', 'datetime'])) {
            return GlobalFunction.formatDateTime(value, type == 'datetime' ? 'h:i d-m-y' : 'd-m-y');
        }
    }
    return value;
}

GlobalActiveRecord.prototype.getAttributesSearch = function () {
    let attr = this.labelAttributes;
    let rs = {};
    for (let i in attr) {
        if (this.hasAttribute(i) && this[i] !== undefined) {
            rs[i] = this[i];
        }
    }
    return rs;
}

GlobalActiveRecord.prototype.setDefaultDataAttributesInsert = function () {
    if (this.hasAttribute('created_time') && !this.created_time) {
        this.created_time = parseInt(GlobalFunction.newDate().getTime() / 1000);
    }
    if (this.hasAttribute('modified_time')) {
        this.updated_time = parseInt(GlobalFunction.newDate().getTime() / 1000);
    }
    if (this.hasAttribute('created_by') && !this.created_by) {
        this.created_by = GlobalActiveRecord.user_id;
    }
}

GlobalActiveRecord.prototype.setDefaultDataAttributesUpdate = function () {
    if (this.hasAttribute('modified_time')) {
        this.modified_time = parseInt(GlobalFunction.newDate().getTime() / 1000);
    }
    if (this.hasAttribute('modified_by')) {
        this.modified_by = GlobalActiveRecord.user_id;
    }
}

GlobalActiveRecord.prototype.getAttributesInsert = function () {
    var attributes = {};
    let attr = this.labelAttributes;
    for (let i in attr) {
        if (this.hasAttribute(i) && this[i] !== undefined) {
            if (this.rule[i] && this.rule[i]['fk'] && attributes[i] == '') {
                attributes[i] = null;
            }
            if (GlobalFunction.is_array(this[i]) && this[i].length && typeof (this[i][0]) != 'object') {
                if (!CONFIG.MONGO[this.db_key] && !i.match(/_(mul|MUL)$/gi)) {
                    attributes[i] = this[i].join("_");
                } else {
                    attributes[i] = this[i];
                }
            } else {
                attributes[i] = this[i];
            }
        }
    }
    if (this.getPrimaryKey() == 'id') {
        delete attributes['id'];
    }
    if (this.getPrimaryKey() == 'ID') {
        delete attributes['ID'];
    }
    var table_name = this.tableName();
    if (this.hasAttribute('modified_time') && !this.modified_time) {
        this.modified_time = parseInt(GlobalFunction.newDate().getTime() / 1000);
        attributes['modified_time'] = this.modified_time;
    }
    if (this.hasAttribute('created_time') && !this.created_time) {
        this.created_time = parseInt(GlobalFunction.newDate().getTime() / 1000);
        attributes['created_time'] = this.created_time;
    }
    if ((this.hasAttribute('MODIFIED_TIME') || (list_table_fields[table_name] && list_table_fields[table_name]['MODIFIED_TIME'])) && !this.MODIFIED_TIME) {
        this.MODIFIED_TIME = parseInt(GlobalFunction.newDate().getTime() / 1000);
        attributes['MODIFIED_TIME'] = this.MODIFIED_TIME;
    }
    if ((this.hasAttribute('CREATED_TIME') || (list_table_fields[table_name] && list_table_fields[table_name]['CREATED_TIME'])) && !this.CREATED_TIME) {
        this.CREATED_TIME = parseInt(GlobalFunction.newDate().getTime() / 1000);
        attributes['CREATED_TIME'] = this.CREATED_TIME;
    }
    if (attributes['password'] && attributes['password'].length != 32) {
        attributes['password'] = this.set_password(attributes['password']);
    }
    if (this.hasAttribute('created_by') && this.req && this.req.decoded && this.req.decoded.id && !this.created_by) {
        this.created_by = this.req.decoded.id;
        attributes['created_by'] = this.req.decoded.id;
    }
    if ((this.hasAttribute('CREATED_BY') ||  (list_table_fields[table_name] && list_table_fields[table_name]['CREATED_BY'])) && this.req && this.req.decoded && this.req.decoded.id && !this.CREATED_BY) {
        this.CREATED_BY = this.req.decoded.id;
        attributes['CREATED_BY'] = this.req.decoded.id;
    }
    if ((this.hasAttribute('IS_DELETE') || (list_table_fields[table_name] && list_table_fields[table_name]['IS_DELETE']))) {
        this.IS_DELETE = 0;
        attributes['IS_DELETE'] = this.IS_DELETE;
    }
    return attributes;
}

GlobalActiveRecord.prototype.set_password = function (pass) {
    return md5(md5(pass));
}

GlobalActiveRecord.prototype.getAttributesUpdate = function () {
    var attributes = this.getAttributes();
    if (this.getPrimaryKey() == 'id') {
        delete attributes['id'];
    }
    if (attributes['password'] && attributes['password'].length != 32) {
        attributes['password'] = this.set_password(attributes['password']);
    }
    var attributes_update = {};
    for (var k in attributes) {
        if (k.match(/^list_/gi) && !(this.rule[k] && this.rule[k]['not_list']) && !CONFIG.MONGO[this.db_key]) {
            if (attributes[k] && Object.keys(attributes[k]).length) {
                attributes_update[k] = attributes[k];
            }
        } else {
            if ((!k.match(/_(mul|MUL)$/gi) && this._old_attributes[k] != attributes[k]) ||
                (k.match(/_(mul|MUL)$/gi) && this._old_attributes[k] && this._old_attributes[k].toString() != attributes[k].toString())) {
                if (this.rule[k] && this.rule[k]['fk'] && attributes[k] == '') {
                    attributes[k] = null;
                }
                if (GlobalFunction.is_array(attributes[k]) && typeof (attributes[k][0]) != 'object') {
                    if(attributes[k].length)
                    {
                        if (!CONFIG.MONGO[this.db_key] && !k.match(/_(mul|MUL)$/gi)) {
                            attributes_update[k] = attributes[k].join();
                        } else {
                            attributes_update[k] = attributes[k];
                        }
                    }
                    else
                    {
                        attributes_update[k] = null;
                    }
                } else {
                    attributes_update[k] = attributes[k];
                }
            }
        }
    }
    var table_name = this.tableName();
    if (this.hasAttribute('modified_time')) {
        this.modified_time = parseInt(GlobalFunction.newDate().getTime() / 1000);;
        attributes_update['modified_time'] = this.modified_time;
    }
    if (this.hasAttribute('modified_by') && this.req && this.req.decoded && this.req.decoded.id) {
        this.modified_by = this.req.decoded.id;
        attributes_update['modified_by'] = this.req.decoded.id;
    }
    if (this.hasAttribute('MODIFIED_TIME') || (list_table_fields[table_name] && list_table_fields[table_name]['MODIFIED_TIME'])) {
        this.MODIFIED_TIME = parseInt(GlobalFunction.newDate().getTime() / 1000);;
        attributes_update['MODIFIED_TIME'] = this.MODIFIED_TIME;
    }
    if ((this.hasAttribute('MODIFIED_BY')  || (list_table_fields[table_name] && list_table_fields[table_name]['MODIFIED_BY'])) && this.req && this.req.decoded && this.req.decoded.id) {
        this.MODIFIED_BY = this.req.decoded.id;
        attributes_update['MODIFIED_BY'] = this.req.decoded.id;
    }
    return attributes_update;
}

GlobalActiveRecord.prototype.setAttribute = function (attr, value) {
    if (this.hasAttribute(attr)) {
        if (value !== undefined && value !== null) {
            if (GlobalFunction.contains(attr, ['tinyint', 'smallint', 'mediumint', 'int'])) {
                if (value === '') {
                    valuue = null;
                } else if (typeof (value) == 'string' && value && value.match(/^[0-9]+$/gi)) {
                    value = parseInt(value);
                }
            } else if (GlobalFunction.contains(attr, ['float', 'double'])) {
                value = parseFloat(value);
            } else if (GlobalFunction.contains(attr, ['varchar', 'text', 'longtext']) && typeof (value) != 'string') {
                value = '' + value;
            }
        }
        this[attr] = value;
        return true;
    } else if(attr == 'ID' && CONFIG.DB2[this.db_key]){
        this[attr] = value;
        return true;
    }
    return false;
}

GlobalActiveRecord.prototype.setAttributes = function (res) {
    for (let i in res) {
        this.setAttribute(i, res[i]);
    }
}

GlobalActiveRecord.prototype.resetAttributes = function () {
    let attr = this.labelAttributes;
    let rs = {};
    for (let i in attr) {
        this[i] = undefined;
    }
    return rs;
}

GlobalActiveRecord.prototype.find = function () {
    return this.db;
}

GlobalActiveRecord.prototype.getPrimaryKey = function () {
    if (this.primary_key === undefined) {
        var ids = [];
        for (var i in this.rule) {
            if (this.rule[i]['primary_key']) {
                ids.push(i);
            }
        }
        if (ids.length > 1) {
            this.primary_key = ids;
        } else if (ids.length == 1) {
            this.primary_key = ids[0];
        } else {
            this.primary_key = false;
        }
    }
    return this.primary_key;
}

GlobalActiveRecord.prototype.getWhereByPrimaryKey = function () {
    var id = this.getPrimaryKey();
    if (CONFIG.MONGO[this.db_key]) {
        id = '_id';
    }
    if (CONFIG.DB2[this.db_key]) {
        id = 'ID';
    }
    var where = {};
    if (typeof (id) == 'object') {
        for (var i in id) {
            where[id[i]] = this[id[i]];
        }
    } else {
        where[id] = this[id];
    }
    return where;
}

GlobalActiveRecord.prototype.delete_list = function () {
    var that = this;
    function delete_item(attr) {
        var def_item = Q.defer();
        var model_require = that.get_class_require_by_table_name(that.rule[attr].model);
        var model = new model_require();
        var condition = {};
        condition[that.rule[attr].fk_id] = that.id;
        if (model.check_attr_list()) {
            model.deleteAll(condition).then(rs => {
                def_item.resolve(true);
            })
        } else {
            model.findAll(condition).then(rs => {
                if (rs.length) {
                    var list = [];
                    var count = 0;
                    for (var i in rs) {
                        list[i] = new model_require();
                        list[i].resetAttributes();
                        list[i].setAttributes(rs[i]);
                        list[i]._old_attributes = rs[i];
                        list[i].delete().then(rs_item => {
                            count++; if (count == rs.length) { def_item.resolve(true); }
                        });
                    }
                } else {
                    def_item.resolve(true);
                }
            })
        }
        return def_item.promise;
    }
    var def = Q.defer();
    var COUNT = 0, LENGTH = 0;
    for (var i in that.labelAttributes) {
        if (i.match(/^list_/gi) && !(this.rule[i] && this.rule[i]['not_list']) && CONFIG.MYSQL[that.db_key]) {
            LENGTH++;
            delete_item(i).then(r => { COUNT++; if (COUNT == LENGTH) { def.resolve(true); } });
        }

    }
    if (!LENGTH) {
        def.resolve(true);
    }
    return def.promise;
}

GlobalActiveRecord.prototype.check_attr_list = function () {
    for (var i in this.labelAttributes) {
        if (i.match(/^list_/gi) && !(this.rule[i] && this.rule[i]['not_list']) && CONFIG.MYSQL[this.db_key]) {
            return true;
        }
    }
    return false;
}

GlobalActiveRecord.prototype.afterDelete = async function () {
    GlobalCache.remove_cache_table_name_and_id_by_model(this);
    GlobalCache.remove_cache_mul_by_model(this);
    return Promise.resolve();
}

GlobalActiveRecord.prototype.beforeDelete = function () {
    return Promise.resolve();
}

GlobalActiveRecord.prototype.delete = function (model_id = false) {
    var defer = Q.defer();
    var that = this;
    async function process_delete() {
        var id = that.getPrimaryKey();
        if (id) {
            if (that.hasAttribute('is_delete')||that.hasAttribute('IS_DELETE')) {
                if(that.ID) {
                    that.id = that.ID;
                }
                that.is_delete = 1;
                that['IS_DELETE'] = 1;
                var a = await that.beforeDelete();
                if (a) { }
                that.update(false).then(r => {
                    that.afterDelete();
                    defer.resolve(true);
                })
            } else {

                that.db.where(that.getWhereByPrimaryKey());
                var a = await that.beforeDelete();
                if (a) { }
                that.db.delete(that.tableName()).then(rows => {
                    that.afterDelete();
                    defer.resolve(true);
                })
            }
        } else {
            defer.resolve(false);
        }
    }
    if (model_id) {
        this.findOne(model_id).then(r => {
            that.id = r.ID || that.id; 
            process_delete();
        });
    } else {
        process_delete();
    }
    return defer.promise;
}
GlobalActiveRecord.prototype.approveAll = async function (condition, params) {
    if (typeof (condition) == 'object') {
        var attr = {};
        for (var i in condition) {
            attr[i] = condition[i];
        }
        this.db.where(attr);
    } else {
        this.db.where(condition, params);
    }
    GlobalCache.remove_cache_table_name(this.tableName());
    return this.db.updateMany(this.tableName(), { is_approve: 1 });
}
GlobalActiveRecord.prototype.deleteAll = async function (condition, params) {
    if (typeof (condition) == 'object') {
        var attr = {};
        for (var i in condition) {
            // if (this.hasAttribute(i)) {
            attr[i] = condition[i];
            // }
        }
        this.db.where(attr);
    } else {
        this.db.where(condition, params);
    }
    GlobalCache.remove_cache_table_name(this.tableName());
    if (this.hasAttribute('is_delete') || this.hasAttribute('IS_DELETE')) {
        this.db.updateMany(this.tableName(), { is_delete: 1 });
        return this.afterDeleteAll(condition);
    } else {
        return this.db.delete(this.tableName());
    }
}

GlobalActiveRecord.prototype.isNewRecord = function () {
    if (CONFIG.MONGO[this.db_key]) {
        return this._id || this[this.getPrimaryKey()] ? false : true;
    }
    if (CONFIG.DB2[this.db_key]) {
        return this.ID || this[this.getPrimaryKey()] ? false : true;
    }
    return this.id || this[this.getPrimaryKey()] ? false : true;
}

GlobalActiveRecord.prototype.update_attributes_many = function (attributes, ids) {
    var that = this;
    var condition = { id: ids };
    if (CONFIG.MONGO[this.db_key]) {
        condition = { _id: { $in: ids } };
    }
    return this.findAll(condition).then(rs => {
        if (rs && rs.length) {
            return GlobalFunction.runMultiRequest(rs, function (data, index) {
                var model = that.get_class_new_by_table_name(that.tableName());
                if (data[index]._id) {
                    model._id = data[index]._id;
                    model.primary_key = '_id';
                }
                model.setAttributes(data[index]);
                model._old_attributes = data[index];
                model.setAttributes(attributes);
                return model.save(false).then(rr => {
                    return Promise.resolve({
                        i: index,
                        data: true,
                    });
                })
            }, 10).then(rs => {
                return true;
            })
        } else {
            return true;
        }
    })
}

GlobalActiveRecord.prototype.save = async function (validate) {
    var def;
    var isNewRecord = false;
    var that = this;
    var res = await this.beforeSave(validate);
    if (that.isNewRecord()) {
        def = await this.insert(validate);
        isNewRecord = true;
    } else {
        def = await that.update(validate);
    }
    if (def) { }
    return that.afterSave(isNewRecord);
}

GlobalActiveRecord.prototype.check_attributes_in_db = function (attr) {
    var list_fields = list_table_fields[this.tableName()];
    if (!list_fields) {
        return false;
    }
    return list_fields[attr] ? true : false;
}

GlobalActiveRecord.prototype.get_only_attributes_in_db = function (attributes) {
    var list_fields = list_table_fields[this.tableName()];
    if (!list_fields) {
        return attributes;
    }

    var rs = {};
    for (var i in attributes) {
        if (list_fields[i]) {
            rs[i] = attributes[i];
        }
    }
    return rs;
}

GlobalActiveRecord.prototype.insert_list = function (attributes_insert) {
    var def = Q.defer();
    var flag = true;
    var that = this;
    var COUNT = 0;
    var LENGTH = 0;
    function insert(v) {
        var value = attributes_insert[v];
        var def_insert = Q.defer(), LENGTH_INSERT = 0, COUNT_INSERT = 0;
        if (Object.keys(value).length) {
            var list_model = [], j = 0;
            function delete_item(j_item, item) {
                return list_model[j_item].findOne(item, true).then(rs => {
                    return list_model[j_item].delete_list().then(rs_delete => {
                        return list_model[j_item].delete();
                    })
                })
            }
            for (var i in value) {
                var list_data = value[i];
                if (typeof (list_data) == 'object' && GlobalFunction.contains(i, ['create', 'update', 'delete'])) {
                    for (var kkk in list_data) {
                        var item = (typeof (list_data[kkk]) == 'object') ? Object.assign({}, list_data[kkk]) : list_data[kkk];
                        list_model[j] = that.get_class_new_by_table_name(that.rule[v].model);
                        switch (i) {
                            case 'create':
                            case 'update':
                                if (item.id && typeof (item.id) == 'string' && item.id.match(/[a-zA-Z_]+/gi)) {
                                    delete item.id;
                                }
                                list_model[j].setAttributes(item);
                                list_model[j][that.rule[v].fk_id] = that.id;
                                list_model[j].save().then(rs => { COUNT_INSERT++; if (COUNT_INSERT == LENGTH_INSERT) { def.resolve(); } });
                                break;
                            case 'delete':
                                delete_item(j, item).then(rs => { COUNT_INSERT++; if (COUNT_INSERT == LENGTH_INSERT) { def.resolve(); } });
                                break;
                        }
                        j++;
                        LENGTH_INSERT++;
                    }
                }
            }
        }
        if (!LENGTH_INSERT) {
            def_insert.resolve(true);
        }
        return def_insert.promise;
    }

    for (var i in attributes_insert) {
        if (i.match(/^list_/gi) && !(this.rule[i] && this.rule[i]['not_list']) && CONFIG.MYSQL[that.db_key]) {
            flag = false;
            LENGTH++;
            insert(i).then(rs => {
                COUNT++; if (COUNT == LENGTH) { def.resolve(true); }
            })
        }
    }
    if (flag) {
        def.resolve(true);
    }
    return def.promise;
}

GlobalActiveRecord.prototype.insert_mul = function (attributes_insert) {
    var def = Q.defer();
    var flag = true;
    var that = this;
    var COUNT = 0;
    var LENGTH = Object.keys(attributes_insert).length;
    function insert(v) {
        var where_delete = {};
        where_delete[that.rule[v]['mul_id']] = that.id || that.ID;
        that.db.where(where_delete);
        that.db.delete(v).then(rows => {
            if ((!that[v] || that[v] === undefined) || (GlobalFunction.is_array(that[v])) && !that[v].length) {
                COUNT++;
                if (COUNT == LENGTH) {
                    def.resolve(true);
                }
            } else {
                if (typeof (that[v]) == 'string') {
                    that[v] = that[v].split(',');
                }
                var data = [];
                for (var i in that[v]) {
                    var item = {};
                    item[that.rule[v]['mul_id']] = that.id || that.ID;
                    item[that.rule[v]['mul_id_fk']] = that[v][i];
                    if(that.rule[v].defaultValues && typeof(that.rule[v].defaultValues) == 'object') {
                        Object.assign(item,that.rule[v].defaultValues);
                        if(item['CREATED_TIME']) {
                            item['CREATED_TIME'] = parseInt(GlobalFunction.newDate().getTime() / 1000);
                        }
                        if(item['MODIFIED_TIME']) {
                            item['MODIFIED_TIME'] = parseInt(GlobalFunction.newDate().getTime() / 1000);
                        }
                        if(item['created_time']) {
                            item['created_time'] = parseInt(GlobalFunction.newDate().getTime() / 1000);
                        }
                        if(item['modified_time']) {
                            item['modified_time'] = parseInt(GlobalFunction.newDate().getTime() / 1000);
                        }
                    }
                    data.push(item);
                }
                var func_type = CONFIG.DB2[that.db_key] ? 'insertMany' : 'insert';
                that.db[func_type](v, data).then(rows => {
                    COUNT++; if (COUNT == LENGTH) { def.resolve(true); }
                })
            }
        })
    }

    for (var i in attributes_insert) {
        if (i.match(/_(mul|MUL)$/gi)) {
            flag = false;
            insert(i);
        } else {
            COUNT++;
        }
    }
    if (flag) {
        def.resolve(true);
    }
    return def.promise;
}

GlobalActiveRecord.prototype.afterInsert = function () {
}

GlobalActiveRecord.prototype.insert = async function (validate) {
    var that = this;
    var flag = true;
    if (validate) {
        var r = await this.validate();
        flag = r ? true : false;
    } else {
        flag = true;
    }
    if (flag) {

        /* BEGIN GET ATTRIBUTES INSERT */
        var r = await that.get_table_fields();
        if (r) { }
        var attributes_insert = that.getAttributesInsert();
        for (var i in attributes_insert) {
            if (i.match(/_(mul|MUL)$/gi) && attributes_insert[i] && attributes_insert[i].length && that[i]['update_attr']) {
                attributes_insert[that[i]['update_attr']] = attributes_insert[i].join(',');
            }
        }
        var attributes = that.get_only_attributes_in_db(attributes_insert);
        if (CONFIG.MONGO[that.db_key]) {
            var r = await that.findAll({ limit_db: 1, sort_db: { _id: -1 } });
            if (r && r.length) {
                this._id = attributes['_id'] = r[0]._id + 1;
            } else {
                this._id = attributes['_id'] = 1;
            }
        }
        /* END GET ATTRIBUTES INSERT */


        /* BEGIN GET ATTRIBUTES INSERT */
        var rows = await that.db.insert(that.tableName(), attributes);
        if (rows) {
            if (CONFIG.MYSQL[that.db_key]) {
                that.id = rows['insertId'];
            }
            if (CONFIG.DB2[that.db_key]) {
                that.id = that.ID = rows['ID'];
            }
            GlobalCache.set_cache_by_model(that);
            GlobalCache.remove_cache_fk_by_model(that);
            that.afterInsert();

            var r1 = await that.insert_list(attributes_insert);
            var r2 = await that.insert_mul(attributes_insert);

            if (r1) { } if (r2) { }
            return Promise.resolve(true);
        } else {
            return Promise.resolve(true);
        }
        /* END GET ATTRIBUTES INSERT */

    } else {
        return Promise.resolve(false);
    }
}

GlobalActiveRecord.prototype.insertMany = async function (attributes) {
    return this.db.insertMany(this.tableName(), attributes);
}

GlobalActiveRecord.prototype.beforeUpdate = function (attributes_change, attributes_old, attributes_new) {
    return Promise.resolve({});
}

GlobalActiveRecord.prototype.beforeSave = function (validate) {
    return Promise.resolve({});
}
GlobalActiveRecord.prototype.afterSave = async function (insert) {
    return Promise.resolve({});
}
GlobalActiveRecord.prototype.afterDeleteAll = async function (condition) {
    return Promise.resolve({});
}

GlobalActiveRecord.prototype.afterUpdate = function (attributes_change, attributes_old, attributes_new) {
    GlobalCache.set_cache_by_model(this);
    GlobalCache.remove_cache_fk_by_model(this);
    GlobalCache.remove_cache_mul_by_model(this);
    return Promise.resolve(true);
}

GlobalActiveRecord.prototype.update = async function (validate) {
    var that = this;
    if (this.getPrimaryKey()) {
        var flag = true;
        if (validate) {
            var r = await this.validate();
            flag = r ? true : false;
        } else {
            flag = true;
        }
        if (flag) {
            /* BEGIN GET ATTRIBUTES UPDATE */
            var r = await that.get_table_fields();
            if (r) { }
            var rs = that.getAttributesUpdate();
            var attributes_change = that.get_only_attributes_in_db(rs);
            for (var i in rs) {
                if (i.match(/_(mul|MUL)$/gi) && rs[i] && rs[i].length && that.rule[i]['update_attr']) {
                    attributes_change[that.rule[i]['update_attr']] = rs[i].join(',');
                    that[that[i]['update_attr']] = rs[that.rule[i]['update_attr']];
                }
            }
            var attributes_old = that.get_only_attributes_in_db(that._old_attributes);
            var attributes_new = that.get_only_attributes_in_db(that.getAttributes());
            /* END GET ATTRIBUTES UPDATE */

            /* BEGIN BEFORE UPDATE */
            r = await that.beforeUpdate(attributes_change, attributes_old, attributes_new);
            if (r) { }
            /* END BEFORE UPDATE */

            /* BEGIN  UPDATE */
            if (Object.keys(attributes_change).length) {
                that.db.where(that.getWhereByPrimaryKey());
                if (CONFIG.MONGO[that.db_key]) {
                    attributes_change = { $set: attributes_change };
                }
                var rows = await that.db.update(that.tableName(), attributes_change);
                if (rows) { }
            }
            /* END UPDATE */


            /* BEGIN INSERT LIST */
            var r = await that.insert_list(rs);
            if (r) { }
            /* END INSERT LIST */

            /* BEGIN INSERT MULTI */
            r = await that.insert_mul(rs);
            if (r) { }
            /* END INSERT MULTI */

            return that.afterUpdate(attributes_change, attributes_old, attributes_new);
        } else {
            return Promise.resolve(false);
        }
    } else {
        return Promise.resolve(false);
    }
}
GlobalActiveRecord.prototype.updateAll = function (attributes, condition, params) {
    var defer = Q.defer();
    var id = this.getPrimaryKey();
    if (typeof (condition) == 'object') {
        this.db.where(condition);
    } else {
        this.db.where(condition, params);
    }
    return this.db.updateMany(this.tableName(), attributes);
}
GlobalActiveRecord.prototype.updateCommon = function (attributes, condition, params) {
    var defer = Q.defer();
    var id = this.getPrimaryKey();
    if (typeof (condition) == 'object') {
        this.db.where(condition);
    } else {
        this.db.where(condition, params);
    }
    this.db.updateCommon(this.tableName(), attributes, function (err, rows) {
        if (err) {
            throw err; defer.reject(err);
        } else {
            defer.resolve(rows);
        }
    })
    return defer.promise;
}

GlobalActiveRecord.prototype.findOne = async function (condition, get_fk_flag = false) {
    var that = this;
    var rs = {};
    var key_cache = false;
    function process(row) {
        that.resetAttributes();
        that.setAttributes(row);
        that._old_attributes = row;
        Object.assign(rs, row);
        if (get_fk_flag === false) {
            var select_db = Object.keys(that.labelAttributes);
            return GlobalFunction.when([
                that.get_mul(select_db, rs),
                that.get_fk(select_db, rs)
            ]).then(r => {
                return rs;
            })
        } else {
            return Promise.resolve(rs);
        }
    }
    var data = false;
    if (typeof (condition) == 'number' || (typeof (condition) == 'string' && condition.match(/^[0-9]+$/gi))) {
        key_cache = parseInt(condition);
    } else if (typeof (condition) == 'object' && condition.id) {
        key_cache = parseInt(condition.id);
    }
    var data = GlobalCache.get_cache_by_table_name_and_id(this.tableName(), key_cache);
    if (data) {
        return process(data);
    } else {
        if (typeof (condition) == 'object') {
            this.db.where(condition);
        } else {
            if (typeof (condition) == 'string' && condition.match(/ (\=|or|and) /gi)) {
                this.db.where(condition);
            } else {
                var id = this.getPrimaryKey();
                if (id == 'id') { condition = parseInt(condition); }
                if (id == 'ID') { condition = parseInt(condition); }
                this.db.where(id, condition);
            }
        }
        this.db.limit(1);
        return this.db.get(this.tableName()).then(rows => {
            if (rows && rows !== undefined && rows.length) {
                GlobalCache.set_cache_by_table_name_and_id(this.tableName(), key_cache, rows[0]);
                return process(rows[0]);
            } else {
                return rs;
            }
        })
    }
}
GlobalActiveRecord.prototype.findAll = async function (condition, params) {
    // this.db.resetQuery();
    if (typeof (condition) == 'object') {
        if (condition.select_db) { this.db.select(condition.select_db); }
        if (condition.limit_db) {
            if (condition.offset_db) {
                this.db.limit(condition.limit_db, condition.offset_db);
            } else {
                this.db.limit(condition.limit_db);
            }
        }
        if (condition.sort_db) { this.db.order_by(condition.sort_db); }
        if (condition.order_by) { this.db.order_by(condition.order_by); }
        if (condition.group_by) { this.db.group_by(condition.group_by); }
        if (condition.join) { this.db.join(condition.join[0], condition.join[1], condition.join[2]); }
        var condition_where = {};
        for (var k in condition) {
            if (!GlobalFunction.contains(k, ['select_db', 'limit_db', 'offset_db', 'sort_db', 'order_by', 'group_by', 'join'])) {
                condition_where[k] = condition[k];
            }
        }
        if (Object.keys(condition_where).length) {
            this.db.where(condition_where);
        }
    } else if (condition) {
        this.db.where(condition, params);
    }
    if (this.hasAttribute('is_delete') && !CONFIG.MONGO[this.db_key]) { this.db.where(this.tableName() + '.is_delete = 0'); }
    var rs = await this.db.get(this.tableName());
    return rs && rs.length ? rs : [];
}


GlobalActiveRecord.prototype.countAll = async function (condition, params) {
    var defer = Q.defer();
    var id = this.getPrimaryKey();
    if (typeof (condition) == 'object') {
        var condition_where = {};
        for (var k in condition) {
            if (!GlobalFunction.contains(k, ['select_db', 'limit_db', 'sort_db', 'order_by', 'group_by', 'join'])) {
                condition_where[k] = condition[k];
            }
        }
        if (Object.keys(condition_where).length) {
            this.db.where(condition_where);
        }
    } else if (condition !== undefined) {
        this.db.where(condition, params);
    }
    if (this.hasAttribute('is_delete') && !CONFIG.MONGO[this.db_key]) {
        this.db.where('`' + this.tableName() + '`.`is_delete` = 0');
    }
    if (this.tableName() == 'role') {
        // this.db.where('`id` != 1');
    }
    this.db.count(this.tableName(), function (err, rows) {
        if (err) {
            throw err; defer.reject(err);
        } else {
            defer.resolve(rows);
        }
    })
    return defer.promise;
}


GlobalActiveRecord.prototype.aggregate = async function (aggregate) {
    var defer = Q.defer();
    this.db.aggregate(this.tableName(), aggregate, function (err, rows) {
        if (err) {
            defer.resolve(false);
            // throw err; 
        } else {
            defer.resolve(rows);
        }
    });
    return defer.promise;
}


GlobalActiveRecord.prototype.bulkWrite = async function (list_bulk_write) {
    var defer = Q.defer();
    this.db.bulkWrite(this.tableName(), list_bulk_write, function (err, rows) {
        if (err) {
            throw err; defer.reject(err);
        } else {
            defer.resolve(rows);
        }
    });
    return defer.promise;
}

GlobalActiveRecord.prototype.buildWhereSearch = function (key, value, operator, that) {
    if (this.hasAttribute(key)) {
        var key_str = '';
        if (that && that !== undefined && that.tableName() == this.tableName()) {
            key_str = GlobalFunction.escapeFieldName(this.tableName() + '_' + 2, key);
        } else {
            key_str = GlobalFunction.escapeFieldName(this.tableName(), key);
        }

        if (key.match(/_(mul|MUL)$/gi)) {
            key_str = GlobalFunction.escapeFieldName(key, this.rule[key]['mul_id_fk']);
        } else if (key.match(/^list_/gi) && !(this.rule[key] && this.rule[key]['not_list']) && CONFIG.MYSQL[that.db_key]) {
            key_str = GlobalFunction.escapeFieldName(this.rule[key]['model'], 'id');
        }
        var operator2 = '';
        var value2 = '';
        var array_rs = [];
        if (GlobalFunction.is_array(value)) {
            var a = [];
            var fl = false;
            for (var item of value) {
                if (item === null || item == 'null') {
                    fl = true;
                } else {
                    a.push(item);
                }
            }
            value = a;
            if (fl) {
                array_rs.push(key_str + ' IS NULL');
            }
        }
        if (value == 'null') {
            operator2 = 'is';
            value2 = 'null';
        } else if (value == 'not null') {
            operator2 = 'is not';
            value2 = 'null';
        } else {
            operator2 = this.buildWhereOperator(key, value, operator);
            value2 = this.buildWhereSearchValue(key, value, operator);
        }
        if (value2 && typeof (value2) == 'string' && value2.match(/d/gi) && operator2.trim() == 'LIKE') {
            array_rs.push('(' + key_str + ' ' + operator2 + ' ' + value2 + ' OR ' + key_str + ' ' + operator2 + ' ' + value2.replace(/d/gi, 'đ') + ')');
        } else {
            array_rs.push(key_str + ' ' + operator2 + ' ' + value2);
        }
        if (array_rs.length > 1) {
            return '(' + array_rs.join(' OR ') + ')';
        } else {
            return array_rs[0];
        }
    } else {
        return '';
    }
}

GlobalActiveRecord.prototype.buildWhereOperator = function (key, value, operator) {
    if (!operator) {
        if (typeof (value) == 'object') {
            operator = " IN ";
        } else {
            operator = GlobalFunction.contains(this.rule[key]['type'], ['text', 'longtext', 'varchar', 'char', 'string']) ? ' LIKE ' : ' = ';
        }
    }
    return operator;
}

GlobalActiveRecord.prototype.buildWhereSearchValue = function (key, value, operator) {
    var key_str = GlobalFunction.escapeFieldName(this.tableName(), key);
    if (!operator) {
        operator = this.buildWhereOperator(key, operator);
    }
    if (typeof (operator) == 'string') {
        operator = operator.trim().toLowerCase();
    }
    var type = this.rule[key]['type'];
    var rs = '';
    if (typeof (value) == 'object') {
        if (GlobalFunction.contains(type, ['text', 'longtext', 'varchar', 'char'])) {
            for (var i in value) {
                value[i] = GlobalFunction.escapeString(value[i]);
            }
            rs = "('" + value.join("', '") + "')";
        } else {
            rs = "(" + value.join(",") + ")";
        }
    } else {
        if (operator == 'like') {
            value = GlobalFunction.escapeString(value);
            rs = "'%" + value + "%'";
        } else {
            if (GlobalFunction.contains(type, ['text', 'longtext', 'varchar', 'char'])) {
                value = GlobalFunction.escapeString(value);
                if (operator == '=') {
                    rs = "'" + value + "'";
                } else {
                    rs = "'%" + value + "%'";
                }
            } else if (GlobalFunction.contains(type, ['date', 'datetime'])) {
                if (operator == '<' || operator == '<=') {
                    var d = GlobalFunction.newDate(value);
                    if (d.getHours() == 0) {
                        value += ' 23:59:59';
                    }
                }
                rs = "'" + value + "'";
            } else {
                if (GlobalFunction.contains(operator, ['<', '<=']) && GlobalFunction.contains(key, ['created_time', 'modified_time'])) {
                    value += operator == '<=' ? 86399 : 86400;
                }
                rs = value;
            }
        }
    }
    return rs;
}

GlobalActiveRecord.prototype.search = function (params) {
    if (params) {
        this.setAttributes(params);
    }
    var attributesSearch = this.getAttributesSearch();
    for (var i in attributesSearch) {
        this.db.where(this.buildWhereSearch(i, attributesSearch[i]));
    }
    var defer = Q.defer();
    if (this.hasAttribute('is_delete')) {
        this.db.where('`' + this.tableName() + '`.`is_delete` = 0');
    }
    if (this.hasAttribute('IS_DELETE')) {
        this.db.where('`' + this.tableName() + '`.`IS_DELETE` = 0');
    }
    return this.db.get(this.tableName());
}

GlobalActiveRecord.prototype.build_on = function (on) {
    var str = '`' + on.table_name + '`.`' + on.attr + '` = ' + on.table_name_fk + '.`' + on.attr_fk + '`';
    if (on.table_name_fk_old) {
        var model = this.get_class_by_table_name(on.table_name_fk_old);
        if (model.hasAttribute('is_delete')) {
            str += ' AND `' + on.table_name_fk + '`.`is_delete` = 0';
        }
        if (model.hasAttribute('IS_DELETE')) {
            str += ' AND `' + on.table_name_fk + '`.`IS_DELETE` = 0';
        }
    }
    return str;
}

GlobalActiveRecord.prototype.buid_join = function (type, table_fk, ON) {
    return ' ' + type + ' JOIN `' + table_fk + '` ' + (table_fk == this.tableName() ? (' AS ' + table_fk + '_2') : '') + ' ON ' + (typeof (ON) == 'object' ? this.build_on(ON) : ON);
}

GlobalActiveRecord.prototype.joinTable = function (attr, type = 'INNER', ON = false) {
    if (ON) {
        this.db.join(attr, ON, type);
    } else if (attr.match(/_(mul|MUL)$/gi)) {
        return this.joinTableMul(attr, type, ON);
    } else if (attr.match(/^list_/gi) && !(this.rule[attr] && this.rule[attr]['not_list']) && CONFIG.MYSQL[this.db_key]) {
        return this.joinTableList(attr, type, ON);
    } else if (this.rule[attr] && this.rule[attr]['fk']) {
        var fk = this.rule[attr]['fk'];
        var table_fk = fk['table'];
        var ref_id = fk['ref_id'];
        if (!ON) {
            ON = this.build_on({
                table_name: this.tableName(),
                attr: attr,
                table_name_fk_old: table_fk,
                table_name_fk: table_fk == this.tableName() ? (table_fk + '_2') : table_fk,
                attr_fk: ref_id,
            });
        }
        this.db.join(table_fk, ON, type);
        return this.buid_join(type, table_fk, ON);
    }
}

GlobalActiveRecord.prototype.joinTableMul = function (attr, type = 'INNER', ON = false) {
    if (ON) {
        this.db.join(attr, ON, type);
        return this.buid_join(type, attr, ON);
    } else if (this.rule[attr]) {
        if (!ON) {
            ON = this.build_on({
                table_name: this.tableName(),
                attr: 'id',
                table_name_fk: attr,
                attr_fk: this.rule[attr]['mul_id'],
            })
        }
        this.db.join(attr, ON, type);
        return this.buid_join(type, attr, ON);
    }
}

GlobalActiveRecord.prototype.joinTableList = function (attr, type = 'INNER', ON = false) {
    if (ON) {
        this.db.join(attr, ON, type);
        return this.buid_join(type, attr, ON);
    } else if (this.rule[attr]) {
        if (!ON) {
            ON = this.build_on({
                table_name: this.tableName(),
                attr: 'id',
                table_name_fk: this.rule[attr]['model'],
                attr_fk: this.rule[attr]['fk_id'],
            })
        }
        this.db.join(this.rule[attr]['model'], ON, type);
        return this.buid_join(type, this.rule[attr]['model'], ON);
    }
}

GlobalActiveRecord.prototype.afterCondition = async function (condition, array_where) {
    return Promise.resolve(array_where);
}

GlobalActiveRecord.prototype.order_by_advance = function (order_by) {
    var that = this;
    list_join = {};
    var order_text = [];
    if (order_by) {
        order_by = order_by.replace(/[ ]+/gi, ' ');
        var a = order_by.split(',');
        for (var i in a) {
            var attr = a[i].split(' ');
            if (attr.length == 2 && this.hasAttribute(attr[0]) && GlobalFunction.contains(attr[1].toLowerCase(), ['asc', 'desc'])) {
                if (this.rule[attr[0]] && this.rule[attr[0]]['fk']) {
                    var table_fk = this.rule[attr[0]]['fk']['table'];
                    var ref_id = this.rule[attr[0]]['fk']['ref_id'];
                    if (table_fk != this.tableName()) {
                        list_join[attr[0]] = 'LEFT';
                    }
                    var model_fk = this.get_class_new_by_table_name(table_fk);
                    order_text.push(table_fk + '.' + (model_fk.attr_sort || model_fk.display_attr) + ' ' + attr[1]);
                } else {
                    if (that.check_attributes_in_db(attr[0])) {
                        order_text.push('`' + this.tableName() + '`.' + attr[0] + ' ' + attr[1]);
                    } else {
                        order_text.push(attr[0] + ' ' + attr[1]);
                    }
                }
            }
        }
    }
    return {
        order_text: order_text,
        list_join: list_join,
    };
}

GlobalActiveRecord.prototype.get_list_fk_in_rows = async function (rows, select_db, attributes_type) {
    var that = this;
    var defer = Q.defer();
    var LIMIT = 0, COUNT_DEFER = 0;
    function findAllMul(v, list_id) {
        var cl_obj = that.get_class_new_by_table_name(v);
        var a = {};
        if(that.rule[v])
        {
            a[that.rule[v]['mul_id']] = list_id;
            return cl_obj.findAll(a).then(r => {
                var rs_mul = {};
                var mul_id = that.rule[v]['mul_id'];
                var mul_id_fk = that.rule[v]['mul_id_fk'];
                for (var i in r) {
                    var m_id = r[i][mul_id];
                    var m_id_fk = r[i][mul_id_fk];
                    if (!rs_mul[m_id]) {
                        rs_mul[m_id] = [];
                    }
                    rs_mul[m_id].push(m_id_fk);
                }
                var id_label = CONFIG.DB2[that.db_key] ? 'ID' : 'id';
                for (var i in rows) {
                    if (rs_mul[rows[i][id_label]]) {
                        rows[i][v] = rs_mul[rows[i][id_label]].join(',');
                    }
                }
                return rows;
            })
        }
        return Promise.resolve([]);
        
    }

    if (rows && rows.length) {
        var list_id = GlobalFunction.indexArray(rows, CONFIG.DB2[that.db_key] ? 'ID' : 'id');
        for (var i in select_db) {
            var v = select_db[i];
            if (v.match(/_(mul|MUL)$/gi)) {
                LIMIT++;
                findAllMul(v, list_id).then(r => {
                    COUNT_DEFER++;
                    if (COUNT_DEFER == LIMIT) { defer.resolve(rows); }
                })
            }
        }
    }
    if (LIMIT == 0) {
        defer.resolve(rows);
    }
    return defer.promise;


}

GlobalActiveRecord.prototype.get_list_select_join = function (select_db) {
    var list_rs = {};
    for (var item of select_db) {
        if (!item.match(/ |\.\*/gi)) {
            var array_item = item.split('.');
            if (array_item.length > 1) {
                var that = this;
                var list_join = [];
                var attr = '';
                var item_child = '';
                var item_child_old = '';
                for (var i in array_item) {
                    item_child = array_item[i];
                    if (i < array_item.length - 1) {
                        if (item_child.match(/_(mul|MUL)$/gi)) {
                            list_join.push({
                                table_name_fk: item_child,
                                type: 'LEFT',
                                ON: {
                                    table_name: that.tableName(),
                                    attr: 'id',
                                    table_name_fk: item_child,
                                    attr_fk: that.rule[item_child]['mul_id'],
                                }
                            });
                            list_join.push({
                                table_name_fk: that.rule[item_child]['fk']['table'],
                                type: 'LEFT',
                                ON: {
                                    table_name: item_child,
                                    attr: that.rule[item_child]['mul_id_fk'],
                                    table_name_fk: that.rule[item_child]['fk']['table'],
                                    attr_fk: that.rule[item_child]['fk']['ref_id'],
                                }
                            });
                            item_child_old = item_child;
                            var that = this.get_class_new_by_table_name(that.rule[item_child]['fk']['table']);
                        } else if (that.rule[item_child]['fk'] && that.rule[item_child]['fk']['table']) {
                            list_join.push({
                                table_name_fk: that.rule[item_child]['fk']['table'],
                                type: 'LEFT',
                                ON: {
                                    table_name: that.tableName(),
                                    attr: item_child,
                                    table_name_fk: that.rule[item_child]['fk']['table'],
                                    attr_fk: that.rule[item_child]['fk']['ref_id'],
                                }
                            });
                            item_child_old = item_child;
                            var that = this.get_class_new_by_table_name(that.rule[item_child]['fk']['table']);
                        } else if (that.rule[item_child]['model'] && that.rule[item_child]['fk_id']) {
                            list_join.push({
                                table_name_fk: that.rule[item_child]['model'],
                                type: 'LEFT',
                                ON: {
                                    table_name: that.tableName(),
                                    attr: 'id',
                                    table_name_fk: that.rule[item_child]['model'],
                                    attr_fk: that.rule[item_child]['fk_id'],
                                }
                            });
                            item_child_old = item_child;
                            var that = this.get_class_new_by_table_name(that.rule[item_child]['model']);
                        }
                    } else {
                        if (item_child_old.match(/^list_/gi) && !(this.rule[item_child_old] && this.rule[item_child_old]['not_list']) && CONFIG.MYSQL[that.db_key]) {
                            attr = 'group_concat(`' + that.tableName() + '`.`' + item_child + "`) as '" + item + "'";
                        } else {
                            attr = '`' + that.tableName() + '`.`' + item_child + "` as '" + item + "'";
                        }
                    }
                }
                list_rs[item] = {
                    list_join: list_join,
                    attr: attr,
                    name: item_child
                };
            }
        }
    }
    return list_rs;
}

GlobalActiveRecord.prototype.buildSearchAdvance = function (condition) {
    var array_where = this.buildCondition(condition);
    var array_select_db = [];
    for (var item of condition) {
        if (item.key.match(/\./gi) && !GlobalFunction.contains(item.key, array_select_db)) {
            array_select_db.push(item.key);
        }
    }
    if (array_select_db.length) {
        list_select_join = this.get_list_select_join(array_select_db);
    }
    return {
        where: array_where,
        list_select_join: list_select_join,
    }
}

GlobalActiveRecord.prototype.build_query = function (data_select, array_join, array_where, order_text, flag_mul, limit, offset) {
    var array_query_main = [data_select.join(', ')];
    var re = new RegExp('`' + this.tableName() + '`', 'gi');
    var table_name_2 = this.tableName() + '_' + 2;
    if (array_query_main[0].match(re)) {
        array_query_main[0] = array_query_main[0].replace(re, '`' + table_name_2 + '`');
    }
    var select_old = array_query_main[0] ? (',' + (array_query_main[0] + ',').replace(/ as [^,]+?(,)/gi, '')) : '';

    array_query_main[0] = 'SELECT `' + this.tableName() + '`.*' + (array_query_main[0] ? ',' + array_query_main[0].replace(/`[a-zA-Z0-9_]+`\./gi, '`a`.') : '') + ' FROM `' + this.tableName() + '`';
    if(CONFIG.MYSQL[this.db_key]) {
        array_query_main[0] += ' INNER JOIN (SELECT `' + this.tableName() + '`.' + this.getPrimaryKey() + ' ' + select_old;
        array_query_main.push('FROM `' + this.tableName() + '`');
    }
    array_query_main.push(array_join.join(' '));
    for (var i in array_where) {
        if (i.match(/\./gi) && array_where[i].match(re)) {
            array_where[i] = array_where[i].split('`' + this.tableName() + '`.').join('`' + table_name_2 + '`.');
        }
    }
    array_where = GlobalFunction.values(array_where);
    array_query_main.push((array_where.length ? ' WHERE ' + array_where.join(' AND ') : ''));
    if (flag_mul) {
        array_query_main.push('group by ' + '`' + this.tableName() + '`.`' + this.getPrimaryKey() + '`');
    }
    var order_text_id = '`' + this.tableName() + '`.' + this.getPrimaryKey();
    var re = new RegExp(order_text_id, 'gi');
    var fl = true;
    if (order_text.length) {
        for (var item of order_text) {
            if (item.match(re)) {
                fl = false;
                break;
            }
        }
    }
    if (fl) {
        order_text.push(order_text_id + ' desc');
    }
    if (order_text.length) {
        array_query_main.push('ORDER BY ' + order_text.join(', '));
    }

    array_query_main.push(' LIMIT ' + limit + ' OFFSET ' + offset);
    if(CONFIG.MYSQL[this.db_key]) {
        array_query_main.push(') as a ON `' + this.tableName() + '`.' + this.getPrimaryKey() + ' = a.' + this.getPrimaryKey());
        if (order_text.length) {
            var re = new RegExp('`' + this.tableName() + '`', 'gi');
            var order_by = [];
            for (var item of order_text) {
                if (item.match(re)) {
                    order_by.push(item);
                }
            }
            if (order_by.length == order_text.length) {
                array_query_main.push('ORDER BY ' + order_by.join(', '));
            }
        }
    }
    return {
        data_select: data_select,
        array_join: array_join,
        array_where: array_where,
        array_query_main: array_query_main,
    };
}

GlobalActiveRecord.prototype.searchAdvance = async function (condition, limit = 50, offset = 0, attributes_type) {
    var that = this;
    var r = await that.get_table_fields();
    var order_by = '';
    var select_db = Object.keys(this.labelAttributes);
    var data_select = [];
    var list_select_join = {};
    var array_select_db = [];
    if (condition.select_db) {
        var array_select_db = typeof (condition.select_db) == 'string' ? condition.select_db.split(',') : condition.select_db;
        data_select = array_select_db;
    }
    if (condition.params) {
        for (var item of condition.params) {
            if (item.key.match(/\./gi) && !GlobalFunction.contains(item.key, array_select_db)) {
                array_select_db.push(item.key);
            }
        }
    }
    if (array_select_db.length) {
        list_select_join = this.get_list_select_join(array_select_db);
    }
    
    if (condition.order_by) {
        order_by = condition.order_by;
        delete condition['order_by'];
    }
    var array_where = this.buildCondition(condition, type = 'obj');
    var array_where = await this.afterCondition(condition, array_where);

    if (this.hasOwnProperty('is_delete')) {
        array_where['is_delete'] = '`' + this.tableName() + '`.`is_delete` = 0';
    }
    if (this.hasOwnProperty('IS_DELETE')) {
        array_where['IS_DELETE'] = '`' + this.tableName() + '`.`IS_DELETE` = 0';
    }
    if (this.tableName() == 'user') {
        array_where['type_user'] = '`user`.`id` NOT IN (1)';
    }
    var list_order_by_advance = this.order_by_advance(order_by);
    var list_join = list_order_by_advance.list_join;
    var order_text = list_order_by_advance.order_text;
    var flag_mul = false;
    if (condition.params && condition.params.length) {
        for (var i in condition.params) {
            var item = condition.params[i];
            if (item.key && item.key !== undefined) {
                if (item.key.match(/_(mul|MUL)$/gi)) {
                    list_join[item.key] = 'LEFT';
                    flag_mul = true;
                } else if (item.key.match(/^list_/gi) && !(this.rule[item.key] && this.rule[item.key]['not_list']) && CONFIG.MYSQL[that.db_key]) {
                    list_join[item.key] = 'LEFT';
                    flag_mul = true;
                }
            }
        }
    }
    var array_join = [];
    var order_by_attr = order_by ? order_by.split(' ')[0] : '';
    for (var i in list_join) {
        array_join.push(this.joinTable(i, list_join[i]));
        if (i.match(/_(mul|MUL)$/gi)) {
            if (order_by_attr == i) {
                var item_child = {
                    table_name_fk: that.rule[i]['fk']['table'],
                    type: 'LEFT',
                    ON: {
                        table_name: i,
                        attr: that.rule[i]['mul_id_fk'],
                        table_name_fk: that.rule[i]['fk']['table'],
                        attr_fk: that.rule[i]['fk']['ref_id'],
                    }
                };
                var join_str = this.buid_join(item_child.type, item_child.table_name_fk, item_child.ON);
                if (!GlobalFunction.contains(join_str, array_join)) {
                    this.db.join(item_child.table_name_fk, this.build_on(item_child.ON), item_child.type);
                    array_join.push(join_str);
                }
            }
            var table_fk = this.rule[i]['fk']['table'];
        }
    }
    if (Object.keys(list_select_join).length) {
        for (var attr in list_select_join) {
            var item_join = list_select_join[attr];
            for (var item_child of item_join.list_join) {
                var join_str = this.buid_join(item_child.type, item_child.table_name_fk, item_child.ON);
                if (!GlobalFunction.contains(join_str, array_join)) {
                    this.db.join(item_child.table_name_fk, this.build_on(item_child.ON), item_child.type);
                    array_join.push(join_str);
                }
            }
            data_select.push(item_join.attr);
        }
    }
    var rs = {};
    var query_obj = this.build_query(data_select, array_join, array_where, order_text, flag_mul, limit, offset);
    var array_query_main = query_obj['array_query_main'];
    array_join = query_obj['array_join'];
    array_where = query_obj['array_where'];
    var query_list = array_query_main.join(' ');
    if(CONFIG.DB2[this.db_key]) {
        query_list = query_list.replace(/`/gi,'');
    }
    var rows = await this.query(query_list);
    var query_count = 'select count(' + (flag_mul ? 'distinct `' + this.tableName() + '`.`id`' : '*') + ') as count from ' + this.tableName() + array_join.join(' ') + (array_where.length ? ' WHERE ' : '') + array_where.join(' AND ');
    if(CONFIG.DB2[this.db_key]) {
        query_count = query_count.replace(/`/gi,'');
    }
    var rows_count = await this.db.query(query_count);
    rs['list'] = await that.get_list_fk_in_rows(rows, select_db, attributes_type);
    if(rows_count && rows_count.length) {
        rs['count'] =  CONFIG.DB2[this.db_key] && rows_count && rows_count.length ?  rows_count[0]['COUNT'] : rows_count[0]['count'];
    } else {
        rs['count'] = 0;
    }
    
    if (this.check_fk(select_db)) {
        var get_fk = await this.get_fk(select_db, rs, list_select_join, attributes_type);
        if(get_fk){}
    }

    return rs;
}

GlobalActiveRecord.prototype.searchAdvanceCount = async function (condition) {
    var that = this;
    var defer = Q.defer();
    var order_by = '';
    var select_db = Object.keys(this.labelAttributes);
    var data_select = [];
    var list_select_join = {};
    var array_select_db = [];
    if (condition.select_db) {
        var array_select_db = typeof (condition.select_db) == 'string' ? condition.select_db.split(',') : condition.select_db;
        data_select = array_select_db;
    }
    if (condition.params) {
        for (var item of condition.params) {
            if (item.key.match(/\./gi) && !GlobalFunction.contains(item.key, array_select_db)) {
                array_select_db.push(item.key);
            }
        }
    }
    if (array_select_db.length) {
        list_select_join = this.get_list_select_join(array_select_db);
    }
    if (condition.order_by) {
        order_by = condition.order_by;
        delete condition['order_by'];
    }
    var array_where = this.buildCondition(condition, type = 'obj');
    var array_where = await this.afterCondition(condition, array_where);

    if (this.hasOwnProperty('is_delete')) {
        array_where['is_delete'] = '`' + this.tableName() + '`.`is_delete` = 0';
    }
    if (this.tableName() == 'user') {
        array_where['type_user'] = '`user`.`id` NOT IN (1)';
    }
    var list_order_by_advance = this.order_by_advance(order_by);
    var list_join = list_order_by_advance.list_join;
    var order_text = list_order_by_advance.order_text;
    var flag_mul = false;
    if (condition.params && condition.params.length) {
        for (var i in condition.params) {
            var item = condition.params[i];
            if (item.key && item.key !== undefined) {
                if (item.key.match(/_(mul|MUL)$/gi)) {
                    list_join[item.key] = 'LEFT';
                    flag_mul = true;
                } else if (item.key.match(/^list_/gi) && !(this.rule[item.key] && this.rule[item.key]['not_list']) && CONFIG.MYSQL[that.db_key]) {
                    list_join[item.key] = 'LEFT';
                    flag_mul = true;
                }
            }
        }
    }
    var array_join = [];
    var order_by_attr = order_by ? order_by.split(' ')[0] : '';
    for (var i in list_join) {
        array_join.push(this.joinTable(i, list_join[i]));
        if (i.match(/_(mul|MUL)$/gi)) {
            if (order_by_attr == i) {
                var item_child = {
                    table_name_fk: that.rule[i]['fk']['table'],
                    type: 'LEFT',
                    ON: {
                        table_name: i,
                        attr: that.rule[i]['mul_id_fk'],
                        table_name_fk: that.rule[i]['fk']['table'],
                        attr_fk: that.rule[i]['fk']['ref_id'],
                    }
                };
                var join_str = this.buid_join(item_child.type, item_child.table_name_fk, item_child.ON);
                if (!GlobalFunction.contains(join_str, array_join)) {
                    this.db.join(item_child.table_name_fk, this.build_on(item_child.ON), item_child.type);
                    array_join.push(join_str);
                }
            }
            var table_fk = this.rule[i]['fk']['table'];
        }
    }
    if (Object.keys(list_select_join).length) {
        for (var attr in list_select_join) {
            var item_join = list_select_join[attr];
            for (var item_child of item_join.list_join) {
                var join_str = this.buid_join(item_child.type, item_child.table_name_fk, item_child.ON);
                if (!GlobalFunction.contains(join_str, array_join)) {
                    this.db.join(item_child.table_name_fk, this.build_on(item_child.ON), item_child.type);
                    array_join.push(join_str);
                }
            }
            data_select.push(item_join.attr);
        }
    }
    var query_obj = this.build_query(data_select, array_join, array_where, order_text, flag_mul, 0, 0);

    array_join = query_obj['array_join'];
    array_where = query_obj['array_where'];

    var query_count = 'select count(' + (flag_mul ? 'distinct `' + this.tableName() + '`.`id`' : '*') + ') as count from ' + this.tableName() + array_join.join(' ') + (array_where.length ? ' WHERE ' : '') + array_where.join(' AND ');
    var rows = await this.db.query(query_count);
    var rs = { count: rows[0]['count'] };
    return rs;
}

GlobalActiveRecord.prototype.check_fk = function (select_db) {
    var LIMIT = 0, COUNT_LIMIT = 0;
    for (var i in select_db) {
        var v = select_db[i];
        if (this.rule[v] && this.rule[v]['fk']) {
            return true;
        }
    }
    return false;
}

GlobalActiveRecord.prototype.get_mul = function (select_db, rs) {
    var LIMIT = 0, COUNT_DEFER = 0;
    var defer = Q.defer();
    var that = this;
    async function findAllMul(v) {
        var rs_mul = GlobalCache.get_cache_mul_by_model(that, v);
        if (!rs_mul) {
            var cl_obj = that.get_class_new_by_table_name(v);
            var a = {};
            var id_label = CONFIG.DB2[that.db_key] ? 'ID' : 'id';
            if (cl_obj.attr_sort) {
                a['order_by'] = cl_obj.attr_sort;
            }
            if(that.rule[v].attr_sort) {
                a['order_by'] = that.rule[v].attr_sort;
            }
            a[that.rule[v]['mul_id']] = rs[id_label];
            var r = await cl_obj.findAll(a);
            var rs_mul = [];
            for (var i in r) {
                rs_mul.push(r[i][that.rule[v]['mul_id_fk']]);
            }
            GlobalCache.set_cache_mul_by_table_name_attr_id(that.tableName(), that[id_label], v, rs_mul);
        }
        rs[v] = rs_mul;
        that[v] = rs_mul;
        that._old_attributes[v] = rs_mul;
        return Promise.resolve(rs_mul);
    }
    for (var i in select_db) {
        var v = select_db[i];
        if (v.match(/_(mul|MUL)$/gi)) {
            LIMIT++;
            findAllMul(v).then(r => {
                COUNT_DEFER++;
                if (COUNT_DEFER == LIMIT) { defer.resolve(rs); }
            })
        }
    }
    if (LIMIT == 0) {
        defer.resolve({});
    }
    return defer.promise;
}

GlobalActiveRecord.prototype.get_fk = async function (select_db, rs, list_select_join, attributes_type) {
    var LIMIT = 0, COUNT_DEFER = 0;
    var defer = Q.defer();
    var that = this;

    function set_value_vl(r, attr, that_in, v = false) {
        var k = 'fk_table_' + r.attribute + (attr ? '_' + attr : '');
        var default_array = [];
        if (!r.attribute.match(/_(mul|MUL)$/gi)) {
            default_array.push({ id: '', text: '-- Chọn --' });
        }
        if (that_in.rule[r.attribute]['fk']['null']) {
            default_array.push({ id: 'null', text: that_in.rule[r.attribute]['fk']['labelnull'] || 'Chưa có' });
        }
        var at = attr ? attr : 'text';
        for (var row of r.list) {
            var it = {
                id: row.id||row.ID,
                text: row[at],
            };
            if (v && that_in.rule[v]['fk']['select']) {
                if (typeof (that_in.rule[v]['fk']['select']) == 'string') {
                    that_in.rule[v]['fk']['select'] = that_in.rule[v]['fk']['select'].split(',');
                }
                for (var it_attribute of that_in.rule[v]['fk']['select']) {
                    var a = it_attribute.split(" ");
                    var attr_it = a[a.length - 1];
                    it[attr_it] = row[attr_it];
                }
            }
            default_array.push(it);
        }
        rs[k] = default_array;
        that[k] = default_array;
        that[k + '_obj'] = GlobalFunction.indexObj(default_array, 'id', 'text');
    }

    function calc_v_attribute(item, that_in, select_display) {
        var a = item.split('.');
        var v = a[a.length - 1];
        if (that_in.rule[v] && that_in.rule[v]['fk']) {
            LIMIT++;
            var cl_obj = that_in.get_class_new_by_table_name(that_in.rule[v]['fk']['table']);
            cl_obj.findAllByAttribute(v, that_in, select_display).then(r => {
                if (select_display.length == 2) {
                    var select_display_item = select_display[0].replace(/^[^\.]+?(\.)|`/gi, '');
                    if (a.length > 1) {
                        set_value_vl(r, select_display_item, that_in, v);
                    } else {
                        set_value_vl(r, '', that_in, v);
                    }
                } else {
                    for (var select_display_item of select_display) {
                        if (!select_display_item.match(/`text`/gi)) {
                            var select_display_item = select_display_item.replace(/^[^\.]+?(\.)|`/gi, '');
                            if (select_display_item != cl_obj.display_attr || a.length > 1) {
                                set_value_vl(r, select_display_item, that_in, v);
                            }
                        } else {
                            if (a.length == 1) {
                                set_value_vl(r, '', that_in, v);
                            }
                        }
                    }
                }

                COUNT_DEFER++;
                if (COUNT_DEFER == LIMIT) { defer.resolve(rs); }
            })
        }
    }
    var list_query = {};
    for (var v of select_db) {
        if (!attributes_type || attributes_type === undefined || !Object.keys(attributes_type).length || attributes_type[v]) {
            if (this.rule[v] && this.rule[v]['fk']) {
                var cl_obj = this.get_class_new_by_table_name(this.rule[v]['fk']['table']);
                var display_name = cl_obj.tableName() + '.' + cl_obj.display_attr;
                list_query[v] = {
                    this: this,
                    select: [display_name, display_name + ' as "text"']
                };
            }
        }
    }

    if (list_select_join && list_select_join !== undefined && Object.keys(list_select_join).length) {
        for (var attr in list_select_join) {
            if (!attributes_type || attributes_type === undefined || !Object.keys(attributes_type).length || !attributes_type[attr]) {
                var item = list_select_join[attr];
                var a = attr.split('.');
                var attr_name = a[a.length - 1];
                var key = attr.replace(/\.[a-zA-Z_]+$/gi, '');
                var join_in = item.list_join[item.list_join.length - 1];
                var thiss = this.get_class_new_by_table_name(join_in.ON['table_name']);
                var display_name = join_in.ON['table_name_fk'] + '.' + attr_name;
                if (!list_query[key]) {
                    list_query[key] = {
                        this: thiss,
                        select: [display_name, display_name + ' as "text"'],
                    };
                } else {
                    if (!GlobalFunction.contains(display_name, list_query[key].select)) {
                        list_query[key].select.push(display_name);
                    }
                }
            }
        }
    }
    for (var item in list_query) {
        calc_v_attribute(item, list_query[item].this, list_query[item].select);
    }

    if (LIMIT == 0) {
        defer.resolve({});
    }
    return defer.promise;
}

var list_require_by_table = {};

GlobalActiveRecord.prototype.get_class_require_by_table_name = function (table_name) {
    if (!list_require_by_table[table_name]) {
        var link_admin = CONFIG.APPLiCATION_PATH + 'models/common/' + GlobalFunction.getModelByTableName(table_name) + '.js';
        if (GLOBAL_FILE.isFile(link_admin)) {
            list_require_by_table[table_name] = require('../models/common/' + GlobalFunction.getModelByTableName(table_name));
        } else {
            list_require_by_table[table_name] = require('../application/' + this.project_key + '/models/' + GlobalFunction.getModelByTableName(table_name));
        }
    }
    return list_require_by_table[table_name];
}

var list_class_instance = {};
var list_class_require_instance = {};

GlobalActiveRecord.prototype.get_class_require_by_list_model = function (table_name) {
    table_name = table_name.toLowerCase();
    if (!list_class_require_instance[table_name]) {
        var list_model_in_application = GLOBAL_FILE.scanDir(CONFIG.APPLiCATION_PATH + 'models/common/');
        for(var it of list_model_in_application) {
            if(it.match(/\.js$/gi)) {
                var md_require = require('../models/common/' + it.replace(/\.js$/gi,''));
                if(md_require) {
                    var md = new md_require();
                    if(md.tableName) {
                        list_class_require_instance[md.tableName()] = md_require;
                    }
                }
            }
        }

        var list_model_in_application = GLOBAL_FILE.scanDir(CONFIG.APPLiCATION_PATH + 'application/' + this.project_key + '/models/');
        if(list_model_in_application && list_model_in_application.length) {
            for(var it of list_model_in_application) {
                if(it.match(/\.js$/gi)) {
                    var link = '../application/' + this.project_key + '/models/' + it.replace(/\.js$/gi,'');
                    var md_require = require(link);
                    if(md_require) {
                        var md = new md_require();
                        if(md.tableName) {
                            list_class_require_instance[md.tableName()] = md_require;
                        }
                    }
                }
            }
        }
    }
    return list_class_require_instance[table_name];
}

GlobalActiveRecord.prototype.get_class_new_by_table_name = function (table_name) {
    var model_require = this.get_class_require_by_list_model(table_name);
    var model = new model_require();
    model.req = this.req;
    // model.setDb(this.db_key);
    return model;
}

GlobalActiveRecord.prototype.get_class_by_table_name = function (table_name) {
    if (!list_class_instance[table_name]) {
        var model_require = this.get_class_require_by_table_name(table_name);
        list_class_instance[table_name] = new model_require();
        list_class_instance[table_name].req = this.req;
        // list_class_instance[table_name].setDb(this.db_key);
    }
    return list_class_instance[table_name];
}

GlobalActiveRecord.prototype.findAllByAttribute = function (v, that, select_display) {
    var condition = [];
    if (this.hasOwnProperty('status')) {
        condition.push({ key: 'status', value: 1, operator: '=' });
    }
    var flag = true;
    if (v.match(/_city$/gi)) {
        condition.push({ key: 'pid', value: 0, operator: '=' });
    } else if (v.match(/_county$/gi)) {
        var vl = v.replace(/_county$/gi, '_city');
        if (that[vl]) {
            condition.push({ key: 'pid', value: that[vl], operator: '=' });
        } else {
            flag = false;
        }
    } else if (v.match(/_ward$/gi)) {
        var vl = v.replace(/_ward$/gi, '_county');
        if (that[vl]) {
            condition.push({ key: 'pid', value: that[vl], operator: '=' });
        } else {
            flag = false;
        }
    }
    if (!flag) {
        return Promise.resolve({
            attribute: v,
            list: [],
        });
    }
    condition = this.buildCondition(condition);
    var order_by = this.tableName() + '.' + 'id = 9999999,' + this.tableName() + '.' + this.display_attr + ' ASC';
    if (that.RULE[v]['fk']) {
        if (that.RULE[v]['fk']['findall']) {
            var condition_findall = typeof (that.RULE[v]['fk']['findall']) == 'function' ? that.RULE[v]['fk']['findall'].apply(that) : that.RULE[v]['fk']['findall'];
            if (condition_findall) {
                condition.push(condition_findall);
            }
        }
    }
    condition = condition.join(' AND ');
    var data = GlobalCache.get_cache_fk_by_model(this, that, v, condition);
    if (data) {
        return Promise.resolve({
            attribute: v,
            list: data,
        });
    } else {
        if (that.RULE[v]['fk']) {
            if (that.RULE[v]['fk']['order_by']) {
                order_by = that.RULE[v]['fk']['order_by'];
            }
            if (that.RULE[v]['fk']['join']) {
                if (that.RULE[v]['fk']['join'][0] && typeof (that.RULE[v]['fk']['join'][0]) == 'object') {
                    var fl_item = true;
                    for (var i in that.RULE[v]['fk']['join']) {
                        var item = that.RULE[v]['fk']['join'][i];
                        this.joinTable(item[0], item[1], item[2]);
                        if (item[0].match(/_(mul|MUL)$/gi) && fl_item) {
                            this.db.group_by(this.tableName() + '.id');
                            fl_item = false;
                        }
                    }
                } else {
                    this.joinTable(that.RULE[v]['fk']['join'][0], that.RULE[v]['fk']['join'][1]);
                    if (that.RULE[v]['fk']['join'][0].match(/_(mul|MUL)$/gi)) {
                        this.db.group_by(this.tableName() + '.id');
                    }
                }
            }
        }
        var select = [
            this.tableName() + '.' + 'id',
        ].concat(select_display);
        for (var i in select_display) { }
        if (that.RULE[v]['fk']['select']) {
            if (typeof (that.RULE[v]['fk']['select']) == 'string') {
                that.RULE[v]['fk']['select'] = that.RULE[v]['fk']['select'].split(',');
            }
            select = select.concat(that.RULE[v]['fk']['select']);
        }
        this.db.select(select);
        this.db.order_by(order_by);
        var that_parent = this;
        return this.findAll(condition).then(r => {
            GlobalCache.set_cache_fk_by_model(that_parent, that, v, condition, r);
            return Promise.resolve({
                attribute: v,
                list: r,
            });
        })
    }

}

GlobalActiveRecord.prototype.countSearchAdvance = function (condition) {
    var defer = Q.defer();
    var array_where = this.buildCondition(condition);
    if (this.tableName() == 'user') {
        array_where.push('`user`.`id` NOT IN (1)');
    }
    for (var i in array_where) {
        var where = array_where[i];
        this.db.where(where);
    }
    if (this.hasOwnProperty('is_delete')) {
        this.db.where('`is_delete` = 0');
    }
    this.db.limit(limit, offset);
    this.db.count(this.tableName(), function (err, rows) {
        if (err) {
            throw err; defer.reject(err);
        } else {
            defer.resolve(rows);
        }
    })
    return defer.promise;
}


GlobalActiveRecord.prototype.buildCondition = function (condition, type = 'array') {
    var rs = {};
    data = condition;
    if (condition.params) {
        data = condition.params;
    }
    for (var i in data) {
        var attr = data[i];
        if (typeof (attr) == 'object') {
            if (!(attr['value'] === undefined || attr['value'] === '' || attr['value'] === null || attr['value'] === false)) {
                if (this.hasAttribute(attr['key'])) {
                    if (!rs[attr['key']]) { rs[attr['key']] = ''; } else { rs[attr['key']] += ' AND '; }
                    if (attr['operator'] == "and") {
                        rs[attr['key']] += ' ( ';
                        if (Array.isArray(attr['value'])) {
                            attr['value'].forEach(element => {
                                rs[attr['key']] += ' ( ' + this.buildWhereSearch(attr['key'], element, "like") + ' ) ';
                                if (attr['value'][attr['value'].length - 1] != element) {
                                    rs[attr['key']] += ' OR ';
                                }
                            });
                        }
                        else {
                            rs[attr['key']] += this.buildWhereSearch(attr['key'], attr['value'], "like");
                        }
                        rs[attr['key']] += ' ) ';
                    } else {
                        rs[attr['key']] += this.buildWhereSearch(attr['key'], attr['value'], attr['operator'])
                    }
                } else if (attr['key'].match(/\./gi)) {
                    var array_item = attr['key'].split('.');
                    var that = this;
                    for (var j in array_item) {
                        var item_child = array_item[j];
                        if (j < array_item.length - 1) {
                            if (that.rule[item_child]['fk'] && that.rule[item_child]['fk']['table']) {
                                var that = this.get_class_new_by_table_name(that.rule[item_child]['fk']['table']);
                            } else if (that.rule[item_child]['model'] && that.rule[item_child]['fk_id']) {
                                var that = this.get_class_new_by_table_name(that.rule[item_child]['model']);
                            }
                        } else {
                            if (!rs[attr['key']]) { rs[attr['key']] = ''; } else { rs[attr['key']] += ' AND '; }
                            rs[attr['key']] += that.buildWhereSearch(item_child, attr['value'], attr['operator'], this);
                        }
                    }
                }
            }
        } else {
            if (this.hasAttribute(i)) {
                rs[i] = this.buildWhereSearch(i, attr);
            }
        }
    }
    return type == 'obj' ? rs : GlobalFunction.values(rs);
}


GlobalActiveRecord.prototype.exists = function (attr) {
    var that = this;
    // if(this.hasAttribute('is_delete')) {
    //     this.db.where('`is_delete` = 0');
    // }
    var where = {};
    where[attr] = this[attr];
    this.db.where(where);
    var def = Q.defer();
    this.db.limit(1);
    return this.db.get(this.tableName()).then(rows => {
        return rows && rows.length ? true : false;
    })
}
GlobalActiveRecord.prototype.unique = function (attr, options) {
    var that = this;
    // if(this.hasAttribute('is_delete')) {
    //     this.db.where('`is_delete` = 0');
    // }
    var where = [
        {
            key: attr,
            value: this[attr],
            operator: '=',
        }
    ];
    where = this.buildCondition(where);
    if (options.where) {
        if (typeof (options.where) == 'string') {
            where.push(options.where);
        } else if (typeof (options.where) == 'function') {
            where.push(options.where.apply(this));
        }
    }
    where = where.join(' AND ');
    this.db.where(where);
    this.db.limit(1);
    if (!that.isNewRecord()) {
        this.db.where("`id` != " + this.id);
    }
    return this.db.get(this.tableName()).then(rows => {
        return rows && rows.length ? false : true;
    })
}

GlobalActiveRecord.prototype.get_condition_from_query = function () {
    var query = Object.assign({}, this.req.query), limit = 50, offset = 0;
    delete query['columns_excel'];
    delete query['table_name'];
    if (query['limit']) {
        limit = parseInt(query['limit']);
        if (limit > 1000) {
            limit = 1000;
        }
        delete query['limit'];
    }
    if (query['offset']) {
        offset = parseInt(query['offset']);
        delete query['offset'];
    }
    var condition = {};
    if (query.select_db) {
        condition.select_db = query.select_db;
        delete query.select_db;
    }
    if (query['order_by']) {
        condition['order_by'] = query['order_by'];
        delete query['order_by'];
    }
    var params_search = [];
    for (var i in query) {
        var array_value = query[i].split('||');
        for (var j in array_value) {
            var array_value_operator = array_value[j].split('|');
            params_search.push({
                key: i,
                value: GlobalFunction.getValueSearch(i, array_value_operator[0]),
                operator: array_value_operator.length > 1 ? array_value_operator[1] : undefined,
            });
        }
    }
    condition['params'] = params_search;
    return {
        condition: condition,
        limit: limit,
        offset: offset,
    };
}
GlobalActiveRecord.prototype.attributesExcel = function () {
    if (this.columns_excel && this.columns_excel !== undefined) {
        return this.columns_excel;
    } else {
        var rs = [];
        for (var i in this.labelAttributes) {
            rs.push({
                label: this.labelAttributes[i],
                attribute: i,
            })
        }
        return rs;
    }
}

GlobalActiveRecord.prototype.findAllData = function (condition, not_rule) {
    var that = this;
    var rule = that.rule;
    if (!condition['order_by']) {
        if (rule['priority']) {
            condition['order_by'] = '`' + this.tableName() + '`.`priority` asc';
        } else if (rule['odr']) {
            condition['order_by'] = '`' + this.tableName() + '`.`odr` asc';
        }
    }
    return that.findAll(condition).then(r => {
        function load(k) {
            var model = rule[k].model;
            if (typeof (model) == 'string') {
                model = that.get_class_new_by_table_name(model);
            }
            var cond = {};
            var attr = rule[k].fk_id;
            var id_label = CONFIG.DB2[model.db_key] ? 'ID' : 'id';
            cond[rule[k].fk_id] = GlobalFunction.indexArray(r, id_label);
            if (cond[rule[k].fk_id].length) {
                return model.findAllData(cond).then(r_cond => {
                    var list_id = {};
                    for (var i in r_cond) {
                        var item = r_cond[i];
                        if (!list_id[item[attr]]) {
                            list_id[item[attr]] = [];
                        }
                        list_id[item[attr]].push(item);
                    }
                    for (var i in r) {
                        if (list_id[r[i][id_label]]) {
                            r[i][k] = list_id[r[i][id_label]];
                        }
                    }
                    return r;
                });
            } else {
                return Promise.resolve(r);
            }
        }
        function load_find_one_data(k) {

            var k_attr = rule[k]['update_id'] || k.replace(/^fk_table_/gi, '');

            if (r.length) {
                var def_find_one = Q.defer(), count_find_one = 0, limit_find_one = 0;
                function load_find_one(i) {
                    var model = rule[k]['fk'].model || rule[k]['fk'].table;
                    if (typeof (model) == 'string') {
                        model = that.get_class_new_by_table_name(model);
                    }
                    model.setAttributes(r[i]);
                    var cond = {};
                    cond[rule[k]['fk'].ref_id] = r[i][k_attr];
                    return model.findOneData(cond).then(r_find_one => {
                        r[i][k] = r_find_one;
                        return Promise.resolve(r);
                    })
                }
                for (var i in r) {
                    if (r[i][k_attr] !== null) {
                        limit_find_one++;
                        load_find_one(i).then(r_find_one => {
                            count_find_one++;
                            if (count_find_one == limit_find_one) {
                                def_find_one.resolve(r);
                            }
                        })
                    }
                }
                if (!limit_find_one) {
                    def_find_one.resolve(r);
                }
                return def_find_one.promise;
            } else {
                return Promise.resolve(r);
            }
        }

        function load_find_mul_data(k) {
            if (r.length) {
                var def_find_one = Q.defer();
                var model = that.get_class_by_table_name(k);
                var condition = {};
                if (model.attr_sort) {
                    condition['order_by'] = model.attr_sort;
                }
                var id_label = CONFIG.DB2[model.db_key] ? 'ID' : 'id';
                var attr_mul_id = rule[k]['mul_id'];
                var attr_mul_id_fk = rule[k]['mul_id_fk'];
                condition[attr_mul_id] = GlobalFunction.indexArray(r, id_label);
                return model.findAll(condition).then(rs => {
                    var list_id_obj = {};
                    for (var i in rs) {
                        var mul_id = rs[i][attr_mul_id];
                        var mul_id_fk = rs[i][attr_mul_id_fk];
                        if (!list_id_obj[mul_id]) {
                            list_id_obj[mul_id] = [mul_id_fk];
                        } else {
                            list_id_obj[mul_id].push(mul_id_fk);
                        }
                    }
                    for (var i in r) {
                        if (list_id_obj[r[i][id_label]]) {
                            r[i][k] = list_id_obj[r[i][id_label]];
                        }
                    }
                    return r;
                })

            } else {
                return Promise.resolve(r);
            }
        }
        var def = Q.defer();
        var list_k = [];
        var count_k = 0, limit_k = 0;
        for (var k in rule) {
            var v = rule[k];
            if (!(not_rule && not_rule !== undefined && not_rule.length && GlobalFunction.contains(k, not_rule))) {
                if (k.match(/^list_/gi) && !(this.rule[k] && this.rule[k]['not_list']) && v['fk_id'] && CONFIG.MYSQL[that.db_key]) {
                    limit_k++;
                    load(k).then(r_cond => {
                        count_k++; if (count_k == limit_k) { def.resolve(r); }
                    })
                } else if (k.match(/^fk_table_/gi) && v['fk']) {
                    limit_k++;
                    load_find_one_data(k).then(r_cond => {
                        count_k++; if (count_k == limit_k) { def.resolve(r); }
                    })
                } else if (k.match(/_(mul|MUL)$/gi) && v['fk']) {
                    limit_k++;
                    load_find_mul_data(k).then(r_cond => {
                        count_k++; if (count_k == limit_k) { def.resolve(r); }
                    })
                }
            }
        }
        if (!limit_k) {
            def.resolve(r);
        }
        return def.promise;
    });
}

GlobalActiveRecord.prototype.findOneData = function (condition) {
    var that = this;
    var rule = that.rule;
    return that.findOne(condition).then(r => {
        var def = Q.defer();
        if (r) {
            function load(k) {
                var model = rule[k].model;
                if (typeof (model) == 'string') {
                    model = that.get_class_new_by_table_name(model);
                }
                var cond = {};
                var attr = rule[k].fk_id;
                var id_label = CONFIG.DB2[model.db_key] ? 'ID' : 'id';
                cond[rule[k].fk_id] = r[id_label];
                return model.findAllData(cond).then(r_cond => {
                    r[k] = r_cond;
                    that[k] = r_cond;
                    return r;
                });
            }
            function load_find_one_data(k) {
                var model = rule[k]['fk'].model || rule[k]['fk'].table;
                if (typeof (model) == 'string') {
                    model = that.get_class_new_by_table_name(model);
                }
                var cond = {};
                var k_attr = rule[k]['update_id'] || k.replace(/^fk_table_/gi, '');
                cond[rule[k]['fk'].ref_id] = r[k_attr];
                return model.findOneData(cond).then(r_cond => {
                    r[k] = r_cond;
                    that[k] = r_cond;
                    return r;
                });
            }
            var list_k = [];
            var count_k = 0, limit_k = 0;
            for (var k in rule) {
                var v = rule[k];
                if (k.match(/^list_/gi) && !(this.rule[k] && this.rule[k]['not_list']) && v['fk_id']) {
                    limit_k++;
                    load(k).then(r_cond => {
                        count_k++;
                        if (count_k == limit_k) {
                            def.resolve(r);
                        }
                    })
                } else if (k.match(/^fk_table_/gi) && v['fk']) {
                    limit_k++;
                    load_find_one_data(k).then(r_cond => {
                        count_k++;
                        if (count_k == limit_k) {
                            def.resolve(r);
                        }
                    })
                }
            }
            if (!limit_k) {
                def.resolve(r);
            }
        } else {
            def.resolve(r);
        }
        return def.promise;
    });
}

GlobalActiveRecord.prototype.get_fk_mul = function () {
    var def = Q.defer();
    var that = this;
    var select_db = Object.keys(that.labelAttributes);
    var rs = this.getAttributes();
    GlobalFunction.when([
        // that.get_mul(select_db, rs),
        that.get_fk(select_db, rs)
    ]).then(r => {
        def.resolve(rs);
    })
    return def.promise;
}

GlobalActiveRecord.prototype.ref_fk_by_attribute = async function (attribute, cond) {
    var cl_obj = this.get_class_new_by_table_name(this.rule[attribute]['fk']['table']);
    var data = await cl_obj.findAll(cond);
    var rs = [];
    for (var it of data) {
        rs.push({
            id: it.id,
            text: it.name,
            name: it.name,
        });
    }
    return rs;
}

GlobalActiveRecord.prototype.query = async function (query, params = []) {
    return this.db.query(query, params);
}

GlobalActiveRecord.prototype.queryUpdateByList = async function (list, limit = 20) {
    var that = this;
    return GlobalFunction.runMultiRequest(list, async function (data, index) {
        return that.db.queryUpdate(query);
    }, limit);
}

GlobalActiveRecord.prototype.queryUpdate = async function (query, params = []) {
    return this.db.queryUpdate(query, params);
}

GlobalActiveRecord.prototype.queryCursor = async function (query, params = []) {
    return this.db.queryCursor(query, params);
}

GlobalActiveRecord.prototype.queryPrepareStatement = async function (query, params = []) {
    return this.db.queryPrepareStatement(query, params);
}

GlobalActiveRecord.prototype.transfer_mysql_to_mongodb = async function (condition = {}, db_key, table_name) {
    var list = await this.findAll(condition);
    if (!list && !list.length) {
        return false;
    }
    var model = new GlobalActiveRecord();
    model.setDb(db_key);
    model._table_name = table_name;
    for (var item of list) {
        item._id = item.id;
        delete item.id;
    }
    return model.insertMany(list);
}

GlobalActiveRecord.prototype.run_dublicate_data = async function (func, total_count, limit = 100000, process = 200) {
    var that = this;
    var total_process = Math.ceil(total_count / limit);
    var list_process = [];
    for (var i = 0; i < total_process; i++) {
        list_process.push(i);
    }
    var process_trust = total_process > process ? process : total_process;
    return GlobalFunction.runMultiRequest(list_process, function (data, index) {
        var item = data[index];
        return that.findAll({ limit_db: limit, offset_db: item * limit }).then(r => {
            return func(r).then(rr => {
                return {
                    i: index,
                    data: true
                }
            })
        })
    }, process_trust);
}

GlobalActiveRecord.prototype.tokenInput = async function (search, field, field_count = false) {
    if (CONFIG.MYSQL[this.db_key]) {
        var condition = field + " like '%" + GlobalFunction.escapeString(search) + "%'";
        return this.query("select id,name,pid from " + this.tableName() + " where " + condition + " limit 1000 order by id desc");
    } else {
        var condition = { limit_db: 1000 };
        condition['is_delete'] = {$ne:1};
        if (field) {
            condition[field] = search;
        }
        if (field_count) {
            condition[field_count] = { $gt: 0 };
        }
        return this.findAll(condition);
    }
}

GlobalActiveRecord.prototype.call_func_mongodb = async function (func_name, argv) {
    var r = await this.db.call_func(func_name, argv);
    if (r && r._batch) {
        return r._batch;
    }
    return r;
}

GlobalActiveRecord.prototype.update_list_keyword = async function (start_status = 0, end_status = 1, ii = 0) {
    var start = new Date().getTime();
    start_status = parseInt(start_status);
    end_status = parseInt(end_status);
    ii = parseInt(ii);
    var list = await this.findAll({ status: start_status, limit_db: 10000 });
    if (!list || !list.length) {
        return false;
    }
    var list_update = [];
    for (var item of list) {
        if (item.alias.trim()) {
            var list_keyword = GlobalFunction.get_list_keyword_by_sentence(item.alias.trim());
            list_update.push({
                updateOne: {
                    filter: { _id: item._id },
                    update: { $set: { list_keyword: list_keyword, status: end_status } }
                }
            })
        } else {
            list_update.push({
                updateOne: {
                    filter: { _id: item._id },
                    update: { $set: { status: end_status } }
                }
            })
        }
    }
    var that = this;
    if (list_update.length) {
        var r = await that.bulkWrite(list_update);
        if (r) { }
    }
    ii++;
    return this.update_list_keyword(start_status, end_status, ii);
}

GlobalActiveRecord.prototype.dropCollection = async function () {
    return this.db.dropCollection(this.tableName());
}

GlobalActiveRecord.prototype.createCollection = async function () {
    return this.db.createCollection(this.tableName());
}

GlobalActiveRecord.prototype.createIndex = async function (index_obj) {
    return this.db.createIndex(this.tableName(), index_obj);
}

GlobalActiveRecord.prototype.process_common_mongo_for_ref = async function (item) {
    var that = this;
    if (Array.isArray(item)) {
        return GlobalFunction.runMultiRequest(item, function (data, index) {
            return that.process_common_mongo_for_ref(data[index]);
        })
    } else {
        if (item.func_name) {
            if (item.sharding) {
                return GlobalFunction.runMultiRequest(item.params,async function (data, index) {
                    var a = await that.call_func_mongodb(item.func_name, data[index]);
                    if(a.errors) {
                        console.error(a.stdout);
                    }
                    return a;
                })
            } else {
                var a = await that.call_func_mongodb(item.func_name, item.params);
                if(a.errors) {
                    console.error(a.stdout);
                }
                return a;
            }
        } else if (item.collection_delete) {
            var query = "db.getCollection('" + item.collection_delete + "').remove(" + (JSON.stringify(item.params)).replace(/"/gi, "'") + ");";
            return that.query(query);
        }
    }
    return Promise.resolve(true);
}

GlobalActiveRecord.prototype.trigger_ref_create_update_delete_common = async function (list, list_function_call = []) {
    if (CONFIG.MONGO[this.db_key] && list.length) {
        var that = this;
        var data_bulk_write = [];
        for (var it of list) {
            var it_update = Object.assign({}, it);
            delete it_update._id;
            data_bulk_write.push({
                updateOne: { filter: { _id: it._id }, update: { $set: it_update }, upsert: true }
            });
        }
        var a = await this.bulkWrite(data_bulk_write);
        if (a) { }
        if (list_function_call.length) {
            return GlobalFunction.runMultiRequest(list_function_call, async function (dt, ix) {
                if (Array.isArray(dt[ix])) {
                    return GlobalFunction.runMultiRequest(dt[ix], async function (data, index) {
                        return that.process_common_mongo_for_ref(data[index]);
                    })
                } else {
                    return that.process_common_mongo_for_ref(dt[ix]);
                }
            }, 1);
        } else {
            return Promise.resolve(true);
        }
    } else {
        return Promise.resolve(true);
    }

}

GlobalActiveRecord.prototype.get_params_trigger_ref = function (list) {
    var ids = [];
    var list_created_by_obj = {};
    var list_shard_params_status_1 = [];
    var list_ids = [];
    var l = [];
    var length = list.length;
    var process = length > 10 ? Math.floor(length / 10) : length;
    for (var i = 0; i < length; i++) {
        ids.push(list[i]._id);
        if(list[i].modified_by) {
            list_created_by_obj[list[i]._id] = {created_by: list[i].modified_by,created_time: list[i].modified_time};
        } else if(list[i].created_by) {
            list_created_by_obj[list[i]._id] = {created_by: list[i].created_by,created_time: list[i].created_time};
        } else {
            list_created_by_obj[list[i]._id] = 1;
        }
        
        l.push(ids[i]);
        if ((i + 1) % process == 0) {
            list_ids.push([l]);
            list_shard_params_status_1.push([-1, l]);
            l = [];
        }
    }
    if (l.length) {
        list_ids.push([l]);
        list_shard_params_status_1.push([-1, l]);
    }
    return {
        ids: ids,
        list_shard_params_status_1: list_shard_params_status_1,
        list_ids: list_ids,
        list_created_by_obj: list_created_by_obj,
    }
}

GlobalActiveRecord.prototype.insertManyCheckExistsByOneID = async function (list_pr, field_id_name,update = false,check_exists = false) {
    if (!list_pr || !list_pr.length) {
        return Promise.resolve(true);
    }
    var list_all = GlobalFunction.generateBatchByLimit(list_pr, 1000);
    var that = this;
    return GlobalFunction.runMultiRequest(list_all, async function (data, index) {
        var list = data[index];
        var list_ids = GlobalFunction.indexArray(list, field_id_name);
        var search = {};
        search[field_id_name] = list_ids;
        var rs = [];
        var rs_obj = {};
        if(!check_exists || update) {
            rs = await that.findAll(search);
            if(rs && rs.length) {
                if(update) {
                    condition_delete = {};
                    condition_delete[field_id_name] = GlobalFunction.indexArray(rs,field_id_name);
                    var r1 = await that.deleteAll(condition_delete);
                    if(r1){}
                } else {
                    rs_obj = GlobalFunction.index(rs, field_id_name);
                }
            }
        }
        
        var list_new = [];
        for (var item of list) {
            delete item._id;
            if(!rs_obj[item[field_id_name]]) {
                list_new.push(item);
            }
        }
        console.log(that.tableName(), 'insertManyCheckExistsByOneID index',index,' insert', list_new.length);
        if (list_new.length) {
            // console.log(list_new);
            return that.insertMany(list_new);
        } else {
            return Promise.resolve(true);
        }
    },!check_exists ? 1 : 20)


}

GlobalActiveRecord.prototype.insertManyCheckExistsByOneIDTemp = async function (list_pr, field_id_name,update = false,check_exists = false) {
    if (!list_pr || !list_pr.length) {
        return Promise.resolve(true);
    }
    var list_all = GlobalFunction.generateBatchByLimit(list_pr, 1000);
    var that = this;
    return GlobalFunction.runMultiRequest(list_all, async function (data, index) {
        var list = data[index];
        var list_ids = GlobalFunction.indexArray(list, field_id_name);
        var search = {};
        search[field_id_name] = list_ids;
        var rs = [];
        if(!check_exists) {
            rs = await that.findAll(search);
            // console.log('rs', field_id_name, search, rs.length);
            var rs_obj = GlobalFunction.index(rs, field_id_name);
        } else {
            var rs_obj = {};
        }
        
        var list_new = [];
        var list_update = [];
        for (var item of list) {
            if (!rs_obj[item[field_id_name]]) {
                list_new.push(item);
            } else {
                var item2 = {}, condition = {};
                condition[field_id_name] = item[field_id_name];
                var fll = false;
                for(var kk in rs_obj[item[field_id_name]]) {
                    var vv = rs_obj[item[field_id_name]][kk];
                    if(vv != item[kk] && !GlobalFunction.contains(kk,['CREATED_TIME','CREATED_BY','MODIFIED_TIME','MODIFIED_BY','ID']) && item[kk] !== undefined) {
                        item2[kk] = item[kk];
                        fll = true;
                    }
                }
                if(fll) {
                    list_update.push({
                        condition: condition,
                        attributes: item2,
                    });
                }
            }
        }
        if(update && list_update.length) {
            var mm = await GlobalFunction.runMultiRequest(list_update, async function(dt,inx){
                var itx = dt[inx];
                console.log('update data', list_update.length,inx);
                console.log(itx.attributes,itx.condition);
                return that.updateAll(itx.attributes,itx.condition);
            },1)
            if(mm){}
        }
        console.log('insertManyCheckExistsByOneID index list_new', index, list_all.length, that.tableName(), list_new.length);
        if (list_new.length) {
            // for(var item of list_new) {
            //     if(!item.ID) {
            //         // console.log('insertManyCheckExistsByOneID11111111',item);
            //     }
            // }
            // console.log(list_new);
            return that.insertMany(list_new);
        } else {
            return Promise.resolve(true);
        }
    },!check_exists ? 1 : 20)
}

GlobalActiveRecord.prototype.insertManyCheckExistsByListKeys = async function (list, list_keys) {
    var list_ids = GlobalFunction.indexArray(list, field_id_name);
    var search = {};
    search[field_id_name] = list_ids;
    var rs = await this.findAll(search);
    var rs_obj = GlobalFunction.index(rs, field_id_name);
    var list_new = [];
    for (var item of list) {
        if (!rs_obj[item[field_id_name]]) {
            list_new.push(item);
        }
    }
    if (list_new.length) {
        return this.insertMany(list_new);
    } else {
        return Promise.resolve(true);
    }
}



/*
rs_params
    mongo_collection_keyword_mapping
    ids
    db2_table_name
    model_db2
*/
GlobalActiveRecord.prototype.async_data_to_db2_delete_common = async function (rs_params) {
    var list = await this.db.aggregate(rs_params.mongo_collection_keyword_mapping, [
        { $match: { status: -1, is_delete: 1, id: { $in: rs_params.ids } } },
        { $group: { _id: "$id", list_keyword: { $push: "$keyword" } } }
    ]);
    if (list && list.length) {
        var list_where = [];
        for (var it of list) {
            var list_keyword = [];
            for (var it_child of it.list_keyword) {
                list_keyword.push(it_child.replace(/'/gi, "''"));
            }
            if (list_keyword.length) {
                list_where.push("(REF_ID = " + it._id + " AND KEYWORD IN ('" + list_keyword.join("','") + "'))");
            }
        }
        if (list_where) {
            var query = `delete from F9_STG_INSIGHT.` + rs_params.db2_table_name + ` where ` + list_where.join(" OR ");
            return rs_params.model_db2.queryUpdate(query);
        } else {
            return Promise.resolve(true);
        }
    } else {
        return Promise.resolve(true);
    }
}


/*
    rs_params
        ids
        mongo_facebook_insight_collection_name
        db2_facebook_insight_table_name
        server_key
        key_exists default UNI_KEY
        type 
        has_ref_city default false
*/
GlobalActiveRecord.prototype.async_data_to_db2_update_create_common = async function (rs_params,update = false,check_exists = false) {
    var project = {
        _id: 0,
        REF_ID: "$ref_id", REF_NAME: "$ref_name",
        KEYWORD: "$keyword",
        SOURCE_ID: "$source_id", SOURCE_NAME: "$source_name",
    };
    if (rs_params.type) {
        project['TYPE'] = rs_params.type;
    }
    project[rs_params.key_exists || 'UNI_KEY'] = "$_id";
    if (rs_params.has_ref_city) {
        project['REF_CITY_ID'] = "$ref_city_id";
        project['REF_CITY_NAME'] = "$ref_city_name";
    }
    if(rs_params.attributes_mapping) {
        for(var k in rs_params.attributes_mapping) {
            project[k] = rs_params.attributes_mapping[k];
        }
    }
    var that = this;
    return GlobalFunction.runMultiRequest(rs_params.ids, async function(data,index){
        var ref_id = data[index];
        var list = await that.db.aggregate(rs_params.mongo_facebook_insight_collection_name, [
            { $match: { status: -1, is_delete: 0, ref_id: ref_id } },
            { $project: project }
        ]);
        if (list && list.length) {
            var model_db2 = new GlobalActiveRecord();
            model_db2._table_name = rs_params.db2_facebook_insight_table_name;
            model_db2.setDb(CONFIG.SERVER[rs_params.server_key]);
            var created_time = parseInt(GlobalFunction.newDate()/1000);
            for(var item of list) {
                item.CREATED_TIME = rs_params.list_created_by_obj && rs_params.list_created_by_obj[item.ID] && rs_params.list_created_by_obj[item.ID].created_by ? rs_params.list_created_by_obj[item.ID].created_time : created_time;
                item.CREATED_BY = rs_params.list_created_by_obj && rs_params.list_created_by_obj[item.ID] && rs_params.list_created_by_obj[item.ID].created_by ? rs_params.list_created_by_obj[item.ID].created_by : 1;
            }
            return model_db2.insertManyCheckExistsByOneID(list, rs_params.key_exists || 'UNI_KEY', update, check_exists);
        } else {
            return Promise.resolve(true);
        }
    },!check_exists ? 1 : 10)
    
}

/* 
    rs_params
        ids
        list
        model_db2
        schemas
        key_exists
        attributes_mapping
*/
GlobalActiveRecord.prototype.async_data_ref_common = async function (rs_params) {
    var model_db2 = rs_params.model_db2;
    var key_exists = rs_params.key_exists || 'ID';
    var list_insert = [];
    var list_insert_obj = [];
    var list_ids_delete = [];
    Object.assign(rs_params.attributes_mapping, {
        IS_DELETE: 'is_delete',
        CREATED_BY: 'created_by',
        CREATED_TIME: 'created_time',
        MODIFIED_BY: 'modified_by',
        MODIFIED_TIME: 'modified_by',
    })
    for (var item of rs_params.list) {
        if (item.name) {
            var name = item.name.toLowerCase();
            var alias = GlobalFunction.stripUnicode(name, ' ');
            item.text_search = name + (name != alias ? "," + alias : '');
        }
        var item_new = {};
        for (var k in rs_params.attributes_mapping) {
            var v = rs_params.attributes_mapping[k];
            if(k == 'PID' && item[v]) {
                item_new[k] = parseInt(item[v]);
            } else {
                item_new[k] = item[v] !== undefined ? (item[v] === '' ? null : item[v]) : null;
            }
            
        }
        if (item_new.IS_DELETE == 1) {
            list_ids_delete.push(item_new[key_exists]);
        } else {
            if (!list_insert_obj[item_new[key_exists]]) {
                list_insert_obj[item_new[key_exists]] = item_new;
                list_insert.push(item_new);
            } else {
                Object.assign(list_insert_obj[item_new[key_exists]], item_new);
            }

        }
    }
    if (list_ids_delete.length) {
        var a1 = await model_db2.queryUpdate("delete from " + rs_params.schemas + "." + model_db2.tableName() + " where id IN (" + list_ids_delete.join(",") + ")");
        if (a1) { }
    }
    return model_db2.insertManyCheckExistsByOneID(list_insert, key_exists,true);
}
/*
    rs_params
        ids
        schemas
        model_db2_keyword_mapping
        key_exists
*/
GlobalActiveRecord.prototype.async_data_ref_keyword_mapping_common = async function (rs_params) {
    var model_db2_keyword_mapping = rs_params.model_db2_keyword_mapping;
    var a1 = await model_db2_keyword_mapping.queryUpdate("delete from " + rs_params.schemas + "." + model_db2_keyword_mapping.tableName() + " where id IN (" + rs_params.ids.join(",") + ")");
    if (a1) { }
    var list_insert = await this.db.aggregate(model_db2_keyword_mapping.tableName(), [
        { $match: { id: { $in: rs_params.ids } } },
        { $project: { _id: 0, ID: "$id", KEYWORD: "$keyword", UNI_KEY: "$_id" } }
    ]);
    var created_time = parseInt(GlobalFunction.newDate()/1000);
    for(var item of list_insert) {
        item.CREATED_TIME = rs_params.list_created_by_obj && rs_params.list_created_by_obj[item.ID] && rs_params.list_created_by_obj[item.ID].created_by ? rs_params.list_created_by_obj[item.ID].created_time : created_time;
        item.CREATED_BY = rs_params.list_created_by_obj && rs_params.list_created_by_obj[item.ID] && rs_params.list_created_by_obj[item.ID].created_by ? rs_params.list_created_by_obj[item.ID].created_by : 1;
    }
    return model_db2_keyword_mapping.insertManyCheckExistsByOneID(list_insert, rs_params.key_exists || "UNI_KEY");
}
/*
    rs_params
        ids
        schemas
        model_db2_keyword_mapping
        field_name
*/
GlobalActiveRecord.prototype.async_data_facebook_insight_common_not_keyword = async function (rs_params, list_pr) {
    if (!list_pr || !list_pr.length) {
        return Promise.resolve(true);
    }
    var list_created_by_obj = rs_params.list_created_by_obj;
    var list_all = GlobalFunction.generateBatchByLimit(list_pr, 100);
    var that = this;
    var model_db2_keyword_mapping = rs_params.model_db2_keyword_mapping;
    return GlobalFunction.runMultiRequest(list_all, async function (data, index) {
        var list = data[index];
        var ids = GlobalFunction.indexArray(list, '_id');
        var query = "delete from " + rs_params.schemas + "." + model_db2_keyword_mapping.tableName() + " where REF_ID IN ('" + ids.join("','") + "')";
        var a1 = await model_db2_keyword_mapping.queryUpdate(query);
        if (a1) { }
        var list_insert = [];
        var list_insert_obj = {};
        for (var item of list) {
            if (item[rs_params.field_name]) {
                for (var it_child of item[rs_params.field_name]) {
                    key = it_child + "_" + item._id;
                    if (!list_insert_obj[key]) {
                        list_insert_obj[key] = 1;
                        list_insert.push({
                            REF_ID: item._id,
                            REF_NAME: item.name ? item.name : null,
                            SOURCE_ID: it_child,
                            UNI_KEY: key,
                            CREATED_TIME: list_created_by_obj[item._id] && list_created_by_obj[item._id].created_time ? list_created_by_obj[item._id].created_time : parseInt(GlobalFunction.newDate()/1000),
                            CREATED_BY: list_created_by_obj[item._id] && list_created_by_obj[item._id].created_by ? list_created_by_obj[item._id].created_by : 1,
                        })
                    }
                }
            }
        }
        console.log('async_data_facebook_insight_common_not_keyword', index, model_db2_keyword_mapping.tableName(), list_insert.length);
        if (list_insert.length) {
            return model_db2_keyword_mapping.insertManyByLimit(list_insert, 2000);
        } else {
            return Promise.resolve(true);
        }
    }, 1)
}

GlobalActiveRecord.prototype.insertManyByLimit = async function (list, limit) {
    var that = this;
    return GlobalFunction.runMultiRequest(GlobalFunction.generateBatchByLimit(list, limit), async function (data, index) {
        return that.insertMany(data[index]);
    }, 1)
}

GlobalActiveRecord.prototype.import = async function (attributes) {
    var data = [];
    for(var item of attributes) {
        this.model.setAttributes(item);
        data.push(this.model.getAttributesInsert());
    }
    return this.model.insertMany(data)
}