exports = module.exports = GlobalMongo;
var MongoClient = require('mongodb').MongoClient;
var CONFIG = require('../config/config');
var Promise = require('promise');
const Q = require('q');
const exec = require('child_process').exec;
var GlobalFunction = require('./global_function');
var GlobalFile = require('./global_file');
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function GlobalMongo(settings) {
    var that = this;

    this.settings = settings;
    var user_pass = settings.username && settings.password ? (encodeURIComponent(settings.username) + ':' + encodeURIComponent(settings.password) + '@') : '';
    this.url = settings.url ? settings.url : ('mongodb://' + user_pass + settings.server + ':' + settings.port + '/' + settings.database);
    if (user_pass) {
        this.url += '?authSource=admin';
    }
    this.condition = null;
    this.collection = null;
    this._limit = null;
    this._offset = null;
    this._select = null;
    this._sort = null;
    this.db = null;
    this.db2 = null;
    this.connect_defer = null;
	this.list_cache_db = [];
	this.limit_cache = 1;

    this.connectionDB = async function() {
        var defer = Q.defer();
        MongoClient.connect(this.url, { socketTimeoutMS: 36000000, connectTimeoutMS: 30000000 }, function (err, db) {
            if (err) {
                that.reset_error(err, db, 'connect_mongo');
                defer.resolve(false);
            } else {
                db.time_start = new Date().getTime();
                db.connect_count = 0;
                db.flag_connection = true;
                that.auto_close_db(db);
                defer.resolve(db);
            }
        });
        return defer.promise;
    }

    this.auto_close_db =  function(db) {
        var that = this;
        setTimeout(function(){
            if(db) {
                if(!db.flag_connection) {
                    db.close();
                    db.flag_restart = true;
                } else {
                    that.auto_close_db(db);
                }
            }
        },2 * 60 * 1000);
    }

    this.get_db_trust = async function(db) {
        if(!db) {
            db = await this.connectionDB();
        } else if((new Date().getTime() - db.time_start > (60 * 1000)) || (db.connect_count > 100)) {
            db.close();
            db = await this.connectionDB();
        }
        return Promise.resolve(db);
    }

    this.connection_done = async function() {
        var db = false;
        for (var i = 0; i < this.list_cache_db.length;i++) {
            if(!this.list_cache_db[i]) {
                this.list_cache_db[i] = await this.connectionDB();
            } else {
                if (!this.list_cache_db[i].flag_connection) {
                    if(this.list_cache_db[i].flag_restart) {
                        this.list_cache_db[i] = await this.connectionDB();
                    } else {
                        this.list_cache_db[i] = await this.get_db_trust(this.list_cache_db[i]);
                    }
                }
            }
            db = this.list_cache_db[i];
		}
		if (!db && this.list_cache_db.length < this.limit_cache) {
            db = await this.connectionDB();
            this.list_cache_db.push(db);
        }
        if(!db) {
            if(this.db2) {
                db = this.db2 = await this.get_db_trust(this.db2);
            } else {
                db = this.db2 = await this.connectionDB();
            }
        }
        if(db) {
            db.flag_connection = true;
            db.connect_count++;
        }
		return Promise.resolve(db);
    }

    this.reset_error = async function (err, db, type) {
        console.error('mongo error', type, err.message);
        if (err && typeof (err) == 'object' && err.message.match(/(failed to connect to server)|(topology was destroyed)|(failed to reconnect after)/gi)) {
            if (db) {
                db.close();
                db.flag_restart = true;
            }
        }
    }

    this.reverseError = function (err, rows, db, type) {
        db.flag_connection = false;
        if (err) {
            this.reset_error(err, db, type);
        }
    }
    this.resetAttributes = function () {
        this.condition = null;
        this.collection = null;
        this._limit = null;
        this._select = null;
        this._sort = null;
        this._offset = null;
    }
    this.setCollection = async function (table_name) {
        if (!this.collection) {
            this.collection = this.collection(table_name);
        }
    }
    this.where = function (condition) {
        this.condition = condition;
        return this;
    }
    this.limit = function (number, offset) {
        this._limit = number;
        if (offset && offset !== undefined) {
            this._offset = offset;
        }
        return this;
    }
    this.select = function (select) {
        this._select = select;
        return this;
    }
    this.sort = function (sort) {
        this._sort = sort;
        return this;
    }
    this.order_by = function (sort) {
        this._sort = sort;
        return this;
    }

    this.get_db_mongo_not_process = async function () {

    }
    this.createIndex = function (table_name, index_obj) {
        var that = this;
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                db.collection(table_name).createIndex(index_obj, { background: true }, function (err, rows) {
                    that.reverseError(err, rows, db, 'createIndex');
                    def.resolve(err ? false : rows);
                });
            } else {
                def.resolve(false);
            }
            return def.promise;
        })
    }
    this.dropCollection = async function (table_name) {
        var that = this;
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                db.dropCollection(table_name, function (err, rows) {
                    that.reverseError(err, rows, db, 'dropCollection');
                    def.resolve(err ? false : rows);
                });
            } else {
                def.resolve(false);
            }
            return def.promise;
        })
    }

    this.delete = async function (table_name, func_callback) {
        var that = this;
        var condition = that.condition;
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                db.collection(table_name).deleteMany(condition, function (err, rows) {
                    that.reverseError(err, rows, db, 'delete');
                    if (err) { rows = false; }
                    if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                    def.resolve(rows);
                });
            } else {
                if (typeof (func_callback) == 'function') { func_callback('bug not connection', false); }
                def.resolve(false);
            }
            that.resetAttributes();
            return def.promise;
        })
    }

    this.deleteAll = async function (table_name, condition, func_callback) {
        var that = this;
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                db.collection(table_name).deleteMany(condition, function (err, rows) {
                    that.reverseError(err, rows, db, 'deleteAll');
                    if (err) { rows = false; }
                    if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                    def.resolve(rows);
                });
            } else {
                if (typeof (func_callback) == 'function') { func_callback('bug not connection', false); }
                def.resolve(false);
            }
            that.resetAttributes();
            return def.promise;
        })
    }

    this.call_func = async function (func_name, argv_str = '', func_callback) {
        var that = this;
        if (!argv_str || argv_str === undefined) {
            argv_str = '';
        }
        if (typeof (argv_str) == 'string') {
            argv_str = argv_str.split('||');
        }
        var str = "";
        if (Array.isArray(argv_str)) {
            if (argv_str.length) {
                var a_str = [];
                for (var item of argv_str) {
                    if (typeof (item) == 'object') {
                        a_str.push(JSON.stringify(item));
                    } else if (typeof (item) == 'number') {
                        a_str.push(item);
                    } else if (typeof (item) == 'string') {
                        a_str.push("'" + item + "'");
                    } else {
                        a_str.push(item);
                    }
                }
                str = a_str.join(",");
            }
        } else {
            if (typeof (argv_str) == 'object') {
                argv_str = JSON.stringify(argv_str);
            } else if (typeof (argv_str) == 'string') {
                a_str = "'" + argv_str + "'";
            }
            str = argv_str;
        }
        // lưu ý khi mongodb báo db.eval is deprecated hoawcj name has to be a string
        // thì dùng lệnh db.getCollection('system.js').remove({_id:{$type:7}})
        var eval = func_name + '(' + str + ');';
        var command = 'mongo ' + this.url + ' --eval ' + '"db.loadServerScripts();' + eval + '"';
        // var command = 'mongo ' + settings.server + '/' + settings.database + ' --eval ' + '"db.loadServerScripts();' + eval + '"';
        console.log(command);
        var def = Q.defer();
        exec(command, function (errors, stdout, stderr) {
            if (errors) {
                console.error(errors);
                def.resolve(false);
            } else {
                def.resolve({
                    errors: errors, stdout: stdout, stderr: stderr
                });
            }
        })
        return def.promise;
    }

    this.query = async function (query, params = [], func_callback) {
        return this.cal_function_by_query_command(query,func_callback);
    }

    this.insert = async function (table_name, attributes, func_callback) {
        var that = this;
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                db.collection(table_name).insertOne(attributes, function (err, rows) {
                    that.reverseError(err, rows, db, 'insert');
                    if (err) { rows = false; }
                    if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                    def.resolve(rows);
                });
            } else {
                if (typeof (func_callback) == 'function') { func_callback('bug not connection', false); }
                def.resolve(false);
            }
            that.resetAttributes();
            return def.promise;
        })
    }
    this.insertMany = async function (table_name, attributes, func_callback) {
        var that = this;
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                if (attributes && attributes.length) {
                    db.collection(table_name).insertMany(attributes, function (err, rows) {
                        that.reverseError(err, rows, db, 'insertMany');
                        if (err) { rows = false; }
                        else { rows = attributes.length; }
                        if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                        def.resolve(rows);
                    });
                } else {
                    if (typeof (func_callback) == 'function') { func_callback('', 0); }
                    def.resolve(0);
                }
            } else {
                if (typeof (func_callback) == 'function') { func_callback('bug not connection', false); }
                def.resolve(false);
            }
            that.resetAttributes();
            return def.promise;
        })
    }
    this.insertManyIgnore = async function (table_name, result_key = '_id', attributes, func_callback) {
        var that = this;
        return that.connection_done().then(async function (db) {
            var def = Q.defer();
            if (db) {
                if (attributes && attributes.length) {
                    var attributes_obj = {};
                    for (var item of attributes) {
                        attributes_obj[item[result_key]] = item;
                    }
                    var list_ids = Object.keys(attributes_obj);
                    var search = {}, project = {};
                    project[result_key] = 1;
                    search[result_key] = { $in: list_ids };
                    var list_old = await that.aggregate(table_name, [
                        { $match: search },
                        { $project: project }
                    ]);
                    if (list_old && list_old.length) {
                        for (var item of list_old) {
                            delete attributes_obj[item[result_key]];
                        }
                        attributes = GlobalFunction.values(attributes_obj);
                    }
                    if (attributes.length) {
                        db.collection(table_name).insertMany(attributes, { ordered: false }, function (err, rows) {
                            if (!(err && err.message.match(/duplicate key error collection/gi))) {
                                that.reverseError(err, rows, db, 'insertManyIgnore');
                            }
                            if (err) { rows = false; }
                            else { rows = attributes.length; }
                            if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                            def.resolve(rows);
                        });
                    } else {
                        if (typeof (func_callback) == 'function') { func_callback('', 0); }
                        def.resolve(0);
                    }
                } else {
                    if (typeof (func_callback) == 'function') { func_callback('', 0); }
                    def.resolve(0);
                }
            } else {
                if (typeof (func_callback) == 'function') { func_callback(err, false); }
                def.resolve(false);
            }
            that.resetAttributes();
            return def.promise;
        })
    }
    this.insertManyIgnoreNotCheck = async function (table_name, attributes, func_callback) {
        var that = this;
        return that.connection_done().then(async function (db) {
            var def = Q.defer();
            if (db) {
                if (attributes.length) {
                    db.collection(table_name).insertMany(attributes, { ordered: false }, function (err, rows) {
                        if (!(err && err.message.match(/duplicate key error collection|write operation failed/gi))) {
                            db.flag_connection = false;
                            that.reverseError(err, rows, db, 'insertManyIgnore');
                            if (err) { rows = false; }
                        }
                        
                        else { rows = attributes.length; }
                        if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                        def.resolve(rows);
                    });
                } else {
                    if (typeof (func_callback) == 'function') { func_callback('', 0); }
                    def.resolve(0);
                }
            } else {
                if (typeof (func_callback) == 'function') { func_callback(err, false); }
                def.resolve(false);
            }
            that.resetAttributes();
            return def.promise;
        })
    }

    this.insertManyByLimit = async function (table_name, list, limit) {
        var that = this;
        var flag = true;
        return GlobalFunction.runMultiRequest(GlobalFunction.generateBatchByLimit(list, limit), async function (data, index) {
            var rs = await that.insertMany(table_name, data[index]);
            if (rs === false) {
                flag = false;
            }
            return rs;
        }, 20).then(r => {
            if (flag) {
                return Promise.resolve(list.length);
            } else {
                return Promise.resolve(false);
            }
        })
    }

    this.insertUpdateManyByResultKey = async function (table_name, result_key = '_id', attributes, func_callback) {
        var that = this;
        return that.connection_done().then(async function (db) {
            var def = Q.defer();
            if (db) {
                if (attributes && attributes.length) {
                    var list_bulk_write = [];
                    for (var item of attributes) {
                        var filter = {};
                        filter[result_key] = item[result_key];
                        list_bulk_write.push({
                            updateOne: {
                                filter: filter,
                                update: { $set: item },
                                upsert: true,
                            }
                        });
                    }
                    db.collection(table_name).bulkWrite(list_bulk_write, function (err, rows) {
                        that.reverseError(err, rows, db, 'insertUpdateManyByResultKey');
                        if (err) { rows = false; }
                        else { rows = list_bulk_write.length }
                        if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                        def.resolve(rows);

                    })
                } else {
                    if (typeof (func_callback) == 'function') { func_callback('', 0); }
                    def.resolve(0);
                }
            } else {
                if (typeof (func_callback) == 'function') { func_callback(err, false); }
                def.resolve(false);
            }
            that.resetAttributes();
            return def.promise;
        })
    }

    this.updateManyByResultKey = async function (table_name, result_key = '_id', attributes, func_callback) {
        var that = this;
        return that.connection_done().then(async function (db) {
            var def = Q.defer();
            if (db) {
                if (attributes && attributes.length) {
                    var attributes_obj = {};
                    var list_ids = [];
                    for (var item of attributes) {
                        attributes_obj[item[result_key]] = item;
                        list_ids.push(item[result_key]);
                    }
                    var search = {}, project = {};
                    project[result_key] = 1;
                    search[result_key] = { $in: list_ids };
                    var list_old = await that.aggregate(table_name, [
                        { $match: search },
                        { $project: project }
                    ]);
                    if (list_old && list_old.length) {
                        var list_bulk_write = [];
                        for (var item of list_old) {
                            var filter = {};
                            filter[result_key] = item[result_key];
                            list_bulk_write.push({
                                updateOne: {
                                    filter: filter,
                                    update: { $set: attributes_obj[item[result_key]] },
                                }
                            });
                        }
                        db.collection(table_name).bulkWrite(list_bulk_write, function (err, rows) {
                            that.reverseError(err, rows, db, 'bulkWrite');
                            if (err) { rows = false; }
                            else { rows = list_bulk_write.length }
                            if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                            def.resolve(rows);

                        })
                    } else {
                        if (typeof (func_callback) == 'function') { func_callback('', 0); }
                        def.resolve(0);
                    }
                } else {
                    if (typeof (func_callback) == 'function') { func_callback('', 0); }
                    def.resolve(0);
                }
            } else {
                if (typeof (func_callback) == 'function') { func_callback(err, false); }
                def.resolve(false);
            }
            that.resetAttributes();
            return def.promise;
        })
    }



    this.deleteManyByResultKey = async function (table_name, result_key = '_id', attributes, func_callback) {
        var that = this;
        return that.connection_done().then(async function (db) {
            var def = Q.defer();
            if (db) {
                if (attributes && attributes.length) {
                    var list_ids = GlobalFunction.indexArray(attributes, result_key);
                    var search = {};
                    search[search] = { $in: list_ids };
                    db.collection(table_name).deleteMany(search, function (err, rows) {
                        that.reverseError(err, rows, db, 'deleteManyByResultKey');
                        if (err) { rows = false; }
                        if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                        def.resolve(rows);
                    });
                } else {
                    if (typeof (func_callback) == 'function') { func_callback('', 0); }
                    def.resolve(0);
                }
            } else {
                if (typeof (func_callback) == 'function') { func_callback(err, false); }
                def.resolve(false);
            }
            that.resetAttributes();
            return def.promise;
        })
    }

    this.update = async function (table_name, attributes, func_callback) {
        var that = this;
        var condition = that.condition;
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                db.collection(table_name).updateOne(condition, attributes, function (err, rows) {
                    that.reverseError(err, rows, db, 'update');
                    if (err) { rows = false; }
                    if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                    def.resolve(rows);
                });
            } else {
                if (typeof (func_callback) == 'function') { func_callback('bug not connection', false); }
                def.resolve(false);
            }
            that.resetAttributes();
            return def.promise;
        })
    }

    this.updateAll = async function (table_name, attributes, condition, func_callback) {
        var that = this;
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                var update_attributes;
                if (attributes['$push'] || attributes['$unset'] || attributes['$set']) {
                    update_attributes = attributes;
                } else {
                    update_attributes = {
                        '$set': attributes
                    }
                }
                db.collection(table_name).updateMany(condition, update_attributes, function (err, rows) {
                    that.reverseError(err, rows, db, 'updateAll');
                    if (err) { rows = false; }
                    if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                    def.resolve(rows);
                });
            } else {
                if (typeof (func_callback) == 'function') { func_callback('bug not connection', false); }
                def.resolve(false);
            }
            that.resetAttributes();
            return def.promise;
        })
    }
    this.updateMany = async function (table_name, attributes, func_callback) {
        var that = this;
        var condition = that.condition;
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                var update_attributes;
                if (attributes['$push'] || attributes['$unset'] || attributes['$set']) {
                    update_attributes = attributes;
                } else {
                    update_attributes = {
                        '$set': attributes
                    }
                }
                db.collection(table_name).updateMany(condition, update_attributes, function (err, rows) {
                    that.reverseError(err, rows, db, 'updateMany');
                    if (err) { rows = false; }
                    if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                    def.resolve(rows);
                });
            } else {
                if (typeof (func_callback) == 'function') { func_callback('bug not connection', false); }
                def.resolve(false);
            }
            that.resetAttributes();
            return def.promise;
        })
    }
    this.updateCommon = async function (table_name, attributes, func_callback) {
        var that = this;
        var condition = that.condition;
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                db.collection(table_name).updateMany(condition, attributes, function (err, rows) {
                    that.reverseError(err, rows, db, 'updateCommon');
                    if (err) { rows = false; }
                    if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                    def.resolve(rows);
                });
            } else {
                if (typeof (func_callback) == 'function') { func_callback('bug not connection', false); }
                def.resolve(false);
            }
            that.resetAttributes();
            return def.promise;
        })
    }

    this.bulkWrite = async function (table_name, list_bulk_write, func_callback) {
        that.resetAttributes();
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                db.collection(table_name).bulkWrite(list_bulk_write, function (err, rows) {
                    that.reverseError(err, rows, db, 'bulkWrite');
                    if (err) { rows = false; }
                    if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                    def.resolve(rows);

                })
            } else {
                if (typeof (func_callback) == 'function') { func_callback('bug not connection', false); }
                def.resolve(false);
            }
            return def.promise;
        });

    }

    this.count = async function (table_name, condition_params, func_callback) {
        var that = this;
        var condition = that.condition ? that.condition : {};
        if(typeof(condition_params) == 'function') {
            func_callback = condition_params;
        } else if(typeof(condition_params) == 'object') {
            condition = condition_params;
        }
        
        that.resetAttributes();
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {

                db.collection(table_name).count(condition, function (err, rows) {
                    that.reverseError(err, rows, db, 'count');
                    if (err) { rows = false; }
                    if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                    def.resolve(rows);
                });
            } else {
                if (typeof (func_callback) == 'function') { func_callback('bug not connection', false); }
                def.resolve(false);
            }
            return def.promise;
        })
    }

    this.get = async function (table_name, func_callback) {
        var that = this;
        var condition = that.condition ? Object.assign({}, that.condition) : {};
        var limit = that._limit || false;
        var offset = that._offset || false;
        var sort = that._sort || false;
        var select = that._select || false;
        that.resetAttributes();
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                var db2 = db.collection(table_name).find(condition);
                // if(select) {
                //     db2.select(select);
                // }
                if (limit) {
                    db2.limit(limit);
                }
                if (sort) {
                    db2.sort(sort);
                }
                if (offset) {
                    db2.skip(offset);
                }
                db2.toArray(function (err, rows) {
                    that.reverseError(err, rows, db, 'get');
                    if (err) { rows = false; }
                    if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                    def.resolve(rows);
                });
            } else {
                if (typeof (func_callback) == 'function') { func_callback('bug not connection', false); }
                def.resolve(false);
            }
            return def.promise;
        })
    }

    this.find = async function (table_name, condition = {}, func_callback) {
        var that = this;
        var limit = 0, skip = 0;
        if (condition.limit_db) {
            limit = condition.limit_db;
            delete condition.limit_db;
        }
        if (condition.offset_db) {
            skip = condition.offset_db;
            delete condition.offset_db;
        }
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                db2 = db.collection(table_name).find(condition);
                if (limit) { db2 = db2.limit(limit); }
                if (skip) { db2 = db2.skip(skip); }
                db2.toArray(function (err, rows) {
                    that.reverseError(err, rows, db, 'find');
                    if (err) { rows = false; }
                    if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                    def.resolve(rows);
                });
            } else {
                if (typeof (func_callback) == 'function') { func_callback('bug not connection', false); }
                def.resolve(false);
            }
            return def.promise;
        })

    }

    this.aggregate = async function (table_name, condition, func_callback) {
        var that = this;
        that.resetAttributes();
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                db.collection(table_name).aggregate(condition, { allowDiskUse: true, slaveOk: false }, function (err, rows) {
                    that.reverseError(err, rows, db, 'aggregate');
                    if (err) { rows = false; }
                    if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                    def.resolve(rows);
                });
            } else {
                if (typeof (func_callback) == 'function') { func_callback('bug not connection', false); }
                def.resolve(false);
            }
            return def.promise;
        })
    }

    this.save = async function (table_name, attributes, func_callback) {
        var that = this;
        return that.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                db.collection(table_name).save(condition, attributes, function (err, rows) {
                    that.reverseError(err, rows, db, 'save');
                    if (err) { rows = false; }
                    if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                    def.resolve(rows);
                });
            } else {
                if (typeof (func_callback) == 'function') { func_callback('bug not connection', false); }
                def.resolve(false);
            }
            return def.promise;
        })
    }

    this.queryCursorByQueryCommand = async function(query_command, func_callback) {
        var db = await this.connection_done();
        var def = Q.defer();
        var result = false;
        try {
            eval(`var result = ` + query_command + `;`);
            if(typeof(func_callback) == 'function') {
                func_callback(false,result);
                def.resolve(result);
            }
        } catch(e) {
            if(typeof(func_callback) == 'function') {
                func_callback(e,false);
                def.resolve(false);
            }
        }
        return def.promise;
    }

    this.cal_function_by_query_command = async function (query_command, func_callback) {
        var that = this;
        return this.connection_done().then(db => {
            var def = Q.defer();
            if (db) {
                var function_name = 'call_function_by_query_command_' + new Date().getTime() + '_' + rand(1000000, 10000000);
                var link_file = CONFIG.APPLiCATION_PATH + '/' + function_name + '.js';
                link_file = link_file.replace(/\/\//gi, '/');
                GlobalFile.writeFile(link_file, `
                function ` + function_name + `() {
                    ` + query_command + `
                }
                var rs = ` + function_name + `();
                db.getCollection('call_function_by_query_command').save({
                    _id:'` + function_name + `',
                    value:  rs
                });
                `);
                exec(`mongo ` + this.url + ` ` + link_file, function (errors, stdout, stderr) {
                    GlobalFile.removeFile(link_file);
                    if (errors) {
                        console.error(errors, stdout, stderr);
                        if(typeof(func_callback) == 'function') {
                            func_callback(errors, stdout, stderr);
                        }
                        def.resolve(false);
                    } else {
                        var db2 = db.collection('call_function_by_query_command').find({ _id: function_name });
                        db2.toArray(function (err, rows) {
                            that.reverseError(err, rows, db, 'call_function_by_query_command find');
                            if (typeof (func_callback) == 'function') { func_callback(err, rows); }
                            if (err) {
                                def.resolve(false);
                            } else {
                                if (rows && rows.length) {
                                    db.collection('call_function_by_query_command').deleteMany({ _id: function_name })
                                    def.resolve(rows[0].value);
                                } else {
                                    def.resolve(false);
                                }
                            }
                        });
                    }
                })
            } else {
                def.resolve(false);
            }
            return def.promise;
        })
    }

}