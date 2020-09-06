exports = module.exports = GlobalDb3;
var config = require('../config/config');
var ibmdb = require('ibm_db');
var util = require('util');
var extend = require('extend');
var SqlString = require('./db2/SqlString');
const Q = require('q');
function GlobalDb3(settings) {
    this.init();
    this.settings = settings;
    this.dsn = 'Driver={IBM DB2 ODBC DRIVER};DATABASE=BLUDB;HOSTNAME=' + this.settings.server + ';UID=' + this.settings.username + ';PWD=' + this.settings.password + ';PORT=' + this.settings.port + ';PROTOCOL=TCPIP;CurrentSchema=' + this.settings.database + ';';
}

GlobalDb3.prototype.init = function() {
    this.dsn = null;
    this.list_cache_db = [];
    this.limit_cache = 20;
    this.limitClause = -1;
    this.offsetClause = -1;
    this.selectClause = [];
    this._sort = null;
    this.whereClause = {};
    this.joinClause = [];
    this.groupByClause = '',
    this.havingClause = '',
    this.orderByClause = '';
    this.db = null;
}

GlobalDb3.prototype.get_db = function () {
    var i = 1;
    for (var item of this.list_cache_db) {
        if (!item.load_query) {
            return item;
        }
        i++;
    }
    if (this.list_cache_db.length < this.limit_cache) {
        var item = new ibmdb.Database();
        item.openSync(this.dsn);
        this.list_cache_db.push(item);
        // console.log(this.list_cache_db.length);
        return item;
    }
    return this.list_cache_db[Math.floor(Math.random() * this.limit_cache)];
}

GlobalDb3.prototype.where = function (whereSet, whereValue) {
    if (typeof whereSet === 'object' && typeof whereValue === 'undefined') {
        this.whereClause = mergeObjects(this.whereClause, whereSet);
    }
    else if ((typeof whereSet === 'string' || typeof whereSet === 'number') && typeof whereValue != 'undefined') {
        this.whereClause[whereSet] = whereValue;
    }
    else if ((typeof whereSet === 'string' || typeof whereSet === 'number') && typeof whereValue === 'object' && Object.prototype.toString.call(whereValue) === '[object Array]' && whereValue.length > 0) {
        this.whereClause[whereSet] = whereValue;
    }
    else if (typeof whereSet === 'string' && typeof whereValue === 'undefined') {
        this.whereClause[whereSet] = whereValue;
    }
    return this;
};
GlobalDb3.prototype.limit = function (newLimit, newOffset) {
    if (typeof newLimit === 'number') {
        this.limitClause = newLimit;
    }
    if (typeof newOffset === 'number') {
        this.offsetClause = newOffset;
    }
    return this;
}
GlobalDb3.prototype.select = function (selectSet) {
    if (Object.prototype.toString.call(selectSet) === '[object Array]') {
        for (var i = 0; i < selectSet.length; i++) {
            this.selectClause.push(selectSet[i]);
        }
    }
    else {
        if (typeof selectSet === 'string') {
            var selectSetItems = selectSet.split(',');
            for (var i = 0; i < selectSetItems.length; i++) {
                this.selectClause.push(selectSetItems[i].trim());
            }
        }
    }
    return this;
}
GlobalDb3.prototype.comma_separated_arguments = function (set) {
    var clause = '';
    if (Object.prototype.toString.call(set) === '[object Array]') {
        clause = set.join(', ');
    }
    else if (typeof set === 'string') {
        clause = set;
    }
    return clause;
};

GlobalDb3.prototype.join = function (tableName, relation, direction) {
    this.joinClause.push({
        table: tableName,
        relation: relation,
        direction: (typeof direction === 'string' ? direction.toUpperCase().trim() : '')
    });
    return this;
};


GlobalDb3.prototype.group_by = function (set) {
    this.groupByClause = this.comma_separated_arguments(set);
    return that;
};

GlobalDb3.prototype.having = function (set) {
    this.havingClause = this.comma_separated_arguments(set);
    return this;
};
GlobalDb3.prototype.sort = function (set) {
    this.orderByClause = this.comma_separated_arguments(set);
    return this;
};
GlobalDb3.prototype.order_by = function (sort) {
    this.orderByClause = this.comma_separated_arguments(set);
    return this;
}
GlobalDb3.prototype.insert = async function (tableName, dataSet, responseCallback) {
    return this.insertMany(tableName, [dataSet], responseCallback);
}

GlobalDb3.prototype.insertMany = async function (tableName, dataSet, responseCallback) {


    var def = Q.defer();
    if (!dataSet || !dataSet.length) {
        def.resolve(false);
    } else {
        var placemarks = [];
        var newValues = [];
        var i = 0;
        var list_attr = [];
        for (var item of dataSet) {
            var row1 = [];
            var row2 = [];
            for (var k in item) {
                row1.push('?');
                row2.push(item[k]);
                if (i == 0) {
                    list_attr.push(k);
                }
            }
            placemarks.push('(' + row1.join(',') + ')');
            newValues = newValues.concat(row2);
            i = 1;
        }
        var sql = "INSERT INTO " + tableName + '(' + list_attr.join(',') + ') values ' + placemarks.join(',');
        var db = this.get_db();
        db['load_query'] = true;
        db.query(sql, newValues, function (err, result) {
            if (err) {
                console.log(err);
            }
            db['load_query'] = false;
            if (typeof (responseCallback) == 'function') {
                responseCallback(err, result);
            }
            def.resolve(result);
        })
    }
    return def.promise;
}


function escapeFieldName(key) {
    return key;
}

GlobalDb3.prototype.buildDataString = function (dataSet, separator, clause) {
    if (!clause) {
        clause = 'WHERE';
    }
    var queryString = '', y = 1;
    if (!separator) {
        separator = ', ';
    }
    var useSeparator = true;

    var datasetSize = getObjectSize(dataSet);
    for (var key in dataSet) {
        useSeparator = true;

        if (dataSet.hasOwnProperty(key)) {
            // if (clause == 'WHERE') {
            //     queryString += key;
            // }

            if (dataSet[key] === null) {
                queryString += escapeFieldName(key) + (clause == 'WHERE' ? " is NULL" : "=NULL");
            } else if (typeof dataSet[key] !== 'object') {
                queryString += escapeFieldName(key) + "=" + SqlString.escape(dataSet[key]);
            } else if (typeof dataSet[key] === 'object' && Object.prototype.toString.call(dataSet[key]) === '[object Array]' && dataSet[key].length > 0) {
                queryString += escapeFieldName(key) + " in ('" + dataSet[key].join("', '") + "')";
            } else {
                useSeparator = false;
                datasetSize = datasetSize - 1;
            }

            if (y < datasetSize && useSeparator) {
                queryString += separator;
                y++;
            }
        }
    }
    if (getObjectSize(dataSet) > 0) {
        queryString = ' ' + clause + ' ' + queryString;
    }
    return queryString;
};



GlobalDb3.prototype.buildJoinString = function () {
    var joinString = '';

    for (var i = 0; i < this.joinClause.length; i++) {
        joinString += (this.joinClause[i].direction !== '' ? ' ' + this.joinClause[i].direction : '') + ' JOIN ' + escapeFieldName(this.joinClause[i].table) + ' ON ' + this.joinClause[i].relation;
    }

    return joinString;
};

var mergeObjects = function () {
    for (var i = 1; i < arguments.length; i++) {
        for (var key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key)) {
                arguments[0][key] = arguments[i][key];
            }
        }
    }
    return arguments[0];
};

var getObjectSize = function (object) {
    var size = 0;
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            size++;
        }
    }
    return size;
};

GlobalDb3.prototype.get_query = function (tableName) {
    var combinedQueryString;
    if (typeof tableName === 'string') {
        combinedQueryString = 'SELECT ' + (this.selectClause.length === 0 ? '*' : this.selectClause.join(','))
            + ' FROM ' + escapeFieldName(tableName)
            + this.buildJoinString()
            + this.buildDataString(this.whereClause, ' AND ', 'WHERE')
            + (this.groupByClause !== '' ? ' GROUP BY ' + this.groupByClause : '')
            + (this.havingClause !== '' ? ' HAVING ' + this.havingClause : '')
            + (this.orderByClause !== '' ? ' ORDER BY ' + this.orderByClause : '')
            + (this.limitClause !== -1 ? ' LIMIT ' + this.limitClause : '')
            + (this.offsetClause !== -1 ? ' OFFSET ' + this.offsetClause : '');
    }
    return combinedQueryString;
}

GlobalDb3.prototype.update = async function (tableName, newData, responseCallback) {


    var def = Q.defer();
    var combinedQueryString = 'UPDATE ' + escapeFieldName(tableName)
        + this.buildDataString(newData, ', ', 'SET')
        + this.buildDataString(this.whereClause, ' AND ', 'WHERE')
        + (this.limitClause !== -1 ? ' LIMIT ' + this.limitClause : '');
    var db = this.get_db();
    db['load_query'] = true;

    db.query(combinedQueryString, [], function (err, result) {

        if (err) {
            console.log(err);
        }
        db['load_query'] = false;
        if (typeof (responseCallback) == 'function') {
            responseCallback(err, result);
        }
        def.resolve(result);
    })
    this.resetQuery();
    return def.promise;
}

GlobalDb3.prototype.updateMany = async function (tableName, newData, responseCallback) {
    return this.update(tableName, newData, responseCallback);
}

GlobalDb3.prototype.delete = async function (tableName, responseCallback) {


    var def = Q.defer();
    var combinedQueryString = 'DELETE FROM ' + escapeFieldName(tableName)
        + buildDataString(this.whereClause, ' AND ', 'WHERE')
        + (this.limitClause !== -1 ? ' LIMIT ' + this.limitClause : '');
    var db = this.get_db();
    db['load_query'] = true;

    db.query(combinedQueryString, [], function (err, result) {

        if (err) {
            console.log(err);
        }
        db['load_query'] = false;
        if (typeof (responseCallback) == 'function') {
            responseCallback(err, result);
        }
        def.resolve(result);
    })

    this.resetQuery();
    return def.promise;
}

GlobalDb3.prototype.resetQuery = function () {
    this.whereClause = {};
    this.selectClause = [];
    this.orderByClause = '';
    this.groupByClause = '';
    this.havingClause = '',
        this.limitClause = -1;
    this.offsetClause = -1;
    this.joinClause = [];
};

GlobalDb3.prototype.get = async function (tableName, responseCallback) {


    var def = Q.defer();
    var combinedQueryString = this.get_query(tableName);
    if (combinedQueryString) {
        var db = this.get_db();
        db['load_query'] = true;
        console.log(combinedQueryString);
        db.query(combinedQueryString, [], function (err, rows) {
            if (typeof (responseCallback) == 'function') {
                responseCallback(err, rows);
            }
            db['load_query'] = false;
            if (err) {
                console.log('query', err);
                def.resolve(false);
            } else {
                def.resolve(rows);
            }
        })
    }
    this.resetQuery();
    return def.promise;
}

GlobalDb3.prototype.count = async function (tableName, responseCallback) {


    var def = Q.defer();
    if (typeof tableName === 'string') {
        var query = 'SELECT COUNT(*) as count FROM ' + escapeFieldName(tableName)
            + this.buildJoinString()
            + this.buildDataString(this.whereClause, ' AND ', 'WHERE');

        var db = this.get_db();
        db['load_query'] = true;

        db.query(query, [], function (err, rows) {

            if (typeof (responseCallback) == 'function') {
                responseCallback(err, rows);
            }
            db['load_query'] = false;
            if (err) {
                console.log('query', err);
                def.resolve(false);
            } else {
                def.resolve(rows);
            }
        })
    }
    this.resetQuery();

    return def.promise;
};

GlobalDb3.prototype.queryUpdate = async function (query, dataset = [], responseCallback) {
    var def = Q.defer();
    var db = this.get_db();
    db['load_query'] = true;

    db.query(query, dataset, function (err, rows) {

        if (typeof (responseCallback) == 'function') {
            responseCallback(err, rows);
        }
        db['load_query'] = false;
        if (err) {
            console.log('query', err);
            def.resolve(false);
        } else {
            def.resolve(rows);
        }
    })
    return def.promise;
}

GlobalDb3.prototype.query = async function (query, dataset = [], responseCallback) {
    var def = Q.defer();
    var db = this.get_db();
    db['load_query'] = true;
    db.query(query, dataset, function (err, rows) {
        if (typeof (responseCallback) == 'function') {
            responseCallback(err, rows);
        }
        db['load_query'] = false;
        if (err) {
            console.log('query', err);
            def.resolve(false);
        } else {
            def.resolve(rows);
        }
    }, 'executeUpdate');
    return def.promise;
}

GlobalDb3.prototype.connectionDB = function () {
    var def = Q.defer();
    def.resolve(true);
    return def.promise;
}