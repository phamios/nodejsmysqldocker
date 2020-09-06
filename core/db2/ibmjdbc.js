exports = module.exports = ibmjdbc;
var JDBC = require('jdbc');
var jinst = require('jdbc/lib/jinst');
var asyncjs = require('async');
var SqlString = require('./SqlString');
var Q = require('q');
if (!jinst.isJvmCreated()) {
    jinst.addOption("-Xrs");
    jinst.setupClasspath([__dirname.replace(/\\/gi, '/') + '/drivers/db2jcc4.jar']);
}
function escapeString(val) {
    val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function (s) {
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
    });
    return val;
}
function ibmjdbc(settings) {
    var config = {
        url: 'jdbc:db2://' + settings.server + ':' + settings.port + '/BLUDB:currentSchema=' + settings.database + ';',
        drivername: 'com.ibm.db2.jcc.DB2Driver',
        minpoolsize: 1,
        maxpoolsize: 10,
        properties: {
            user: settings.username,
            password: settings.password
        },
        keepalive : {
            interval: 600000000,
            query: 'select 1',
            enabled: true
          }
    };
    var that = this;
    this.ibmi = false;
    this.connObj = false;
    this.statement = null;
    

    this.reset = function(err = false) {
        if(err && typeof(err) == 'object') {
            err = JSON.stringify(err);
        }
        if(!err || err.match(/(statement is closed)|(socket write error)/gi) || err == '{"cause":{}}') {
            this.ibmi = false;
            this.connObj = false;
            this.statement = null;
            return true;
        }
        return false;
    }

    this.release = async function (connObj) {
        if (connObj) {
            var def = Q.defer();
            this.ibmi.release(connObj, function (err) {
                if (err) {
                    console.log(err.message);
                }
                def.resolve(err);
            });
            return def.promise;
        } else {
            return Promise.resolve(true);
        }
    }

    this.reserve = async function () {
        var def = Q.defer();
        var that = this;
        if (!this.connObj) {
            this.ibmi.reserve(function (err, connObj) {
                if (connObj) {
                    that.connObj = connObj;
                    def.resolve(that.connObj);
                } else {
                    console.log('reserve', err);
                    def.resolve(null);
                }
            })
        } else {
            def.resolve(this.connObj);
        }
        return def.promise;
    }
    
    this.createStatement = async function () {
        var that = this;
        var def = Q.defer();
        this.connObj.conn.createStatement(function (err, statement) {
            if (err) {
                console.log('createStatement', err);
                def.resolve(null);
            } else {
                that.statement = statement;
                def.resolve(that.statement);
            }
        });
        return def.promise;
    }

    this.connect = async function () {
        if(!this.ibmi) {
            this.ibmi = new JDBC(config);
            this.connObj = false;
            this.statement = null;
            this.ibmi.initialize(function (err) {
                if (err) {
                    that.ibmi = false;
                }
            });
        }
        if (!this.connObj) {
            var r1 = await this.reserve();
            if (!r1) { return Promise.resolve(null); }
            this.statement = null;
        }
        if (!this.statement) {
            var r1 = await this.createStatement();
            if (!r1) { return Promise.resolve(null); }
        }
        return Promise.resolve(true);
    }

    this.queryPrepareStatement = async function (query, params = [], func) {
        var def = Q.defer();
        if (!this.connObj) {
            var r1 = await this.reserve();
            if (!r1) { def.resolve(null); }
        }

        this.connObj.conn.prepareStatement(query, function (err, stmt) {
            if (err) { console.log(err); def.resolve(null); }
            for (var i in params) {
                var item = params[i];
                var field_func = 'setString';
                switch (typeof (item)) {
                    case 'number': field_func = 'setInt'; break;
                    case 'object': field_func = 'setString'; break;
                    case 'string': field_func = 'setString'; break;
                    case 'boolean': field_func = 'setBoolean'; break;
                    default: field_func = 'setString';
                }
                stmt[field_func](i + 1, item, function (errr) {
                    console.log(errr);
                });
            }
            stmt.executeQuery(function (err, resultset) {
                if (err) {
                    console.log('executeQuery', err);
                    that.reset(err);
                    if (typeof (func) == 'function') { func(err, null); }
                    def.resolve(null);
                } else {
                    // console.log('haha');
                    resultset.toObjArray(function (err, results) {
                        if (typeof (func) == 'function') { func(err, results); }
                        def.resolve(results);
                    });
                }
            });
        })
        return def.promise;
    }

    this.queryUpdate = async function (query, params = [], func, options = {}) {
        var that = this;
        var r1 = await this.connect();
        if (!r1) {
            if (typeof (func) == 'function') {
                func('error', null);
            }
            return Promise.resolve(null);
        }
        var def = Q.defer();
        for (var v of params) {
            query = query.replace('?', typeof (v) == 'string' ? ("'" + escapeString(v) + "'") : v);
        }
        // console.log('ibmjdbc queryUpdate', query);
        this.statement.executeUpdate(query, function (err, resultset) {
            if (err) {
                console.log('executeUpdate', err);
                that.reset(err);
                if (typeof (func) == 'function') { func(err, null); }
                def.resolve(null);
            } else {
                if (typeof (func) == 'function') { func(err, resultset); }
                def.resolve(resultset);
            }
        });

        return def.promise;
    }

    this.query = async function (query, params = [], func) {
        var that = this;
        var r1 = await this.connect();
        if (!r1) {
            if (typeof (func) == 'function') {
                func('error', null);
            }
            return Promise.resolve(null);
        }
        var def = Q.defer();
        for (var v of params) {
            query = query.replace('?', typeof (v) == 'string' ? ("'" + escapeString(v) + "'") : v);
        }
        // console.log('ibmjdbc query', query);
        this.statement.executeQuery(query, function (err, resultset) {
            if (err) {
                console.log('executeQuery', err);
                that.reset(err);
                if (typeof (func) == 'function') { func(err, null); }
                def.resolve(null);
            } else {
                // console.log('haha');
                resultset.toObjArray(function (err, results) {
                    if (typeof (func) == 'function') { func(err, results); }
                    def.resolve(results);
                });
            }
        });

        return def.promise;
    }


    this.queryCursor = async function (query, params = [], func) {
        var that = this;
        var r1 = await this.connect();
        if (!r1) {
            if (typeof (func) == 'function') {
                func('error', null);
            }
            return Promise.resolve(null);
        }
        var def = Q.defer();
        for (var v of params) {
            query = query.replace('?', typeof (v) == 'string' ? ("'" + escapeString(v) + "'") : v);
        }
        this.statement.executeQuery(query, function (err, resultset) {
            if (err) {
                console.log('executeQuery', err);
                that.reset(err);
                if (typeof (func) == 'function') { func(err, null); }
                def.resolve(null);
            } else {
                resultset.toObjectIter(function (err, rs) {
                    if (err) {
                        console.log(err);
                        return def.resolve(false);
                    }
                    if (typeof (func) == 'function') { func(err, rs.rows); }
                    def.resolve(rs.rows);
                    return false;
                });
            }
        });
        return def.promise;
    }

}
