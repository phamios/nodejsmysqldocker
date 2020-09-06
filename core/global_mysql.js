var DB = require('./mysql/mysql_activerecord');
var Q = require('q');
const GlobalFunction = require('../core/global_function');
GlobalMysql = GlobalFunction.cloneFunc(DB.Adapter);

GlobalMysql.prototype.insert = async function(tableName, dataSet, responseCallback) {
    var def = Q.defer();
    this.insert_core(tableName, dataSet, function (err, rows) {
        if(typeof(responseCallback) == 'function'){responseCallback(err, rows);}
        if (err) {
            console.log('insert', err);
            def.resolve(false);
        } else {
            def.resolve(rows);
        }
    })
    return def.promise;
}

GlobalMysql.prototype.insertMany = async function (tableName, dataSet, responseCallback) {
    var def = Q.defer();
    this.doBatchInsert('INSERT', tableName, dataSet, function (err, rows) {
        if(typeof(responseCallback) == 'function'){responseCallback(err, rows);}
        if (err) {
            console.log('insert many', err);
            def.resolve(false);
        } else {
            def.resolve(rows);
        }
    })
    return def.promise;
}

GlobalMysql.prototype.update = async function(tableName, newData, responseCallback) {
    var def = Q.defer();
    this.update_core(tableName, newData, function (err, rows) {
        if(typeof(responseCallback) == 'function'){responseCallback(err, rows);}
        if (err) {
            console.log('update', err);
            def.resolve(false);
        } else {
            def.resolve(rows);
        }
    })
    return def.promise;
}

GlobalMysql.prototype.updateMany = async function (tableName, dataSet, responseCallback) {
    var def = Q.defer();
    this.update_core(tableName, dataSet, function (err, rows) {
        if (err) {
            console.log('updateMany', err);
            def.resolve(false);
        } else {
            def.resolve(rows);
        }
    })
    return def.promise;
}

GlobalMysql.prototype.delete = async function(tableName, responseCallback) {
    var def = Q.defer();
    this.delete_core(tableName, function (err, rows) {
        if(typeof(responseCallback) == 'function'){responseCallback(err, rows);}
        if (err) {
            console.log('delete', err);
            def.resolve(false);
        } else {
            def.resolve(rows);
        }
    })
    return def.promise;
}

GlobalMysql.prototype.resetQuery = function() {
    this.whereClause = {};
    this.selectClause = [];
    this.orderByClause = '';
    this.groupByClause = '';
    this.havingClause = '',
    this.limitClause = -1;
    this.offsetClause = -1;
    this.joinClause = [];
    this.lastQuery = (typeof newLastQuery === 'string' ? newLastQuery : '');
    this.rawWhereClause = {};
    this.rawWhereString = {};
}

GlobalMysql.prototype.get = async function(tableName, responseCallback) {
    var def = Q.defer();
    this.get_core(tableName, function (err, rows) {
        if(typeof(responseCallback) == 'function'){responseCallback(err, rows);}
        if (err) {
            console.log('get', err);
            def.resolve(false);
        } else {
            def.resolve(rows);
        }
    })
    return def.promise;
}

GlobalMysql.prototype.query = async function(query, responseCallback) {
    var def = Q.defer();
    this.query_core(query, function (err, rows) {
        if(typeof(responseCallback) == 'function'){responseCallback(err, rows);}
        if (err) {
            console.log('query', err);
            def.resolve(false);
        } else {
            def.resolve(rows);
        }
    })
    return def.promise;
}

GlobalMysql.prototype.callProducer = async function (producer) {
    let queryStr = 'CALL ' + producer['name'];
    let params = producer['params'];
    if (params) {
        if(Array.isArray(params)){
            queryStr += '("' + params.join('","') + '")';
        } else {
            queryStr += '("' + params + '")';
        }
    }
    var def = Q.defer();
    this.query(queryStr).then(row => {
        def.resolve({row: row});
    });
    return def.promise;
}

GlobalMysql.prototype.connectionDB = function () {
    var def = Q.defer();
    def.resolve();
    return def.promise;
}

exports = module.exports = GlobalMysql;