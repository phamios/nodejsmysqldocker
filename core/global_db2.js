exports = module.exports = GlobalDb2;
var config = require('../config/config');
var ibmjdbc = require('./db2/ibmjdbc');
// var ibmdb = require('ibm_db');
var util = require('util');
var extend = require('extend');
const Q = require('q');
function GlobalDb2(settings) {
    this.init();
    this.settings = settings;
} 
function trim(s) {
    var l = 0, r = s.length - 1;
    while (l < s.length && s[l] == ' ') {
        l++;
    }
    while (r > l && s[r] == ' ') {
        r -= 1;
    }
    return s.substring(l, r + 1);
};
function escapeString(val) {
    val = typeof(val) == 'string' ? val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function (s) {
        switch (s) {
            case "\0": return "\\0";
            case "\n": return "\\n";
            case "\r": return "\\r";
            case "\b": return "\\b";
            case "\t": return "\\t";
            case "\x1a": return "\\Z";
            case "'": return "''";
            default: return "\\" + s;
        }
    }) : null;
    return val;
}
GlobalDb2.prototype.init = function() {

    this.list_cache_db = [];
    this.limit_cache = 100;
    this.db = null;
    this.limitClause = -1;
    this.offsetClause = -1;
    this.selectClause = [];
    this._sort = null;
    this.whereClause = {};
    this.joinClause = [];
    this.groupByClause = '',
    this.havingClause = '',
    this.orderByClause = '';

}

GlobalDb2.prototype.extractText = function(tag, str){    
    tL = tag.length; //tag length
    tP = str.indexOf(tag); // position of tag
    sT = str.substr((tP+tL)); //remaining string after tag          
    cT = sT.indexOf(tag); //closing tag position
    return sT.substring(0,cT)
}

GlobalDb2.prototype.toDb2type = function(type) {
    var open = type.indexOf("(");
    var close = type.indexOf(")");
    var size = undefined;
    var decimal = undefined;
    if(open && close)
    {
        var size_ = type.substring(open,close);
        var ifdecimal = size_.split(",");
        if(ifdecimal.length==2){
            size = ifdecimal[0];
            decimal = ifdecimal[1];
        }
        this.extractText();
    }
}


GlobalDb2.prototype.get_db = function() {
    for(var item of this.list_cache_db) {
        if(!item.flag_conection) {
            return item;
        }
    }
    if(this.list_cache_db.length < this.limit_cache) {
        var item = new ibmjdbc(this.settings);
        this.list_cache_db.push(item);
        return item;
    }
    return this.list_cache_db[Math.floor(Math.random() * this.limit_cache)];
}

GlobalDb2.prototype.where = function (whereSet, whereValue) {
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
GlobalDb2.prototype.limit = function (newLimit, newOffset) {
    if (typeof newLimit === 'number') {
        this.limitClause = newLimit;
    }
    if (typeof newOffset === 'number') {
        this.offsetClause = newOffset;
    }
    return this;
}
GlobalDb2.prototype.select = function (selectSet) {
    if (Object.prototype.toString.call(selectSet) === '[object Array]') {
        for (var i = 0; i < selectSet.length; i++) {
            this.selectClause.push(selectSet[i]);
        }
    }
    else {
        if (typeof selectSet === 'string') {
            var selectSetItems = selectSet.split(',');
            for (var i = 0; i < selectSetItems.length; i++) {
                this.selectClause.push(trim(selectSetItems[i]));
            }
        }
    }
    return this;
}
GlobalDb2.prototype.comma_separated_arguments = function (set) {
    var clause = '';
    if (Object.prototype.toString.call(set) === '[object Array]') {
        clause = set.join(', ');
    }
    else if (typeof set === 'string') {
        clause = set;
    }
    return clause;
};

GlobalDb2.prototype.join = function (tableName, relation, direction) {
    this.joinClause.push({
        table: tableName,
        relation: relation,
        direction: (typeof direction === 'string' ? trim(direction.toUpperCase()) : '')
    });
    return this;
};


GlobalDb2.prototype.group_by = function (set) {
    this.groupByClause = this.comma_separated_arguments(set);
    return that;
};

GlobalDb2.prototype.having = function (set) {
    this.havingClause = this.comma_separated_arguments(set);
    return this;
};
GlobalDb2.prototype.sort = function (set) {
    this.orderByClause = this.comma_separated_arguments(set);
    return this;
};
GlobalDb2.prototype.order_by = function (set) {
    this.orderByClause = this.comma_separated_arguments(set);
    return this;
}
GlobalDb2.prototype.insert = async function (tableName, dataSet, responseCallback) {
    return this.insertMany(tableName, [dataSet], responseCallback);
}



GlobalDb2.prototype.insertMany = async function (tableName, dataSet, responseCallback) {
    var def = Q.defer();
    if (!dataSet || !dataSet.length) {
        def.resolve(false);
    } else {
        var placemarks = [];
        var i = 0;
        var list_attr = [];
        for (var item of dataSet) {
            var row1 = [];
            for (var k in item) {
                if(typeof(item[k]) == 'string') {
                    row1.push("'" + escapeString(item[k]) + "'");
                } else if(item[k] === null || item[k] === null) {
                    row1.push('null');
                } else if(typeof(item[k]) == 'boolean') {
                    row1.push(item[k] ? 'true' : 'false');
                } else {
                    row1.push(item[k]);
                }
                
                if (i == 0) {
                    list_attr.push(k);
                }
            }
            placemarks.push('(' + row1.join(',') + ')');
            i = 1;
        }
        var sql = "INSERT INTO " + tableName + '(' + list_attr.join(',') + ') values ' + placemarks.join(',');
        var db = this.get_db();
        db.flag_conection = true;
        var type = 'queryUpdate';
        if(dataSet.length == 1) {
            sql = `select id from NEW TABLE (` + sql + `)`;
            type = 'query';
        }
        db[type](sql, [], function (err, result) {
            db.flag_conection = false;
            if (err) {
                console.log('GlobalDb2 insertMany',err);
            }   else {
                if(dataSet.length == 1) {
                    result = result[0];
                }
            }
            if (typeof (responseCallback) == 'function') {
                responseCallback(err, result);
            }
            def.resolve(result);
        })
    }
    return def.promise;
}


function escapeFieldName(key) {
    return key.replace(/`/gi,'');
    if (key.indexOf('`') >= 0) {
        return key;
    }
    if (key.match(/\./gi)) {
        return '`' + key.replace('.', '`.`') + '`';
    } else {
        return '`' + key + '`';
    }
}

GlobalDb2.prototype.buildDataString = function (dataSet, separator, clause) {
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
            if (dataSet[key] === null) {
                queryString += escapeFieldName(key) + (clause == 'WHERE' ? " is NULL" : "=NULL");
            }
            else if (typeof dataSet[key] !== 'object') {
                    if(typeof(dataSet[key]) == 'string') {
                        queryString += escapeFieldName(key) + " = '" + escapeString(dataSet[key]) + "' ";
                    } else if(dataSet[key] === null) {
                        if(clause == 'WHERE') {
                            queryString += escapeFieldName(key) + " IS NULL ";
                        } else {
                            queryString += escapeFieldName(key) + " = NULL ";
                        }
                        
                    } else {
                        queryString += escapeFieldName(key) + " = " + dataSet[key];
                    }
            } else if (Array.isArray(dataSet[key]) && dataSet[key].length > 0) {
                if(typeof(dataSet[key][0]) == 'number') {
                    queryString += escapeFieldName(key) + ' IN (' + dataSet[key].join(', ') + ')';
                } else {
                    for(var i in dataSet[key]) {
                        dataSet[key][i] = escapeString(dataSet[key][i]);
                    }
                    queryString += escapeFieldName(key) + " IN ('" + dataSet[key].join("', '") + "')";
                }
                
            }
            else {
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



GlobalDb2.prototype.buildJoinString = function () {
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

GlobalDb2.prototype.get_query = function (tableName) {
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

GlobalDb2.prototype.update = async function (tableName, newData, responseCallback) {
    var def = Q.defer();
    var combinedQueryString = 'UPDATE ' + escapeFieldName(tableName)
        + this.buildDataString(newData, ', ', 'SET')
        + this.buildDataString(this.whereClause, ' AND ', 'WHERE')
        + (this.limitClause !== -1 ? ' LIMIT ' + this.limitClause : '');
        var db = this.get_db();
        db.flag_conection = true;
        db.queryUpdate(combinedQueryString, [], function (err, result) {
        db.flag_conection = false;
        if (err) {
            console.log(err);
        }
        if (typeof (responseCallback) == 'function') {
            responseCallback(err, result);
        }
        def.resolve(result);
    })
    this.resetQuery();
    return def.promise;
}

GlobalDb2.prototype.updateMany = async function (tableName, newData, responseCallback) {
    return this.update(tableName, newData, responseCallback);
}

GlobalDb2.prototype.delete = async function (tableName, responseCallback) {
    var def = Q.defer();
    var combinedQueryString = 'DELETE FROM ' + escapeFieldName(tableName)
        + this.buildDataString(this.whereClause, ' AND ', 'WHERE')
        + (this.limitClause !== -1 ? ' LIMIT ' + this.limitClause : '');
        var db = this.get_db();
        db.flag_conection = true;
        // console.log('combinedQueryString', combinedQueryString);
    db.queryUpdate(combinedQueryString, [], function (err, result) {
        db.flag_conection = false;
        if (err) {
            console.log(err);
        }
        if (typeof (responseCallback) == 'function') {
            responseCallback(err, result);
        }
        def.resolve(result);
    })

    this.resetQuery();
    return def.promise;
}

GlobalDb2.prototype.resetQuery = function () {
    this.whereClause = {};
    this.selectClause = [];
    this.orderByClause = '';
    this.groupByClause = '';
    this.havingClause = '',
        this.limitClause = -1;
    this.offsetClause = -1;
    this.joinClause = [];
};

GlobalDb2.prototype.get = async function (tableName, responseCallback) {
    var def = Q.defer();
    var combinedQueryString = this.get_query(tableName);
    if (combinedQueryString) {
        var db = this.get_db();
        db.flag_conection = true;
        db.query(combinedQueryString, [], function (err, rows) {
            db.flag_conection = false;
            if (typeof (responseCallback) == 'function') {
                responseCallback(err, rows);
            }
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

GlobalDb2.prototype.count = function (tableName, responseCallback) {
    var def = Q.defer();
    if (typeof tableName === 'string') {
        var query = 'SELECT COUNT(*) as count FROM ' + escapeFieldName(tableName)
            + this.buildJoinString()
            + this.buildDataString(this.whereClause, ' AND ', 'WHERE');

            var db = this.get_db();
            db.flag_conection = true;
        db.query(query, [], function (err, rows) {
            db.flag_conection = false;
            if (typeof (responseCallback) == 'function') {
                responseCallback(err, rows);
            }
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

GlobalDb2.prototype.queryCursor = async function (query, dataset = [], responseCallback) {
    var def = Q.defer();
    var db = this.get_db();
    db.flag_conection = true;
    db.queryCursor(query, dataset, function (err, rows) {
        db.flag_conection = false;
        if (typeof (responseCallback) == 'function') {
            responseCallback(err, rows);
        }
        if (err) {
            console.log('queryCursor err ', query);
            def.resolve(false);
        } else {
            def.resolve(rows);
        }
    })
    return def.promise;
}

GlobalDb2.prototype.query = async function (query, dataset = [], responseCallback) {
    var def = Q.defer();
    var db = this.get_db();
    db.flag_conection = true;
    db.query(query, dataset, function (err, rows) {
        db.flag_conection = false;
        if (typeof (responseCallback) == 'function') {
            responseCallback(err, rows);
        }
        if (err) {
            console.log('query error', query);
            def.resolve(false);
        } else {
            def.resolve(rows);
        }
    })
    return def.promise;
}

GlobalDb2.prototype.queryUpdate = async function (query, dataset = [], responseCallback) {
    var def = Q.defer();
    var db = this.get_db();
    db.flag_conection = true;
    db.queryUpdate(query, dataset, function (err, rows) {
        db.flag_conection = false;
        if (typeof (responseCallback) == 'function') {
            responseCallback(err, rows);
        }
        if (err) {
            console.log('query update', query);
            def.resolve(false);
        } else {
            def.resolve(rows);
        }
    }, 'executeUpdate');
    return def.promise;
}

GlobalDb2.prototype.queryPrepareStatement = async function (query, dataset = [], responseCallback) {
    var def = Q.defer();
    var db = this.get_db();
    db.flag_conection = true;
    db.queryPrepareStatement(query, dataset, function (err, rows) {
        db.flag_conection = false;
        if (typeof (responseCallback) == 'function') {
            responseCallback(err, rows);
        }
        if (err) {
            console.log('query', err);
            def.resolve(false);
        } else {
            def.resolve(rows);
        }
    }, 'executeUpdate');
    return def.promise;
}

GlobalDb2.prototype.connectionDB = function () {
    var def = Q.defer();
    def.resolve();
    return def.promise;
}